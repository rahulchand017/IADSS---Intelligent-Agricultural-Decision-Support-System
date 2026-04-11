from fastapi import APIRouter
from pydantic import BaseModel
from .predictor import predict_crop

router = APIRouter()

class SoilInput(BaseModel):
    N: float
    P: float
    K: float
    temperature: float
    humidity: float
    ph: float
    rainfall: float

@router.post("/predict")
def soil_predict(data: SoilInput):
    result = predict_crop(
        data.N, data.P, data.K,
        data.temperature, data.humidity,
        data.ph, data.rainfall
    )
    return result