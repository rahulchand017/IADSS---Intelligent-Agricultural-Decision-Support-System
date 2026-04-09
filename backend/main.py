# IADSS - Intelligent Agricultural Decision Support System
# main.py — FastAPI Application Entry Point

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import logging

from disease_module.routes import router as disease_router
from price_module.routes   import router as price_router
from chatbot_module.routes import router as chatbot_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s"
)
logger = logging.getLogger(__name__)


app = FastAPI(
    title="IADSS API",
    description="Intelligent Agricultural Decision Support System",
    version="1.0.0",
)

# Allow Next.js frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    logger.info("IADSS Backend starting...")

    try:
        from disease_module.predictor import load_model as load_disease
        load_disease()
        logger.info("Disease detection model loaded")
    except Exception as e:
        logger.warning(f"Disease model not loaded: {e}")

    try:
        from price_module.ensemble import load_models as load_price
        load_price()
        logger.info("Price prediction models loaded")
    except Exception as e:
        logger.warning(f"Price models not loaded: {e}")

    try:
        from chatbot_module.rag_engine import CHUNKS
        logger.info(f"Chatbot RAG knowledge base loaded ({len(CHUNKS)} chunks)")
    except Exception as e:
        logger.warning(f"Chatbot RAG not loaded: {e}")

    logger.info("IADSS API ready at http://localhost:8000")


@app.on_event("shutdown")
async def shutdown_event():
    logger.info("IADSS Backend shutting down...")


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error on {request.url}: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "Internal server error",
            "detail": str(exc)
        }
    )


app.include_router(disease_router, prefix="/api/disease", tags=["Disease Detection"])
app.include_router(price_router,   prefix="/api/price",   tags=["Crop Price Prediction"])
app.include_router(chatbot_router, prefix="/api/chat",    tags=["AI Chatbot"])


@app.get("/", tags=["General"])
async def root():
    return {
        "message": "Welcome to IADSS API",
        "version": "1.0.0",
        "docs": "http://localhost:8000/docs",
        "modules": [
            "Disease Detection → /api/disease",
            "Price Prediction  → /api/price",
            "AI Chatbot        → /api/chat",
        ]
    }


@app.get("/api/health", tags=["General"])
async def health_check():
    return {
        "status": "healthy",
        "service": "IADSS Backend",
        "modules": {
            "disease_detection": "active",
            "price_prediction":  "active",
            "chatbot":           "active",
        }
    }


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)