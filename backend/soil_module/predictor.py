import pickle
import json
import numpy as np
from pathlib import Path

model_dir = Path(__file__).resolve().parent / "model"

with open(model_dir / "soil_model.pkl", "rb") as f:
    model = pickle.load(f)

with open(model_dir / "crop_names.json", "r") as f:
    crop_names = json.load(f)

with open(model_dir / "feature_names.json", "r") as f:
    feature_names = json.load(f)


def predict_crop(N, P, K, temperature, humidity, ph, rainfall):
    features = np.array([[N, P, K, temperature, humidity, ph, rainfall]])
    prediction = model.predict(features)[0]
    probabilities = model.predict_proba(features)[0]
    
    top3_indices = np.argsort(probabilities)[::-1][:3]
    top3 = [
        {"crop": crop_names[i], "confidence": round(probabilities[i] * 100, 2)}
        for i in top3_indices
    ]
    
    return {
        "recommended_crop": prediction,
        "top3": top3
    }