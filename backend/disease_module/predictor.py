"""
Plant Disease Detection - CNN Predictor
──────────────────────────────────────
Loads the trained CNN model and performs inference on leaf images.
"""

import os
import logging
from pathlib import Path
from typing import Optional, Tuple, List, Dict

logger = logging.getLogger(__name__)

# Lazy-loaded model and class names
_model = None
_class_names: List[str] = []
_IMAGE_SIZE = (224, 224)

# Default class names for PlantVillage (38 classes) - update after training
DEFAULT_CLASSES = [
    "Apple___Apple_scab", "Apple___Black_rot", "Apple___Cedar_apple_rust",
    "Apple___healthy", "Blueberry___healthy", "Cherry___Powdery_mildew",
    "Cherry___healthy", "Corn___Cercospora_leaf_spot", "Corn___Common_rust",
    "Corn___Northern_Leaf_Blight", "Corn___healthy", "Grape___Black_rot",
    "Grape___Esca", "Grape___Leaf_blight", "Grape___healthy",
    "Orange___Haunglongbing", "Peach___Bacterial_spot", "Peach___healthy",
    "Pepper,_bell___Bacterial_spot", "Pepper,_bell___healthy",
    "Potato___Early_blight", "Potato___Late_blight", "Potato___healthy",
    "Raspberry___healthy", "Soybean___healthy", "Squash___Powdery_mildew",
    "Strawberry___Leaf_scorch", "Strawberry___healthy",
    "Tomato___Bacterial_spot", "Tomato___Early_blight", "Tomato___Late_blight",
    "Tomato___Leaf_Mold", "Tomato___Septoria_leaf_spot",
    "Tomato___Spider_mites", "Tomato___Target_Spot",
    "Tomato___Yellow_Leaf_Curl_Virus", "Tomato___mosaic_virus",
    "Tomato___healthy",
]


def get_model_path() -> Path:
    """Return path to saved model."""
    base = Path(__file__).resolve().parent
    return base / "model" / "plant_disease_cnn.keras"


def _load_class_names() -> List[str]:
    """Load class names from JSON if available."""
    import json
    json_path = Path(__file__).resolve().parent / "model" / "class_names.json"
    if json_path.exists():
        with open(json_path) as f:
            return json.load(f)
    return []


def load_model() -> bool:
    """
    Load the trained CNN model into memory.
    Returns True if successful, False otherwise.
    """
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
        _model = tf.keras.models.load_model(model_path)
        # Load class names from JSON if available
        loaded = _load_class_names()
        _class_names = loaded if loaded else DEFAULT_CLASSES
        logger.info(f"Disease model loaded. Classes: {len(_class_names)}")
        return True
    except Exception as e:
        logger.error(f"Failed to load disease model: {e}")
        _class_names = DEFAULT_CLASSES
        return False


def predict(image_array, top_k: int = 3) -> List[Dict]:
    """
    Run inference on a preprocessed image array.

    Args:
        image_array: Preprocessed image (batch of 1, shape like (1, 224, 224, 3))
        top_k: Number of top predictions to return

    Returns:
        List of dicts: [{"class": str, "confidence": float}, ...]
    """
    global _model, _class_names

    if _model is None:
        if not load_model():
            return [{"class": "Model not loaded", "confidence": 0.0}]

    try:
        import numpy as np
        probs = _model.predict(image_array, verbose=0)[0]
        top_indices = np.argsort(probs)[::-1][:top_k]

        results = []
        for idx in top_indices:
            label = _class_names[idx] if idx < len(_class_names) else f"Class_{idx}"
            conf = float(probs[idx])
            results.append({"class": label, "confidence": round(conf, 4)})
        return results
    except Exception as e:
        logger.error(f"Prediction failed: {e}")
        return [{"class": "Error", "confidence": 0.0, "error": str(e)}]


def preprocess_image(image_bytes: bytes) -> Optional["np.ndarray"]:
    """
    Preprocess raw image bytes for the CNN.

    Args:
        image_bytes: Raw image file bytes (JPEG/PNG)

    Returns:
        Preprocessed numpy array (1, 224, 224, 3) or None on error
    """
    try:
        import numpy as np
        import tensorflow as tf

        # Decode image
        img = tf.io.decode_image(image_bytes, channels=3, expand_animations=False)
        img = tf.image.resize(img, _IMAGE_SIZE)
        img = tf.cast(img, tf.float32) / 255.0
        img = tf.expand_dims(img, 0)  # Add batch dim
        return img.numpy()
    except Exception as e:
        logger.error(f"Image preprocessing failed: {e}")
        return None


def get_class_names() -> List[str]:
    """Return the list of class names the model was trained on."""
    global _class_names
    if not _class_names:
        load_model()
    return _class_names
