"""
price_module/ensemble.py
Loads the 3 trained models and runs the full prediction pipeline.
Called by routes.py when a prediction request comes in.
"""

import pickle
import numpy as np
import pandas as pd
from pathlib import Path
from datetime import datetime

MODEL_DIR = Path(__file__).resolve().parent / 'model'

rf_model       = None
prophet_models = None   
meta_model     = None


SEASON_MAP = {'Rabi': 0, 'Kharif': 1, 'Zaid': 2, 'Post-Monsoon': 3}

CROP_MAP = {
    'Barley': 0, 'Coffee': 1, 'Cotton': 2, 'Groundnut': 3,
    'Jute': 4, 'Maize': 5, 'Millets': 6, 'Mustard': 7,
    'Onion': 8, 'Potato': 9, 'Pulses': 10, 'Rice': 11,
    'Sesame': 12, 'Soybean': 13, 'Sugarcane': 14, 'Sunflower': 15,
    'Tea': 16, 'Tobacco': 17, 'Tomato': 18, 'Wheat': 19
}

FEATURES = [
    'Crop_Encoded', 'Season_Encoded', 'Month', 'Quarter', 'Year',
    'Temperature (°C)', 'Rainfall (mm)',
    'Supply Volume (tons)', 'Demand Volume (tons)',
    'Supply_Demand_Ratio',
    'Transportation Cost (₹/Quintal)',
    'Fertilizer Usage (kg/hectare)',
    'Pest Infestation (0-1)', 'Market Competition (0-1)',
    'Price_Lag1', 'Price_Lag3', 'Price_RollingMean3'
]


def load_models():
    """Load all 3 models from disk into memory. Called once on server startup."""
    global rf_model, prophet_models, meta_model

    with open(MODEL_DIR / 'rf_model.pkl', 'rb') as f:
        rf_model = pickle.load(f)

    with open(MODEL_DIR / 'prophet_model.pkl', 'rb') as f:
        prophet_models = pickle.load(f)

    with open(MODEL_DIR / 'meta_model.pkl', 'rb') as f:
        meta_model = pickle.load(f)


def _get_season(month: int) -> str:
    """Map month number to Indian agricultural season."""
    if month in [6, 7, 8, 9, 10]:
        return 'Kharif'
    elif month in [11, 12, 1, 2, 3]:
        return 'Rabi'
    elif month in [3, 4, 5]:
        return 'Zaid'
    return 'Post-Monsoon'


def predict(
    crop: str,
    current_price: float,
    temperature: float,
    rainfall: float,
    supply_volume: float,
    demand_volume: float,
    transport_cost: float,
    fertilizer_usage: float,
    pest_infestation: float,
    market_competition: float,
    price_lag1: float = None,
    price_lag3: float = None,
) -> dict:
    """
    Run the full ensemble prediction pipeline.
    Returns predicted price + buy/sell recommendation.
    """
    if rf_model is None:
        load_models()

    now     = datetime.now()
    month   = now.month
    quarter = (month - 1) // 3 + 1
    year    = now.year
    season  = _get_season(month)

    # use current price as lag fallback if not provided
    lag1 = price_lag1 if price_lag1 is not None else current_price
    lag3 = price_lag3 if price_lag3 is not None else current_price
    rolling_mean = (lag1 + lag3 + current_price) / 3

    sd_ratio = supply_volume / demand_volume if demand_volume > 0 else 1.0

    # building feature 
    row = {
        'Crop_Encoded'                  : CROP_MAP.get(crop.title(), 0),
        'Season_Encoded'                : SEASON_MAP.get(season, 0),
        'Month'                         : month,
        'Quarter'                       : quarter,
        'Year'                          : year,
        'Temperature (°C)'              : temperature,
        'Rainfall (mm)'                 : rainfall,
        'Supply Volume (tons)'          : supply_volume,
        'Demand Volume (tons)'          : demand_volume,
        'Supply_Demand_Ratio'           : sd_ratio,
        'Transportation Cost (₹/Quintal)': transport_cost,
        'Fertilizer Usage (kg/hectare)' : fertilizer_usage,
        'Pest Infestation (0-1)'        : pest_infestation,
        'Market Competition (0-1)'      : market_competition,
        'Price_Lag1'                    : lag1,
        'Price_Lag3'                    : lag3,
        'Price_RollingMean3'            : rolling_mean,
    }

    X = pd.DataFrame([row])[FEATURES]

    # RF prediction
    rf_pred = rf_model.predict(X)[0]

    # Prophet prediction
    prophet_pred = rf_pred  # fallback if crop not found
    if crop.title() in prophet_models:
        future = pd.DataFrame({'ds': [pd.Timestamp(now.strftime('%Y-%m-01'))]})
        forecast = prophet_models[crop.title()].predict(future)
        prophet_pred = forecast['yhat'].values[0]

    # ensemble via Ridge meta-learner
    meta_input   = np.array([[rf_pred, prophet_pred]])
    final_price  = float(meta_model.predict(meta_input)[0])
    final_price  = max(final_price, 0)

    # buy/sell recommendation
    change_pct = ((final_price - current_price) / current_price) * 100
    recommendation = 'wait' if change_pct > 2 else 'sell'

    return {
        'crop'           : crop,
        'current_price'  : round(current_price, 2),
        'predicted_price': round(final_price, 2),
        'change_percent' : round(change_pct, 2),
        'recommendation' : recommendation,
        'season'         : season,
        'month'          : month,
    }
