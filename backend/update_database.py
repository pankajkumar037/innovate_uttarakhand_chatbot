import os
from dotenv import load_dotenv
from pymongo import MongoClient

from llama_index.core import VectorStoreIndex, SimpleDirectoryReader, Settings, StorageContext
from llama_index.core.node_parser import SemanticSplitterNodeParser
from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.llms.openai import OpenAI
from llama_index.vector_stores.azurecosmosmongo import AzureCosmosDBMongoDBVectorSearch

# Load environment variables
load_dotenv()

COSMOS_CONN_STR = os.getenv("COSMOS_CONN_STR")
DB_NAME = os.getenv("DB_NAME")
COLLECTION_NAME = os.getenv("COLLECTION_NAME")

PDF_DIR = "pdfs"

def main():
    print("Loading PDFs...")
    documents = SimpleDirectoryReader(PDF_DIR).load_data()
    print(f" Loaded {len(documents)} documents.")

    # Semantic splitter
    splitter = SemanticSplitterNodeParser(
        buffer_size=1,
        breakpoint_percentile_threshold=95,
        embed_model=Settings.embed_model,
    )

    # Mongo client + vector store
    client = MongoClient(COSMOS_CONN_STR, serverSelectionTimeoutMS=60000)
    vector_store = AzureCosmosDBMongoDBVectorSearch(
        mongodb_client=client,
        db_name=DB_NAME,
        collection_name=COLLECTION_NAME,
        dimension=1536,
        cosmos_search_kwargs={"kind": "vector-ivf", "numLists": 1, "similarity": "COS"},
    )

    storage_context = StorageContext.from_defaults(vector_store=vector_store)

    # Build index AND push data into CosmosDB
    index = VectorStoreIndex.from_documents(
        documents=documents,
        storage_context=storage_context,
        node_parser=splitter,
    )

    # Confirm write
    collection = client[DB_NAME][COLLECTION_NAME]
    print(f"Index built! Documents stored in CosmosDB: {collection.count_documents({})}")

if __name__ == "__main__":
    Settings.embed_model = OpenAIEmbedding(model="text-embedding-ada-002")
    Settings.llm = OpenAI(model="gpt-5-nano-2025-08-07")
    main()
