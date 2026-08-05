import logging
import httpx
from langchain_core.documents import Document
from langchain_openai import ChatOpenAI, AzureChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq
from langchain_experimental.graph_transformers.diffbot import DiffbotGraphTransformer
from langchain_neo4j import LLMGraphTransformer
from langchain_neo4j.graph_transformers.llm import (
    DEFAULT_NODE_TYPE,
    GraphDocument,
    Node,
    Relationship,
    _Graph,
    _format_nodes,
    _format_relationships,
    _parse_and_clean_json,
    create_unstructured_prompt,
    validate_and_get_relationship_type,
)
# from src.shared.diffbot import DiffbotGraphTransformer, Graph
# from src.shared.diffbot import Graph
from langchain_anthropic import ChatAnthropic
from langchain_fireworks import ChatFireworks
from langchain_aws import ChatBedrock
from langchain_ollama import ChatOllama
import boto3
import google.auth
from src.shared.constants import ADDITIONAL_INSTRUCTIONS
from src.shared.llm_graph_builder_exception import LLMGraphBuilderException
import re
from langchain_core.callbacks.manager import CallbackManager
from src.shared.common_fn import UniversalTokenUsageHandler,get_value_from_env

MINIMAX_DEFAULT_BASE_URL = "https://api.minimax.io/v1"
DEFAULT_GRAPH_EXTRACTION_INSTRUCTIONS = (
    "请根据文档正文抽取知识图谱，重点识别人物、机构、地点、事件以及人物之间的亲属、朋友、同事、上下级、"
    "合作、冲突等关系。不要把文本块、压缩包文件名或章节编号当作业务实体。"
)

def should_disable_structured_output(model: str) -> bool:
    """Some OpenAI-compatible providers report tool support but return plain text."""
    normalized_model = (model or "").upper().replace(".", "_").replace("-", "_")
    return "MINIMAX" in normalized_model


def _build_openai_http_client():
    """Use direct egress instead of inheriting a broken system proxy."""
    return httpx.Client(trust_env=False)


def _flatten_graph_items(value):
    if isinstance(value, dict):
        return [value]
    if isinstance(value, list):
        items = []
        for item in value:
            items.extend(_flatten_graph_items(item))
        return items
    return []


def _filter_graph_by_schema(nodes, relationships, allowed_nodes, allowed_relationships, relationship_type):
    if allowed_nodes:
        lower_allowed_nodes = [node.lower() for node in allowed_nodes]
        nodes = [node for node in nodes if node.type.lower() in lower_allowed_nodes]
        relationships = [
            rel
            for rel in relationships
            if rel.source.type.lower() in lower_allowed_nodes and rel.target.type.lower() in lower_allowed_nodes
        ]
    if allowed_relationships:
        if relationship_type == "tuple":
            lower_allowed_relationships = [
                (source.lower(), rel_type.lower(), target.lower())
                for source, rel_type, target in allowed_relationships
            ]
            relationships = [
                rel
                for rel in relationships
                if (
                    rel.source.type.lower(),
                    rel.type.lower(),
                    rel.target.type.lower(),
                )
                in lower_allowed_relationships
            ]
        else:
            lower_allowed_relationships = [rel_type.lower() for rel_type in allowed_relationships]
            relationships = [rel for rel in relationships if rel.type.lower() in lower_allowed_relationships]
    return nodes, relationships


def _parse_unstructured_graph_json(parsed_json, allowed_nodes, allowed_relationships, relationship_type):
    if isinstance(parsed_json, dict) and "nodes" in parsed_json and "relationships" in parsed_json:
        nodes, relationships = _parse_and_clean_json(parsed_json)
        nodes, relationships = _format_nodes(nodes), _format_relationships(relationships)
        return _filter_graph_by_schema(nodes, relationships, allowed_nodes, allowed_relationships, relationship_type)

    nodes_set = set()
    relationships = []
    for rel in _flatten_graph_items(parsed_json):
        head = rel.get("head") or rel.get("source") or rel.get("source_node_id")
        tail = rel.get("tail") or rel.get("target") or rel.get("target_node_id")
        relation = rel.get("relation") or rel.get("type")
        if not head or not tail or not relation:
            continue
        head_type = rel.get("head_type") or rel.get("source_node_type") or DEFAULT_NODE_TYPE
        tail_type = rel.get("tail_type") or rel.get("target_node_type") or DEFAULT_NODE_TYPE
        nodes_set.add((head, head_type))
        nodes_set.add((tail, tail_type))
        relationships.append(
            Relationship(
                source=Node(id=head, type=head_type),
                target=Node(id=tail, type=tail_type),
                type=relation,
            )
        )

    nodes = [Node(id=node_id, type=node_type) for node_id, node_type in nodes_set]
    nodes, relationships = _format_nodes(nodes), _format_relationships(relationships)
    return _filter_graph_by_schema(nodes, relationships, allowed_nodes, allowed_relationships, relationship_type)


async def _convert_to_graph_documents_unstructured(
    llm,
    documents,
    allowed_nodes,
    allowed_relationships,
    additional_instructions,
):
    import json_repair

    relationship_type = validate_and_get_relationship_type(allowed_relationships, allowed_nodes)
    prompt = create_unstructured_prompt(
        allowed_nodes,
        allowed_relationships,
        relationship_type,
        (
            additional_instructions
            + "\nReturn only valid JSON. Do not include explanations, Markdown fences, or <think> blocks."
        ),
    )
    chain = prompt | llm
    graph_documents = []
    for document in documents:
        raw_schema = await chain.ainvoke({"input": document.page_content})
        raw_content = raw_schema if isinstance(raw_schema, str) else raw_schema.content
        parsed_json = json_repair.loads(raw_content)
        nodes, relationships = _parse_unstructured_graph_json(
            parsed_json,
            allowed_nodes,
            allowed_relationships,
            relationship_type,
        )
        graph_documents.append(GraphDocument(nodes=nodes, relationships=relationships, source=document))
    return graph_documents

def get_llm(model: str):
    """Retrieve the specified language model based on the model name."""
    model = model.upper().replace('.', '_').strip()
    env_key = f"LLM_MODEL_CONFIG_{model}"
    env_value = get_value_from_env(env_key)

    if not env_value:
        err = f"Environment variable '{env_key}' is not defined as per format or missing"
        logging.error(err)
        raise Exception(err)
    
    logging.info("Model: {}".format(env_key))
    callback_handler = UniversalTokenUsageHandler()
    callback_manager = CallbackManager([callback_handler])
    try:
        if "GEMINI" in model:
            model_name = env_value
            credentials, project_id = google.auth.default()
            llm = ChatGoogleGenerativeAI(
                model=model_name,
                vertexai=True,
                credentials=credentials,
                project=project_id,
                temperature=0,
                callbacks=callback_manager,
                safety_settings={
                    "HARM_CATEGORY_UNSPECIFIED": "BLOCK_NONE",
                    "HARM_CATEGORY_DANGEROUS_CONTENT": "BLOCK_NONE",
                    "HARM_CATEGORY_HATE_SPEECH": "BLOCK_NONE",
                    "HARM_CATEGORY_HARASSMENT": "BLOCK_NONE",
                    "HARM_CATEGORY_SEXUALLY_EXPLICIT": "BLOCK_NONE",
                },
            
            )
        elif "OPENAI" in model:
            model_name, api_key = env_value.split(",")
            if "MINI" in model:
                llm= ChatOpenAI(
                api_key=api_key,
                model=model_name,
                callbacks=callback_manager,
                http_client=_build_openai_http_client(),
                )
            else:
                llm = ChatOpenAI(
                api_key=api_key,
                model=model_name,
                temperature=0,
                callbacks=callback_manager,
                http_client=_build_openai_http_client(),
                )

        elif "AZURE" in model:
            model_name, api_endpoint, api_key, api_version = env_value.split(",")
            llm = AzureChatOpenAI(
                api_key=api_key,
                azure_endpoint=api_endpoint,
                azure_deployment=model_name,  # takes precedence over model parameter
                api_version=api_version,
                temperature=0,
                max_tokens=None,
                timeout=None,
                callbacks=callback_manager,
            )

        elif "ANTHROPIC" in model:
            model_name, api_key = env_value.split(",")
            anthropic_kwargs = {
                "api_key": api_key,
                "model": model_name,
                "timeout": None,
                "callbacks": callback_manager,
            }
            if not model_name.startswith("claude-opus-4-7"):
                anthropic_kwargs["temperature"] = 0
            llm = ChatAnthropic(**anthropic_kwargs)

        elif "FIREWORKS" in model:
            model_name, api_key = env_value.split(",")
            llm = ChatFireworks(api_key=api_key, model=model_name,callbacks=callback_manager)

        elif "MINIMAX" in model:
            minimax_config = [item.strip() for item in env_value.split(",")]
            if len(minimax_config) == 2:
                model_name, api_key = minimax_config
                api_endpoint = MINIMAX_DEFAULT_BASE_URL
            elif len(minimax_config) == 3:
                model_name, api_endpoint, api_key = minimax_config
            else:
                raise ValueError(
                    "MiniMax config must be 'model_name,api_key' or 'model_name,api_endpoint,api_key'"
                )
            llm = ChatOpenAI(
                api_key=api_key,
                base_url=api_endpoint,
                model=model_name,
                temperature=0,
                callbacks=callback_manager,
                http_client=_build_openai_http_client(),
            )

        elif "GROQ" in model:
            model_name, base_url, api_key = env_value.split(",")
            llm = ChatGroq(api_key=api_key, model_name=model_name, temperature=0,callbacks=callback_manager)

        elif "BEDROCK" in model:
            model_name, aws_access_key, aws_secret_key, region_name = env_value.split(",")
            bedrock_client = boto3.client(
                service_name="bedrock-runtime",
                region_name=region_name,
                aws_access_key_id=aws_access_key,
                aws_secret_access_key=aws_secret_key,
            )

            llm = ChatBedrock(
                client=bedrock_client,region_name=region_name, model_id=model_name, model_kwargs=dict(temperature=0),callbacks=callback_manager, 
            )

        elif "OLLAMA" in model:
            model_name, base_url = env_value.split(",")
            llm = ChatOllama(base_url=base_url, model=model_name,callbacks=callback_manager)

        elif "DIFFBOT" in model:
            #model_name = "diffbot"
            model_name, api_key = env_value.split(",")
            llm = DiffbotGraphTransformer(
                diffbot_api_key=api_key,
                extract_types=["entities", "facts"],
            )
            callback_handler = None
        
        else: 
            model_name, api_endpoint, api_key = env_value.split(",")
            llm = ChatOpenAI(
                api_key=api_key,
                base_url=api_endpoint,
                model=model_name,
                temperature=0,
                callbacks=callback_manager,
                http_client=_build_openai_http_client(),
            )
    except Exception as e:
        err = f"Error while creating LLM '{model}': {str(e)}"
        logging.error(err)
        raise Exception(err)
 
    logging.info(f"Model created - Model Version: {model}")
    return llm, model_name, callback_handler

def get_llm_model_name(llm):
    """Extract name of llm model from llm object"""
    for attr in ["model_name", "model", "model_id"]:
        model_name = getattr(llm, attr, None)
        if model_name:
            return model_name.lower()
    logging.info("Could not determine model name; defaulting to empty string")
    return ""

def get_combined_chunks(chunkId_chunkDoc_list, chunks_to_combine):
    combined_chunk_document_list = []
    combined_chunks_page_content = [
        "".join(
            document["chunk_doc"].page_content
            for document in chunkId_chunkDoc_list[i : i + chunks_to_combine]
        )
        for i in range(0, len(chunkId_chunkDoc_list), chunks_to_combine)
    ]
    combined_chunks_ids = [
        [
            document["chunk_id"]
            for document in chunkId_chunkDoc_list[i : i + chunks_to_combine]
        ]
        for i in range(0, len(chunkId_chunkDoc_list), chunks_to_combine)
    ]

    for i in range(len(combined_chunks_page_content)):
        combined_chunk_document_list.append(
            Document(
                page_content=combined_chunks_page_content[i],
                metadata={"combined_chunk_ids": combined_chunks_ids[i]},
            )
        )
    return combined_chunk_document_list

def get_chunk_id_as_doc_metadata(chunkId_chunkDoc_list):
    combined_chunk_document_list = [
       Document(
           page_content=document["chunk_doc"].page_content,
           metadata={"chunk_id": [document["chunk_id"]]},
       )
       for document in chunkId_chunkDoc_list
   ]
    return combined_chunk_document_list
      

async def get_graph_document_list(
    llm, combined_chunk_document_list, allowedNodes, allowedRelationship,callback_handler, additional_instructions=None, model_key=None
):
    if additional_instructions:
        additional_instructions = sanitize_additional_instruction(additional_instructions)
    extraction_instructions = DEFAULT_GRAPH_EXTRACTION_INSTRUCTIONS + " " + (additional_instructions if additional_instructions else "")
    graph_document_list = []
    token_usage = 0
    try:
        if "diffbot_api_key" in dir(llm):
            llm_transformer = llm
        else:
            use_custom_unstructured_parser = should_disable_structured_output(model_key)
            if use_custom_unstructured_parser:
                logging.info("Structured output disabled for model: %s", model_key)
                supports_structured_output = False
            else:
                try:
                    llm.with_structured_output(_Graph)
                    supports_structured_output = True
                except Exception:
                    supports_structured_output = False
            if supports_structured_output and not isinstance(llm, ChatGroq):
                logging.info("LLM supports structured output; including descriptions in graph")
                node_properties = ["description"]
                relationship_properties = ["description"]
                ignore_tool_usage = False
            else:
                logging.info("LLM does not support structured output; excluding descriptions in graph") 
                node_properties = False
                relationship_properties = False
                ignore_tool_usage = True
            
            if use_custom_unstructured_parser:
                graph_document_list = await _convert_to_graph_documents_unstructured(
                    llm,
                    combined_chunk_document_list,
                    allowedNodes,
                    allowedRelationship,
                    ADDITIONAL_INSTRUCTIONS + extraction_instructions,
                )
                llm_transformer = None
            else:
                llm_transformer = LLMGraphTransformer(
                    llm=llm,
                    node_properties=node_properties,
                    relationship_properties=relationship_properties,
                    allowed_nodes=allowedNodes,
                    allowed_relationships=allowedRelationship,
                    ignore_tool_usage=ignore_tool_usage,
                    additional_instructions=ADDITIONAL_INSTRUCTIONS + extraction_instructions
                )
        
        if isinstance(llm,DiffbotGraphTransformer):
            graph_document_list = llm_transformer.convert_to_graph_documents(combined_chunk_document_list)
        elif not graph_document_list:
            graph_document_list = await llm_transformer.aconvert_to_graph_documents(combined_chunk_document_list)
    except Exception as e:
       logging.error(f"Error in graph transformation: {e}", exc_info=True)
       raise LLMGraphBuilderException(f"Graph transformation failed: {str(e)}")
    finally:
        try:
            if callback_handler:
                usage = callback_handler.report()
                token_usage = usage.get("total_tokens", 0)
        except Exception as usage_err:
            logging.error(f"Error while reporting token usage: {usage_err}")

    return graph_document_list, token_usage

async def get_graph_from_llm(model, chunkId_chunkDoc_list, allowedNodes, allowedRelationship, chunks_to_combine, additional_instructions=None):
   try:
       llm, model_name,callback_handler = get_llm(model)
       logging.info(f"Using model: {model_name}")
    
       combined_chunk_document_list = get_combined_chunks(chunkId_chunkDoc_list, chunks_to_combine)
       logging.info(f"Combined {len(combined_chunk_document_list)} chunks")
    
       if allowedNodes:
           allowed_nodes = [node.strip() for node in allowedNodes.split(',') if node.strip()]
       else:
           allowed_nodes = []
       logging.info(f"Allowed nodes: {allowed_nodes}")
    
       allowed_relationships = []
       if allowedRelationship:
           items = [item.strip() for item in allowedRelationship.split(',') if item.strip()]
           if len(items) % 3 != 0:
               raise LLMGraphBuilderException("allowedRelationship must be a multiple of 3 (source, relationship, target)")
           for i in range(0, len(items), 3):
               source, relation, target = items[i:i + 3]
               if source not in allowed_nodes or target not in allowed_nodes:
                   raise LLMGraphBuilderException(
                       f"Invalid relationship ({source}, {relation}, {target}): "
                       f"source or target not in allowedNodes"
                   )
               allowed_relationships.append((source, relation, target))
           logging.info(f"Allowed relationships: {allowed_relationships}")
       else:
           logging.info("No allowed relationships provided")

       graph_document_list,token_usage = await get_graph_document_list(
           llm,
           combined_chunk_document_list,
           allowed_nodes,
           allowed_relationships,
           callback_handler,
           additional_instructions,
           model,
       )
       logging.info(f"Generated {len(graph_document_list)} graph documents")
       return graph_document_list, token_usage
   except Exception as e:
       logging.error(f"Error in get_graph_from_llm: {e}", exc_info=True)
       raise LLMGraphBuilderException(f"Error in getting graph from llm: {e}")

def sanitize_additional_instruction(instruction: str) -> str:
   """
   Sanitizes additional instruction by:
   - Replacing curly braces `{}` with `[]` to prevent variable interpretation.
   - Removing potential injection patterns like `os.getenv()`, `eval()`, `exec()`.
   - Stripping problematic special characters.
   - Normalizing whitespace.
   Args:
       instruction (str): Raw additional instruction input.
   Returns:
       str: Sanitized instruction safe for LLM processing.
   """
   logging.info("Sanitizing additional instructions")
   instruction = instruction.replace("{", "[").replace("}", "]")  # Convert `{}` to `[]` for safety
   # Step 2: Block dangerous function calls
   injection_patterns = [r"os\.getenv\(", r"eval\(", r"exec\(", r"subprocess\.", r"import os", r"import subprocess"]
   for pattern in injection_patterns:
       instruction = re.sub(pattern, "[BLOCKED]", instruction, flags=re.IGNORECASE)
   # Step 4: Normalize spaces
   instruction = re.sub(r'\s+', ' ', instruction).strip()
   return instruction
