""" This module creates the FastAPI app and registers all module routes into one single server.
      CORS — allows your React frontend to talk to the backend
      Startup events — loads all ML models into memory when server starts (so predictions are fast)
      Global error handling — catches any crash and returns a clean JSON error
      Health check endpoint — /api/health to verify the server is running
"""

# =============================================================
#  IADSS - Intelligent Agricultural Decision Support System
#  main.py — FastAPI Application Entry Point
#  LPU Capstone Project | B.Tech CSE
# =============================================================

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import logging

# Importing routers from each module
# NOTE: Soil Analysis module removed from scope
from disease_module.routes import router as disease_router
from price_module.routes   import router as price_router
from chatbot_module.routes import router as chatbot_router

# Logger setup
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s"
)
logger = logging.getLogger(__name__)


app = FastAPI(
    title="IADSS API",
    description="""
    Intelligent Agricultural Decision Support System
    ─────────────────────────────────────────────────
    Modules:
    • Module 1 — Plant Disease Detection   (/api/disease)
    • Module 2 — Crop Price Prediction     (/api/price)
    • Module 3 — Conversational AI Chatbot (/api/chat)
    """,
    version="1.0.0",
)


# ============================================================
#  CORS MIDDLEWARE
#  Allows the Next.js frontend to talk to this backend.
#  Remove "*" before deploying to production.
# ============================================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",   # Next.js dev server
        "http://localhost:5173",   # Vite dev server (if needed)
    ],
    allow_credentials=True,
    allow_methods=["*"],           # GET, POST, PUT, DELETE etc.
    allow_headers=["*"],
)


# ============================================================
#  STARTUP EVENT
#  Runs once when server starts — preloads all ML models
#  so the first prediction request is not slow
# ============================================================
@app.on_event("startup")
async def startup_event():
    logger.info("IADSS Backend Starting...")

    # Module 1 — Plant Disease Detection (YOLO11)
    try:
        from disease_module.predictor import load_model as load_disease
        load_disease()
        logger.info("Disease Detection model (YOLO11) loaded")
    except Exception as e:
        logger.warning(f"Disease model not loaded yet: {e}")

    # Module 2 — Crop Price Prediction (RF + Prophet + Ridge)
    try:
        from price_module.ensemble import load_models as load_price
        load_price()
        logger.info("Crop Price Prediction models loaded")
    except Exception as e:
        logger.warning(f"Price models not loaded yet: {e}")

    # Module 3 — Conversational AI Chatbot (Gemini RAG)
    try:
        from chatbot_module.rag.retriever import load_vector_store
        load_vector_store()
        logger.info("Chatbot RAG vector store loaded")
    except Exception as e:
        logger.warning(f"Chatbot vector store not loaded yet: {e}")

    logger.info("IADSS API is ready at http://localhost:8000")


# ============================================================
#  SHUTDOWN EVENT
# ============================================================
@app.on_event("shutdown")
async def shutdown_event():
    logger.info("IADSS Backend shutting down...")


# ============================================================
#  GLOBAL EXCEPTION HANDLER
#  If any module crashes, returns clean JSON instead of a 500
# ============================================================
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


# ============================================================
#  REGISTER MODULE ROUTES
#  Each module's routes.py plugs in here with a prefix
# ============================================================

# Module 1 — Plant Disease Detection (YOLO11)
# Endpoints: POST /api/disease/predict
#            GET  /api/disease/history
app.include_router(
    disease_router,
    prefix="/api/disease",
    tags=["Disease Detection"]
)

# Module 2 — Crop Price Prediction (RF + Prophet + Ridge Meta-Learner)
# Endpoints: POST /api/price/predict
#            GET  /api/price/history/{crop}
#            GET  /api/price/trends
app.include_router(
    price_router,
    prefix="/api/price",
    tags=["Crop Price Prediction"]
)

# Module 3 — Conversational AI Chatbot (Gemini 1.5 Flash + RAG)
# Endpoints: POST /api/chat/message
#            GET  /api/chat/history
#            DELETE /api/chat/clear
app.include_router(
    chatbot_router,
    prefix="/api/chat",
    tags=["AI Chatbot"]
)


# ============================================================
#  ROOT & HEALTH CHECK ENDPOINTS
# ============================================================

@app.get("/", tags=["General"])
async def root():
    """Welcome endpoint — confirms API is running."""
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
    """
    Health check — use this to verify the server is alive.
    Frontend pings this on load to confirm backend connectivity.
    """
    return {
        "status": "healthy",
        "service": "IADSS Backend",
        "modules": {
            "disease_detection": "active",
            "price_prediction":  "active",
            "chatbot":           "active",
        }
    }


# ============================================================
#  RUN SERVER
#  Run directly : python main.py
#  Or use       : uvicorn main:app --reload
# ============================================================
if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )