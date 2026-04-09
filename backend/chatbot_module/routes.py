from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from .rag_engine import retrieve_top_k
from .gemini_client import generate_response

router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    # optional: pass live predictions from other modules as context
    model_context: dict = None


class ChatResponse(BaseModel):
    reply: str
    sources_used: int


@router.get("/health")
async def chatbot_health():
    return {"status": "chatbot module is running"}


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    if not request.message or not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    try:
        # step 1: retrieve relevant knowledge chunks
        relevant_chunks = retrieve_top_k(request.message, k=4)

        # step 2: generate response using Gemini + retrieved context
        reply = generate_response(
            user_query=request.message,
            retrieved_chunks=relevant_chunks,
            model_context=request.model_context
        )

        return ChatResponse(reply=reply, sources_used=len(relevant_chunks))

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chatbot error: {str(e)}")
