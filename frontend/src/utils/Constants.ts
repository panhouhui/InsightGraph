import { NvlOptions } from '@neo4j-nvl/base';
import { GraphType, OptionType, PatternOption } from '../types';
import { chatModeLables, getDateTime, getDescriptionForChatMode } from './Utils';
import chatbotmessages from '../assets/ChatbotMessages.json';
import schemaExamples from '../assets/newSchema.json';
export const APP_SOURCES =
  import.meta.env.VITE_REACT_APP_SOURCES && import.meta.env.VITE_REACT_APP_SOURCES !== ''
    ? (import.meta.env.VITE_REACT_APP_SOURCES?.split(',') as string[])
    : ['s3', 'local', 'wiki', 'youtube', 'web'];

export const DEFAULT_LLM_MODEL = 'minimax_m3';

const prioritizeDefaultModel = (models: string[]) => {
  const cleanedModels = models.map((model) => model.trim()).filter(Boolean);
  if (!cleanedModels.includes(DEFAULT_LLM_MODEL)) {
    return [DEFAULT_LLM_MODEL, ...cleanedModels];
  }
  return [DEFAULT_LLM_MODEL, ...cleanedModels.filter((model) => model !== DEFAULT_LLM_MODEL)];
};

export const llms = import.meta.env?.VITE_LLM_MODELS?.trim()
  ? (import.meta.env.VITE_LLM_MODELS.split(',') as string[])
  : [
      'minimax_m3',
      'gemini_3.5_flash',
      'openai_gpt_5.5',
      'openai_gpt_5.4_mini',
      'gemini_3.1_pro_preview',
      'diffbot',
      'groq_llama3.1_8b',
      'anthropic_claude_4.7_opus',
      'anthropic_claude_4.5_haiku',
      'llama4_maverick',
      'bedrock_nova_pro_v1',
      'fireworks_deepseek_v4_flash',
      'fireworks_qwen3_6',
      'fireworks_gpt_oss',
      'fireworks_kimi_k2p6',
      'fireworks_glm_5.1',
    ];

export const orderedLlms = prioritizeDefaultModel(llms);

export const prodllms = import.meta.env.VITE_LLM_MODELS_PROD?.trim()
  ? (import.meta.env.VITE_LLM_MODELS_PROD.split(',') as string[])
  : ['minimax_m3', 'gemini_3.5_flash', 'openai_gpt_5.4_mini', 'diffbot', 'anthropic_claude_4.5_haiku'];

export const orderedProdLlms = prioritizeDefaultModel(prodllms);

export const chatModeReadableLables: Record<string, string> = {
  vector: '向量',
  graph: '图谱',
  graph_vector: '图谱 + 向量',
  fulltext: '全文检索',
  graph_vector_fulltext: '图谱 + 向量 + 全文检索',
  entity_vector: '实体检索 + 向量',
  unavailableChatMode: '选择文件时聊天模式不可用',
  selected: '已选择',
  global_vector: '全局检索 + 向量 + 全文检索',
};
export const chatModes = import.meta.env?.VITE_CHAT_MODES?.trim()
  ? import.meta.env.VITE_CHAT_MODES?.split(',').map((mode: string) => ({
      mode: mode.trim(),
      description: getDescriptionForChatMode(mode.trim()),
    }))
  : [
      {
        mode: chatModeLables.vector,
        description: '使用向量索引对文本块进行语义相似度搜索。',
      },
      {
        mode: chatModeLables.graph,
        description: '将文本转换为 Cypher 查询，从图数据库中精确检索数据。',
      },
      {
        mode: chatModeLables['graph+vector'],
        description: '结合向量索引和图谱连接，增强带上下文的语义搜索。',
      },
      {
        mode: chatModeLables.fulltext,
        description: '使用文本块全文索引进行快速关键词搜索。',
      },
      {
        mode: chatModeLables['graph+vector+fulltext'],
        description: '整合向量、图谱和全文索引，获得更全面的搜索结果。',
      },
      {
        mode: chatModeLables['entity search+vector'],
        description: '对实体节点使用向量索引，进行高相关性的实体搜索。',
      },
      {
        mode: chatModeLables['global search+vector+fulltext'],
        description:
          '对社区节点使用向量和全文索引，提供准确且具备上下文的全局答案。',
      },
    ];

export const chunkSize = import.meta.env.VITE_CHUNK_SIZE ? Number(import.meta.env.VITE_CHUNK_SIZE) : 1 * 1024 * 1024;
export const tokenchunkSize = import.meta.env.VITE_TOKENS_PER_CHUNK
  ? Number(import.meta.env.VITE_TOKENS_PER_CHUNK)
  : 100000;
export const chunkOverlap = import.meta.env.VITE_CHUNK_OVERLAP ? Number(import.meta.env.VITE_CHUNK_OVERLAP) : 0;
export const chunksToCombine = import.meta.env.VITE_CHUNK_TO_COMBINE
  ? Number(import.meta.env.VITE_CHUNK_TO_COMBINE)
  : 1;
export const defaultTokenChunkSizeOptions = [1000, 5000, 10000, 50000, 100000];
export const defaultChunkOverlapOptions = [0, 100, 500, 1000, 2000];
export const defaultChunksToCombineOptions = [1, 2, 3, 4, 5, 6];
export const DEFAULT_EXTRACTION_INSTRUCTIONS =
  '请根据文档正文抽取知识图谱，重点识别人物、机构、地点、事件以及人物之间的亲属、朋友、同事、上下级、合作、冲突等关系。不要把文本块、压缩包文件名或章节编号当作业务实体。';

export interface EmbeddingModelOption {
  provider: string;
  model: string;
  dimension: number;
  label: string;
  value: string;
}

export const embeddingModels: EmbeddingModelOption[] = [
  {
    provider: 'openai',
    model: 'text-embedding-3-large',
    dimension: 3072,
    label: 'OpenAI text-embedding-3-large',
    value: 'openai-text-embedding-3-large',
  },
  {
    provider: 'openai',
    model: 'text-embedding-3-small',
    dimension: 1536,
    label: 'OpenAI text-embedding-3-small',
    value: 'openai-text-embedding-3-small',
  },
  {
    provider: 'openai',
    model: 'text-embedding-ada-002',
    dimension: 1536,
    label: 'OpenAI text-embedding-ada-002',
    value: 'openai-text-embedding-ada-002',
  },
  {
    provider: 'gemini',
    model: 'gemini-embedding-001',
    dimension: 3072,
    label: 'Gemini gemini-embedding-001',
    value: 'gemini-gemini-embedding-001',
  },
  {
    provider: 'gemini',
    model: 'text-embedding-005',
    dimension: 768,
    label: 'Gemini text-embedding-005',
    value: 'gemini-text-embedding-005',
  },
  {
    provider: 'titan',
    model: 'amazon.titan-embed-text-v2:0',
    dimension: 1024,
    label: 'Titan amazon.titan-embed-text-v2:0',
    value: 'titan-amazon.titan-embed-text-v2:0',
  },
  {
    provider: 'titan',
    model: 'amazon.titan-embed-text-v1',
    dimension: 1536,
    label: 'Titan amazon.titan-embed-text-v1',
    value: 'titan-amazon.titan-embed-text-v1',
  },
  {
    provider: 'sentence-transformer',
    model: 'all-MiniLM-L6-v2',
    dimension: 384,
    label: 'Sentence Transformer all-MiniLM-L6-v2',
    value: 'sentence-transformer-all-MiniLM-L6-v2',
  },
];
export const DEFAULT_EMBEDDING_MODEL: EmbeddingModelOption = {
  provider: 'sentence-transformer',
  model: 'all-MiniLM-L6-v2',
  dimension: 384,
  label: 'Sentence Transformer all-MiniLM-L6-v2',
  value: 'sentence-transformer-all-MiniLM-L6-v2',
};

export const timeperpage = import.meta.env.VITE_TIME_PER_PAGE ? Number(import.meta.env.VITE_TIME_PER_PAGE) : 50;
export const timePerByte = 0.2;
export const largeFileSize = import.meta.env.VITE_LARGE_FILE_SIZE
  ? Number(import.meta.env.VITE_LARGE_FILE_SIZE)
  : 5 * 1024 * 1024;

export const tooltips = {
  generateGraph: '从选中文件生成图谱',
  deleteFile: '选择一个或多个文件进行删除',
  showGraph: '预览生成的图谱。',
  bloomGraph: '在 Bloom 中可视化图谱',
  deleteSelectedFiles: '个文件将被删除',
  previewGraphSelectedFiles: '个文件可预览图谱',
  documentation: '文档',
  github: 'GitHub Issues',
  theme: '浅色 / 深色模式',
  settings: '实体图谱抽取设置',
  chat: '开始聊天',
  sources: '上传文件',
  deleteChat: '删除',
  maximise: '最大化',
  copy: '复制到剪贴板',
  copied: '已复制',
  stopSpeaking: '停止朗读',
  textTospeech: '文本转语音',
  createSchema: '从文本定义 Schema',
  useExistingSchema: '从数据库获取 Schema',
  clearChat: '清空聊天记录',
  continue: '继续',
  clearGraphSettings: '清除已配置的图谱 Schema',
  applySettings: '应用图谱 Schema',
  openChatPopout: '聊天',
  downloadChat: '下载对话',
  visualizeGraph: '可视化图谱 Schema',
  additionalInstructions: '分析 Schema 指令',
  predinedSchema: '预定义 Schema',
  dataImporterJson: '数据导入器 JSON',
};
export const PRODMODELS = [
  'minimax_m3',
  'gemini_3.5_flash',
  'openai_gpt_5.4_mini',
  'diffbot',
  'anthropic_claude_4.5_haiku',
];
export const modelTooltipMap: Record<string, string> = {
  'gemini_3.5_flash': 'gemini-3.5-flash',
  minimax_m3: 'MiniMax-M3',
};
export const buttonCaptions = {
  exploreGraphWithBloom: '探索图谱',
  showPreviewGraph: '预览图谱',
  deleteFiles: '删除文件',
  generateGraph: '生成图谱',
  dropzoneSpan: '文档、图片、非结构化文本',
  youtube: 'Youtube',
  gcs: 'GCS',
  amazon: 'Amazon S3 存储桶',
  noLables: '数据库中未找到标签',
  dropYourCreds: '将 Neo4j 凭据文件拖到这里',
  analyze: '分析文本并抽取图谱 Schema',
  connect: '连接',
  disconnect: '断开连接',
  submit: '提交',
  connectToNeo4j: '连接 Neo4j',
  cancel: '取消',
  details: '详情',
  continueSettings: '继续',
  clearSettings: '清除 Schema',
  ask: '提问',
  applyGraphSchema: '应用',
  provideAdditionalInstructions: '提供实体抽取处理配置',
  analyzeInstructions: '分析指令',
  helpInstructions: '提供实体抽取的具体指令，例如聚焦关键主题。',
  importDropzoneSpan: 'JSON 文档',
};

export const URLS = {
  DOCUMENT_INTELLIGENCE: 'https://console.neo4j.io/document-intelligence',
  DOCUMENTATION: 'https://neo4j.com/labs/genai-ecosystem/llm-graph-builder',
  GITHUB_ISSUES: 'https://github.com/panhouhui/InsightGraph/edit/main/README.md',
};

export const POST_PROCESSING_JOBS: { title: string; description: string }[] = [
  {
    title: 'materialize_text_chunk_similarities',
    description: `此选项会优化知识图谱中文本块之间的连接。它使用 K 近邻算法和相似度阈值（KNN_MIN_SCORE 为 0.8）识别并连接语义相似度较高的文本块，从而形成更连贯的知识表示，并提升搜索结果的准确性和相关性。`,
  },
  {
    title: 'enable_hybrid_search_and_fulltext_search_in_bloom',
    description: `此选项会优化知识图谱的搜索能力。它会基于数据库标签重建全文索引，让信息检索更快、更高效；对于大型知识图谱尤其有用，可明显提升关键词搜索和整体查询性能。`,
  },
  {
    title: 'materialize_entity_similarities',
    description: `此选项会为实体生成可表达语义含义的数值表示（嵌入），增强实体分析能力，便于进行相似实体聚类、重复实体识别和基于相似度的搜索。`,
  },
  {
    title: 'enable_communities',
    description: '此选项会在实体之间创建社区，用于支持 GraphRAG 的局部搜索和全局搜索能力。',
  },
  {
    title: 'graph_schema_consolidation',
    description:
      '此选项会使用 LLM 合并大型图谱结构中的节点标签和关系类型，将其整理为更少、更相关的结构，并应用到已抽取和已有的图谱中。',
  },
];
export const RETRY_OPIONS = [
  'start_from_beginning',
  'delete_entities_and_start_from_beginning',
  'start_from_last_processed_position',
];
export const batchSize: number = Number(import.meta.env.VITE_BATCH_SIZE ?? '2');

// Graph Constants
export const document = `+ [docs]`;

export const chunks = `+ collect { MATCH p=(c)-[:NEXT_CHUNK]-() RETURN p } // chunk-chain
+ collect { MATCH p=(c)-[:SIMILAR]-() RETURN p } // similar-chunks`;

export const entities = `+ collect { OPTIONAL MATCH (c:Chunk)-[:HAS_ENTITY]->(e), p=(e)-[*0..1]-(:!Chunk) RETURN p}`;

export const docEntities = `+ [docs] 
+ collect { MATCH (c:Chunk)-[:HAS_ENTITY]->(e), p=(e)--(:!Chunk) RETURN p }`;

export const docChunks = `+[chunks]
+collect {MATCH p=(c)-[:FIRST_CHUNK]-() RETURN p} //first chunk
+ collect { MATCH p=(c)-[:NEXT_CHUNK]-() RETURN p } // chunk-chain
+ collect { MATCH p=(c)-[:SIMILAR]-() RETURN p } // similar-chunk`;

export const chunksEntities = `+ collect { MATCH p=(c)-[:NEXT_CHUNK]-() RETURN p } // chunk-chain

+ collect { MATCH p=(c)-[:SIMILAR]-() RETURN p } // similar-chunks
//chunks with entities
+ collect { OPTIONAL MATCH p=(c:Chunk)-[:HAS_ENTITY]->(e)-[*0..1]-(:!Chunk) RETURN p }`;

export const docChunkEntities = `+[chunks]
+collect {MATCH p=(c)-[:FIRST_CHUNK]-() RETURN p} //first chunk
+ collect { MATCH p=(c)-[:NEXT_CHUNK]-() RETURN p } // chunk-chain
+ collect { MATCH p=(c)-[:SIMILAR]-() RETURN p } // similar-chunks
//chunks with entities
+ collect { OPTIONAL MATCH p=(c:Chunk)-[:HAS_ENTITY]->(e)-[*0..1]-(:!Chunk) RETURN p }`;

export const nvlOptions: NvlOptions = {
  allowDynamicMinZoom: true,
  disableWebGL: true,
  maxZoom: 3,
  minZoom: 0.05,
  relationshipThreshold: 0.55,
  useWebGL: false,
  instanceId: 'graph-preview',
  initialZoom: 1,
};

export const queryMap: {
  Document: string;
  Chunks: string;
  Entities: string;
  DocEntities: string;
  DocChunks: string;
  ChunksEntities: string;
  DocChunkEntities: string;
} = {
  Document: 'document',
  Chunks: 'chunks',
  Entities: 'entities',
  DocEntities: 'docEntities',
  DocChunks: 'docChunks',
  ChunksEntities: 'chunksEntities',
  DocChunkEntities: 'docChunkEntities',
};

// export const graphQuery: string = queryMap.DocChunkEntities;
export const graphView: OptionType[] = [
  { label: '文本块图谱', value: queryMap.DocChunks },
  { label: '实体图谱', value: queryMap.Entities },
  { label: '知识图谱', value: queryMap.DocChunkEntities },
];

export const intitalGraphType = (isGDSActive: boolean): GraphType[] => {
  return isGDSActive
    ? ['DocumentChunk', 'Entities', 'Communities'] // GDS is active, include communities
    : ['DocumentChunk', 'Entities']; // GDS is inactive, exclude communities
};

export const graphLabels = {
  showGraphView: 'showGraphView',
  chatInfoView: 'chatInfoView',
  generateGraph: '已生成图谱',
  inspectGeneratedGraphFrom: '查看生成图谱，来源：',
  document: '文档',
  chunk: '文本块',
  documentChunk: '文档与文本块',
  entities: '实体',
  resultOverview: '结果概览',
  totalNodes: '节点总数',
  noEntities: '未找到实体',
  selectCheckbox: '请至少选择一个图谱类型',
  totalRelationships: '关系总数',
  nodeSize: 30,
  docChunk: '文档与文本块',
  community: '社区',
  noNodesRels: '没有节点和关系',
  neighborView: 'neighborView',
  chunksInfo: '当前展示的是从文档正文抽取的实体关系图',
  showSchemaView: 'showSchemaView',
  renderSchemaGraph: '来自数据库 Schema 的图谱',
  generatedGraphFromUserSchema: '来自用户自定义 Schema 的生成图谱',
};

export const RESULT_STEP_SIZE = 25;

export const connectionLabels = {
  notConnected: '未连接',
  graphDataScience: '图数据科学',
  graphDatabase: '图数据库',
  greenStroke: 'green',
  redStroke: 'red',
};

export const getDefaultMessage = () => {
  return [{ ...chatbotmessages.listMessages[0], datetime: getDateTime() }];
};

export const appLabels = {
  ownSchema: '或自定义图谱结构',
  predefinedSchema: '选择预定义图谱结构',
  chunkingConfiguration: '选择分块配置',
  graphPatternTuple: '图谱模式',
  selectedPatterns: '已选择的图谱模式',
  dataImporterSchema: '来自数据导入器的图谱结构',
};

export const LLMDropdownLabel = {
  disabledModels: '部分模型仅在开发版本可用。更多模型请查看',
  devEnv: '开发环境',
};
export const getDefaultSchemaExamples = () => {
  return schemaExamples.map((example) => ({
    label: example.schema,
    value: JSON.stringify(example.triplet),
  }));
};

export function mergeNestedObjects(objects: Record<string, Record<string, number>>[]) {
  return objects.reduce((merged, obj) => {
    for (const key in obj) {
      if (!merged[key]) {
        merged[key] = {};
      }
      for (const innerKey in obj[key]) {
        merged[key][innerKey] = obj[key][innerKey];
      }
    }
    return merged;
  }, {});
}
export function getStoredSchema() {
  const storedSchemas = localStorage.getItem('selectedSchemas');
  if (storedSchemas) {
    const parsedSchemas = JSON.parse(storedSchemas);
    return parsedSchemas.selectedOptions;
  }
  return [];
}
export const metricsinfo: Record<string, string> = {
  faithfulness: '判断回答是否准确反映了已提供的信息。',
  answer_relevancy: '判断回答是否切合用户的问题。',
  rouge_score: '判断生成答案与参考答案在字面上的匹配程度。',
  semantic_score: '判断生成答案是否理解了参考答案的语义。',
  context_entity_recall: '判断生成答案和检索上下文中共同出现实体的召回情况。',
};
export const SKIP_AUTH = (import.meta.env.VITE_SKIP_AUTH ?? 'true') == 'true';

export const sourceOptions: PatternOption[] = [{ label: '人物', value: 'Person' }];
export const typeOptions: PatternOption[] = [{ label: '任职于', value: 'WORKS_FOR' }];
export const targetOptions: PatternOption[] = [{ label: '公司', value: 'Company' }];

export const LOCAL_KEYS = {
  source: 'customSourceOptions',
  type: 'customTypeOptions',
  target: 'customTargetOptions',
};
