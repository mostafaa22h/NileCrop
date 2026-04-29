import os
import pickle
from typing import Any

import requests

from services.crop_logic import get_crop_recommendations
from services.geocoding import get_coordinates

try:
    import joblib  # type: ignore
except ImportError:  # pragma: no cover
    joblib = None


BASE_DIR = os.path.dirname(os.path.dirname(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "ml_models")
MODEL_PATH = os.path.join(MODEL_DIR, "crop_model.pkl")
SCALER_PATH = os.path.join(MODEL_DIR, "scaler.pkl")
ENCODER_PATH = os.path.join(MODEL_DIR, "label_encoder.pkl")


ARABIC_CROP_NAMES = {
    "barley": "الشعير",
    "beans": "الفاصوليا",
    "corn": "الذرة",
    "cotton": "القطن",
    "lentil": "العدس",
    "mango": "المانجو",
    "muskmelon": "الشمام",
    "olive": "الزيتون",
    "potato": "البطاطس",
    "rice": "الأرز",
    "sesame": "السمسم",
    "soybean": "فول الصويا",
    "sugarcane": "قصب السكر",
    "tomato": "الطماطم",
    "watermelon": "البطيخ",
    "wheat": "القمح",
}


def load_pickle_artifact(path: str) -> Any:
    if not os.path.exists(path):
        raise FileNotFoundError(f"Missing model artifact: {path}")

    if joblib is not None:
        return joblib.load(path)

    with open(path, "rb") as artifact_file:
        return pickle.load(artifact_file)


def load_recommendation_assets():
    model = load_pickle_artifact(MODEL_PATH)
    scaler = load_pickle_artifact(SCALER_PATH)
    label_encoder = load_pickle_artifact(ENCODER_PATH)
    return model, scaler, label_encoder


def get_live_weather(lat: float, lon: float) -> dict[str, float]:
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": lon,
        "current": "temperature_2m,relative_humidity_2m,precipitation",
    }

    try:
        response = requests.get(url, params=params, timeout=8)
        response.raise_for_status()
        current = response.json().get("current", {})
        return {
            "temperature": float(current.get("temperature_2m", 28.0)),
            "humidity": float(current.get("relative_humidity_2m", 55.0)),
            "rainfall": float(current.get("precipitation", 0.0)),
        }
    except requests.RequestException:
        return {
            "temperature": round(32 - abs(lat - 30) * 0.8, 2),
            "humidity": round(58 - abs(lon - 31) * 1.5, 2),
            "rainfall": round(max(0.0, 4 - abs(lat - 30) * 0.6), 2),
        }


def get_soil_profile(lat: float, lon: float) -> dict[str, float]:
    url = "https://rest.isric.org/soilgrids/v2.0/properties/query"
    params = [
        ("lat", str(lat)),
        ("lon", str(lon)),
        ("property", "phh2o"),
        ("property", "nitrogen"),
        ("property", "soc"),
        ("depth", "0-5cm"),
        ("value", "mean"),
    ]

    try:
        response = requests.get(url, params=params, timeout=8)
        response.raise_for_status()
        layers = response.json().get("properties", {}).get("layers", [])
    except requests.RequestException:
        return {
            "ph": 6.8,
            "nitrogen": 42.0,
            "organic_carbon": 130.0,
        }

    values: dict[str, float] = {}
    for layer in layers:
        name = layer.get("name")
        depth_values = layer.get("depths", [])
        if not depth_values:
            continue
        value = depth_values[0].get("values", {}).get("mean")
        if value is None:
            continue
        values[name] = float(value)

    ph = values.get("phh2o", 68.0) / 10 if values.get("phh2o", 68.0) > 14 else values.get("phh2o", 6.8)
    nitrogen = values.get("nitrogen", 35.0)
    organic_carbon = values.get("soc", 120.0)

    return {
        "ph": ph,
        "nitrogen": nitrogen,
        "organic_carbon": organic_carbon,
    }


def build_feature_vector(city: str) -> tuple[list[list[float]], dict[str, float]]:
    lat, lon = get_coordinates(city)
    if lat is None or lon is None:
        raise ValueError("City not found")

    weather = get_live_weather(lat, lon)
    soil = get_soil_profile(lat, lon)

    nitrogen = max(0.0, soil["nitrogen"] / 10)
    phosphorus = max(0.0, soil["organic_carbon"] / 6)
    potassium = max(0.0, soil["organic_carbon"] / 4)

    feature_vector = [[
        round(nitrogen, 2),
        round(phosphorus, 2),
        round(potassium, 2),
        round(weather["temperature"], 2),
        round(weather["humidity"], 2),
        round(soil["ph"], 2),
        round(weather["rainfall"], 2),
    ]]

    metadata = {
        "latitude": lat,
        "longitude": lon,
        "temperature": round(weather["temperature"], 2),
        "humidity": round(weather["humidity"], 2),
        "rainfall": round(weather["rainfall"], 2),
        "ph": round(soil["ph"], 2),
        "nitrogen": round(nitrogen, 2),
        "phosphorus": round(phosphorus, 2),
        "potassium": round(potassium, 2),
    }

    return feature_vector, metadata


def infer_soil_type(city: str) -> str:
    normalized = city.strip().lower()
    sandy_cities = {"matrouh", "marsa matruh", "north sinai", "south sinai", "hurghada", "sharm el sheikh", "siwa"}
    clay_cities = {"cairo", "giza", "banha", "tanta", "mansoura", "zagazig", "fayoum", "kafr el sheikh"}

    if normalized in sandy_cities:
        return "sandy"
    if normalized in clay_cities:
        return "clay"
    return "loamy"


def to_arabic_crop_name(crop_name: str) -> str:
    return ARABIC_CROP_NAMES.get(crop_name.strip().lower(), crop_name)


def rank_model_candidates(model: Any, label_encoder: Any, scaled_vector: Any) -> list[dict[str, Any]]:
    if not hasattr(model, "predict_proba"):
        prediction = model.predict(scaled_vector)
        crop_name = label_encoder.inverse_transform(prediction)[0]
        return [{"name": crop_name, "confidence": 0.0}]

    probabilities = model.predict_proba(scaled_vector)[0]
    ranked = sorted(
        zip(label_encoder.classes_, probabilities),
        key=lambda item: item[1],
        reverse=True,
    )

    return [
        {"name": crop_name, "confidence": round(float(probability) * 100, 2)}
        for crop_name, probability in ranked[:5]
    ]


def choose_best_recommendation(city: str, metadata: dict[str, float], model_candidates: list[dict[str, Any]]) -> dict[str, Any]:
    soil_type = infer_soil_type(city)
    heuristic_recommendations, region = get_crop_recommendations(
        city,
        metadata["temperature"],
        metadata["humidity"],
        soil_type,
    )
    heuristic_top = heuristic_recommendations[0]
    heuristic_names = {item["name"].strip().lower() for item in heuristic_recommendations}
    model_top = model_candidates[0] if model_candidates else None

    if model_top and model_top["name"].strip().lower() in heuristic_names:
        chosen_name = model_top["name"]
        chosen_score = max(int(round(model_top["confidence"])), heuristic_top["score"])
        chosen_reason = f"{heuristic_top['reason']} وتم تأكيد الاختيار أيضًا من نموذج الذكاء الاصطناعي."
        decision_source = "hybrid"
    else:
        chosen_name = heuristic_top["name"]
        chosen_score = heuristic_top["score"]
        chosen_reason = f"{heuristic_top['reason']} وتم تفضيله لأن بيانات المدينة الحالية كانت أوضح من تنبؤ النموذج العام."
        decision_source = "city_logic"

    localized_heuristics = [
        {
            **item,
            "name_ar": to_arabic_crop_name(item["name"]),
        }
        for item in heuristic_recommendations
    ]

    return {
        "crop": chosen_name,
        "crop_ar": to_arabic_crop_name(chosen_name),
        "score": chosen_score,
        "reason": chosen_reason,
        "soil_type": soil_type,
        "region": region,
        "decision_source": decision_source,
        "ai_candidates": model_candidates,
        "heuristic_candidates": localized_heuristics,
    }


def predict_crop_for_city(city: str) -> dict[str, Any]:
    model, scaler, label_encoder = load_recommendation_assets()
    feature_vector, metadata = build_feature_vector(city)

    scaled_vector = scaler.transform(feature_vector)
    model_candidates = rank_model_candidates(model, label_encoder, scaled_vector)
    chosen = choose_best_recommendation(city, metadata, model_candidates)

    return {
        "city": city,
        "crop": chosen["crop"],
        "crop_ar": chosen["crop_ar"],
        "score": chosen["score"],
        "reason": chosen["reason"],
        "meta": metadata,
        "decision_source": chosen["decision_source"],
        "soil_type": chosen["soil_type"],
        "region": chosen["region"],
        "ai_candidates": chosen["ai_candidates"],
        "heuristic_candidates": chosen["heuristic_candidates"],
    }
