"""
price_module/routes.py
FastAPI router for the crop price prediction module.
Registered in main.py under /api/price
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from .ensemble import predict

router = APIRouter()


# ── request schema ────────────────────────────────────────────────────────────
class PriceRequest(BaseModel):
    crop              : str   = Field(..., example="Wheat")
    current_price     : float = Field(..., example=2200.0)
    temperature       : float = Field(28.5, example=28.5)
    rainfall          : float = Field(120.0, example=120.0)
    supply_volume     : float = Field(2500.0, example=2500.0)
    demand_volume     : float = Field(2000.0, example=2000.0)
    transport_cost    : float = Field(300.0, example=300.0)
    fertilizer_usage  : float = Field(150.0, example=150.0)
    pest_infestation  : float = Field(0.2, ge=0, le=1, example=0.2)
    market_competition: float = Field(0.5, ge=0, le=1, example=0.5)
    price_lag1        : Optional[float] = None
    price_lag3        : Optional[float] = None


# ── response schema ───────────────────────────────────────────────────────────
class PriceResponse(BaseModel):
    success          : bool
    crop             : str
    current_price    : float
    predicted_price  : float
    change_percent   : float
    recommendation   : str
    season           : str
    month            : int


# ── endpoints ─────────────────────────────────────────────────────────────────
@router.post('/predict', response_model=PriceResponse)
async def predict_price(req: PriceRequest):
    try:
        result = predict(
            crop               = req.crop,
            current_price      = req.current_price,
            temperature        = req.temperature,
            rainfall           = req.rainfall,
            supply_volume      = req.supply_volume,
            demand_volume      = req.demand_volume,
            transport_cost     = req.transport_cost,
            fertilizer_usage   = req.fertilizer_usage,
            pest_infestation   = req.pest_infestation,
            market_competition = req.market_competition,
            price_lag1         = req.price_lag1,
            price_lag3         = req.price_lag3,
        )
        return {'success': True, **result}

    except KeyError as e:
        raise HTTPException(status_code=400, detail=f"Unknown crop: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get('/crops')
async def get_supported_crops():
    crops = [
        'Barley', 'Coffee', 'Cotton', 'Groundnut', 'Jute',
        'Maize', 'Millets', 'Mustard', 'Onion', 'Potato',
        'Pulses', 'Rice', 'Sesame', 'Soybean', 'Sugarcane',
        'Sunflower', 'Tea', 'Tobacco', 'Tomato', 'Wheat'
    ]
    return {'success': True, 'crops': crops, 'total': len(crops)}


@router.get('/health')
async def price_module_health():
    from .ensemble import rf_model, meta_model
    loaded = rf_model is not None and meta_model is not None
    return {
        'success': True,
        'models_loaded': loaded,
        'status': 'ready' if loaded else 'models not loaded yet'
    }