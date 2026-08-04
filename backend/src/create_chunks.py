import logging
import re
from langchain_core.documents import Document
from langchain_neo4j import Neo4jGraph
from langchain_text_splitters import TokenTextSplitter

from src.document_sources.youtube import get_calculated_timestamps, get_chunks_with_timestamps
from src.shared.common_fn import get_value_from_env

logging.basicConfig(format="%(asctime)s - %(message)s", level="INFO")


class CreateChunksofDocument:
    """
    Class to handle splitting a list of documents (pages) into smaller chunks.
    """

    def __init__(self, pages: list[Document], graph: Neo4jGraph):
        """
        Initialize the chunk creator.

        Args:
            pages (list[Document]): List of langchain Document objects representing pages.
            graph (Neo4jGraph): Neo4j graph connection object.
        """
        self.pages = pages
        self.graph = graph

    def split_file_into_chunks(self, token_chunk_size: int, chunk_overlap: int, email: str):
        """
        Split a list of documents (pages) into chunks of fixed token size.

        Args:
            token_chunk_size (int): Number of tokens per chunk.
            chunk_overlap (int): Number of tokens to overlap between chunks.
            email (str): User email for chunk limiting logic.

        Returns:
            list[Document]: List of langchain Document chunks.
        """
        logging.info("Split file into smaller chunks")
        max_token_chunk_size = get_value_from_env("MAX_TOKEN_CHUNK_SIZE", 10000, "int")
        if not token_chunk_size or token_chunk_size < max_token_chunk_size:
            token_chunk_size = max_token_chunk_size
        if not chunk_overlap or chunk_overlap >= token_chunk_size:
            chunk_overlap = 0
        text_splitter = TokenTextSplitter(chunk_size=token_chunk_size, chunk_overlap=chunk_overlap)
        max_total_chars = get_value_from_env("MAX_TOTAL_CHARS_PER_FILE", 100000, "int")
        normalized_email = (email or "").strip().lower() or None
        is_neo4j_user = bool(normalized_email and normalized_email.endswith("@neo4j.com"))

        chunks = []
        first_metadata = self.pages[0].metadata

        if 'page' in first_metadata:
            # PDF or paginated document
            for i, document in enumerate(self.pages):
                page_number = i + 1
                for chunk in text_splitter.split_documents([document]):
                    chunks.append(Document(page_content=chunk.page_content, metadata={'page_number': page_number}))
        elif 'length' in first_metadata:
            # YouTube transcript or similar
            if len(self.pages) == 1 or (len(self.pages) > 1 and self.pages[1].page_content.strip() == ''):
                match = re.search(r'(?:v=)([0-9A-Za-z_-]{11})\s*', self.pages[0].metadata.get('source', ''))
                youtube_id = match.group(1) if match else None
                chunks_without_time_range = text_splitter.split_documents([self.pages[0]])
                if youtube_id:
                    chunks = get_calculated_timestamps(chunks_without_time_range, youtube_id)
                else:
                    chunks = chunks_without_time_range
            else:
                chunks_without_time_range = text_splitter.split_documents(self.pages)
                chunks = get_chunks_with_timestamps(chunks_without_time_range)
        else:
            logging.info("No pagination metadata found for pages, combining content before chunking")
            combined_text = "\n".join(page.page_content for page in self.pages if page.page_content)
            combined_metadata = dict(first_metadata or {})
            chunks = text_splitter.split_documents([Document(page_content=combined_text, metadata=combined_metadata)])

        for chunk in chunks:
            chunk.page_content = re.sub(r'\s+', ' ', chunk.page_content).strip()

        logging.info('Total chunks created: %d', len(chunks))
        if not is_neo4j_user:
            limited_chunks = []
            total_chars = 0
            for chunk in chunks:
                remaining_chars = max_total_chars - total_chars
                if remaining_chars <= 0:
                    break
                if len(chunk.page_content) > remaining_chars:
                    chunk.page_content = chunk.page_content[:remaining_chars]
                limited_chunks.append(chunk)
                total_chars += len(chunk.page_content)
            if len(limited_chunks) != len(chunks) or total_chars < sum(len(chunk.page_content) for chunk in chunks):
                logging.info('Non Neo4j user - limiting extracted text to %d characters', max_total_chars)
            chunks = limited_chunks

        return chunks
