import io
import json
import os
from functools import lru_cache

import numpy as np
from PIL import Image, UnidentifiedImageError
import tensorflow as tf


BASE_DIR = os.path.dirname(os.path.dirname(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "disease_models")
MODEL_PATH = os.path.join(MODEL_DIR, "disease_model.h5")
CLASSES_PATH = os.path.join(MODEL_DIR, "disease_classes.json")
INFO_PATH = os.path.join(MODEL_DIR, "disease_info_arabic.json")

UNKNOWN_DISEASE_RESPONSE = {
    "disease": "Unknown",
    "prediction": "Unknown",
    "confidence": 0.0,
    "description": "",
    "treatment": "",
}


def _assert_artifact(path: str):
    if not os.path.exists(path):
        raise FileNotFoundError(f"Missing disease artifact: {path}")


@lru_cache(maxsize=1)
def load_disease_assets():
    _assert_artifact(MODEL_PATH)
    _assert_artifact(CLASSES_PATH)
    _assert_artifact(INFO_PATH)

    model = tf.keras.models.load_model(MODEL_PATH)
    with open(CLASSES_PATH, "r", encoding="utf-8") as class_file:
        class_names = json.load(class_file)
    with open(INFO_PATH, "r", encoding="utf-8") as info_file:
        disease_info = json.load(info_file)

    return model, class_names, disease_info


def prepare_image(image_bytes: bytes) -> np.ndarray:
    image = Image.open(io.BytesIO(image_bytes))
    if image.mode != "RGB":
        image = image.convert("RGB")

    image = image.resize((224, 224))
    image_array = np.array(image, dtype=np.float32) / 255.0
    return np.expand_dims(image_array, axis=0)


def predict_disease(image_bytes: bytes):
    model, class_names, disease_info = load_disease_assets()

    try:
        processed_image = prepare_image(image_bytes)
    except (UnidentifiedImageError, OSError):
        return UNKNOWN_DISEASE_RESPONSE.copy()

    predictions = model.predict(processed_image, verbose=0)

    predicted_index = int(np.argmax(predictions[0]))
    confidence = float(np.max(predictions[0]) * 100)
    class_name_en = class_names.get(str(predicted_index), "Unknown")
    arabic_details = disease_info.get(class_name_en, {})

    if class_name_en == "Unknown":
        return {
            **UNKNOWN_DISEASE_RESPONSE,
            "confidence": round(confidence, 2),
        }

    disease_name = arabic_details.get("name_ar") or class_name_en
    description = arabic_details.get("description", "")
    treatment = arabic_details.get("treatment", "")

    return {
        "disease": disease_name,
        "prediction": class_name_en,
        "confidence": round(confidence, 2),
        "description": description,
        "treatment": treatment,
    }
