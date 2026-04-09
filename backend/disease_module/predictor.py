"""
Plant Disease Detection - CNN Predictor
──────────────────────────────────────
Loads the trained CNN model and performs inference on leaf images.
"""

import os
import json
import logging
import numpy as np
from pathlib import Path
from typing import Optional, List, Dict

# Suppress TensorFlow warnings
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

logger = logging.getLogger(__name__)

_model       = None
_class_names : List[str] = []
_IMAGE_SIZE  = (224, 224)

DEFAULT_CLASSES = [
    "Apple___Apple_scab", "Apple___Black_rot", "Apple___Cedar_apple_rust",
    "Apple___healthy", "Blueberry___healthy", "Cherry_(including_sour)___Powdery_mildew",
    "Cherry_(including_sour)___healthy", "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot",
    "Corn_(maize)___Common_rust_", "Corn_(maize)___Northern_Leaf_Blight", "Corn_(maize)___healthy",
    "Grape___Black_rot", "Grape___Esca_(Black_Measles)", "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)",
    "Grape___healthy", "Orange___Haunglongbing_(Citrus_greening)", "Peach___Bacterial_spot",
    "Peach___healthy", "Pepper,_bell___Bacterial_spot", "Pepper,_bell___healthy",
    "Potato___Early_blight", "Potato___Late_blight", "Potato___healthy",
    "Raspberry___healthy", "Soybean___healthy", "Squash___Powdery_mildew",
    "Strawberry___Leaf_scorch", "Strawberry___healthy", "Tomato___Bacterial_spot",
    "Tomato___Early_blight", "Tomato___Late_blight", "Tomato___Leaf_Mold",
    "Tomato___Septoria_leaf_spot", "Tomato___Spider_mites Two-spotted_spider_mite",
    "Tomato___Target_Spot", "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
    "Tomato___Tomato_mosaic_virus", "Tomato___healthy",
]


def get_model_path() -> Path:
    base = Path(__file__).resolve().parent
    return base / "model" / "plant_disease_savedmodel"


def _load_class_names() -> List[str]:
    json_path = Path(__file__).resolve().parent / "model" / "class_names.json"
    if json_path.exists():
        with open(json_path) as f:
            return json.load(f)
    return []


def load_model() -> bool:
    global _model, _class_names

    if _model is not None:
        return True

    model_path = get_model_path()
    if not model_path.exists():
        logger.warning(f"Disease model not found at {model_path}")
        logger.info("Run the training notebook to create the model first.")
        _class_names = DEFAULT_CLASSES
        return False

    try:
        import tensorflow as tf
        _model = tf.saved_model.load(str(model_path))
        loaded = _load_class_names()
        _class_names = loaded if loaded else DEFAULT_CLASSES
        logger.info(f"Disease model loaded. Classes: {len(_class_names)}")
        return True
    except Exception as e:
        logger.error(f"Failed to load disease model: {e}")
        _class_names = DEFAULT_CLASSES
        return False


def predict(image_array, top_k: int = 3) -> List[Dict]:
    global _model, _class_names

    if _model is None:
        if not load_model():
            return [{"class": "Model not loaded", "confidence": 0.0}]

    try:
        import tensorflow as tf
        infer     = _model.signatures['serving_default']
        input_key = list(infer.structured_input_signature[1].keys())[0]
        output    = infer(**{input_key: tf.constant(image_array, dtype=tf.float32)})
        probs     = list(output.values())[0].numpy()[0]

        top_indices = np.argsort(probs)[::-1][:top_k]
        return [
            {
                "class"     : _class_names[i] if i < len(_class_names) else f"Class_{i}",
                "confidence": round(float(probs[i]), 4)
            }
            for i in top_indices
        ]
    except Exception as e:
        logger.error(f"Prediction failed: {e}")
        return [{"class": "Error", "confidence": 0.0, "error": str(e)}]


def preprocess_image(image_bytes: bytes) -> Optional[np.ndarray]:
    try:
        import tensorflow as tf
        img = tf.io.decode_image(image_bytes, channels=3, expand_animations=False)
        img = tf.image.resize(img, _IMAGE_SIZE)
        img = tf.cast(img, tf.float32) / 255.0
        img = tf.expand_dims(img, 0)
        return img.numpy()
    except Exception as e:
        logger.error(f"Image preprocessing failed: {e}")
        return None


def get_class_names() -> List[str]:
    global _class_names
    if not _class_names:
        load_model()
    return _class_names