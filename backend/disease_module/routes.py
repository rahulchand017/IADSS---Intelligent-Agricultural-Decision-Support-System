"""
Plant Disease Detection - FastAPI Routes
────────────────────────────────────────
API endpoints for uploading leaf images and getting disease predictions.
"""

from fastapi import APIRouter, File, UploadFile, HTTPException
from pydantic import BaseModel
from typing import List, Optional

from .predictor import load_model, predict, preprocess_image, get_class_names

router = APIRouter()


# ─── Response Models ───────────────────────────────────────────────────────
class PredictionItem(BaseModel):
    class_name: str
    confidence: float


class DiseasePredictionResponse(BaseModel):
    success: bool
    predictions: List[PredictionItem]
    top_class: str
    top_confidence: float
    message: Optional[str] = None


class HistoryItem(BaseModel):
    id: str
    prediction: str
    confidence: float
    timestamp: str


# ─── Endpoints ──────────────────────────────────────────────────────────────

@router.post("/predict", response_model=DiseasePredictionResponse)
async def predict_disease(file: UploadFile = File(...)):
    """
    Upload a leaf image and get disease prediction.

    - **file**: Image file (JPEG, PNG) of a plant leaf
    - Returns top predictions with confidence scores
    """
    # Validate file type
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Please upload an image (JPEG, PNG)."
        )

    try:
        image_bytes = await file.read()
        if len(image_bytes) == 0:
            raise HTTPException(status_code=400, detail="Empty file received.")

        # Preprocess
        image_array = preprocess_image(image_bytes)
        if image_array is None:
            raise HTTPException(status_code=400, detail="Could not process image.")

        # Predict
        results = predict(image_array, top_k=5)

        if not results or results[0].get("class") in ("Model not loaded", "Error"):
            return DiseasePredictionResponse(
                success=False,
                predictions=[],
                top_class="Unknown",
                top_confidence=0.0,
                message="Model not loaded. Run training first or check model path."
            )

        predictions = [
            PredictionItem(class_name=r["class"], confidence=r["confidence"])
            for r in results
        ]

        return DiseasePredictionResponse(
            success=True,
            predictions=predictions,
            top_class=predictions[0].class_name,
            top_confidence=predictions[0].confidence,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history")
async def get_history():
    """
    Return prediction history (placeholder - implement with DB if needed).
    """
    # Placeholder - can be extended with database storage
    return {"history": [], "message": "History storage not implemented."}


@router.get("/classes")
async def list_classes():
    """Return the list of disease/plant classes the model recognizes."""
    classes = get_class_names()
    return {"classes": classes, "count": len(classes)}
