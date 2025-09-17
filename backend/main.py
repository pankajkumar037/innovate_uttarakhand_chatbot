from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict
import os
from dotenv import load_dotenv
from datetime import datetime, timezone
import uuid
import logging

from pymongo import MongoClient
from llama_index.core import VectorStoreIndex, Settings
from llama_index.core.memory import Memory
from llama_index.core.llms import ChatMessage
from llama_index.llms.openai import OpenAI
from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.vector_stores.azurecosmosmongo import AzureCosmosDBMongoDBVectorSearch

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Env variables
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
COSMOS_CONN_STR = os.getenv("COSMOS_CONN_STR")
DB_NAME = os.getenv("DB_NAME")
COLLECTION_NAME = os.getenv("COLLECTION_NAME")

if not all([OPENAI_API_KEY, COSMOS_CONN_STR, DB_NAME, COLLECTION_NAME]):
    raise ValueError("Missing required environment variables. Check your .env file.")

# FastAPI app
app = FastAPI(title="Innovate Uttarakhand Chatbot API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # you can restrict to frontend URL if needed
    allow_methods=["*"],
    allow_headers=["*"],
)

# OpenAI + Embedding Settings
Settings.llm = OpenAI(model="gpt-5-nano-2025-08-07", api_key=OPENAI_API_KEY)
Settings.embed_model = OpenAIEmbedding(model="text-embedding-ada-002", api_key=OPENAI_API_KEY)

# Global
vector_index = None
session_memories: Dict[str, Memory] = {}


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None


class ChatReply(BaseModel):
    response: str
    session_id: str
    timestamp: str


def get_vector_index():
    """Initialize or return cached vector index"""
    global vector_index
    if vector_index is None:
        try:
            client = MongoClient(COSMOS_CONN_STR, serverSelectionTimeoutMS=60000)
            vector_store = AzureCosmosDBMongoDBVectorSearch(
                mongodb_client=client,
                db_name=DB_NAME,
                collection_name=COLLECTION_NAME,
                dimension=1536,
                cosmos_search_kwargs={"kind": "vector-ivf", "numLists": 1, "similarity": "COS"},
            )
            vector_index = VectorStoreIndex.from_vector_store(vector_store=vector_store)
            logger.info(" Vector index loaded from Cosmos DB")
        except Exception as e:
            logger.error(f"Failed to load vector index: {e}")
            vector_index = None
    return vector_index


@app.on_event("startup")
async def startup_event():
    get_vector_index()


@app.post("/chat", response_model=ChatReply)
async def chat(message_data: ChatRequest):
    try:
        session_id = message_data.session_id or str(uuid.uuid4())
        index = get_vector_index()

        if not index:
            return ChatReply(
                response="Vector index not available. Please check the server logs.",
                session_id=session_id,
                timestamp=datetime.now(timezone.utc).isoformat(),
            )

        if session_id not in session_memories:
            session_memories[session_id] = Memory.from_defaults(session_id=session_id, token_limit=4000)

        retriever = index.as_retriever(similarity_top_k=5)
        nodes = retriever.retrieve(message_data.message)
        context = "\n\n".join([n.text for n in nodes])

        prompt = f"""
            ***ALWAYS REPLY IN SAME LANGUAGE AS THE QUESTION no mather wchih lanhugae context is in***
        You are an intelligent helpful assistant bot for Innovate Uttarakhand. 
        Use only the provided context to answer. 
        If the answer is not in the context, reply with:
        "मुझे इस प्रश्न का उत्तर नहीं मिला। कृपया Innovate Uttarakhand पोर्टल देखें।"
        OR
        "I could not find the answer to this question. Please visit the Innovate Uttarakhand portal."

        If the user greets, just say: "How can I help you?" in their language in question.

        **IF question query about hackathon or related to it ,automaticly consider it is for hackathon 2.0 in any language**

        Context:
        {context}

        Question: {message_data.message}
        """

        chat_history = session_memories[session_id].get_all()[-3:]
        messages = [ChatMessage(role=msg.role, content=msg.content) for msg in chat_history]
        messages.append(ChatMessage(role="user", content=prompt))

        llm_response = Settings.llm.chat(messages)
        response_text = llm_response.message.content

        # Save to memory
        session_memories[session_id].put(ChatMessage(role="user", content=message_data.message))
        session_memories[session_id].put(ChatMessage(role="assistant", content=response_text))

        return ChatReply(
            response=response_text,
            session_id=session_id,
            timestamp=datetime.now(timezone.utc).isoformat(),
        )

    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail="Error processing chat")


@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc)}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)