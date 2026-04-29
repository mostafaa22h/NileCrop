from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from models.crop_request import CropRequest
from routers.city import get_db
from schemas.crop import CropRequestSchema
from services.crop_logic import get_crop_recommendations, recommend_crop
from services.geocoding import get_coordinates
from services.weather import get_weather

router = APIRouter(prefix="/crop", tags=["Crop"])


class FrontendRecommendSchema(BaseModel):
    city: str = Field(..., min_length=2, max_length=50)


def infer_soil_type(city: str) -> str:
    normalized = city.strip().lower()
    sandy_cities = {"matrouh", "marsa matruh", "north sinai", "south sinai", "hurghada", "sharm el sheikh", "siwa"}
    clay_cities = {"cairo", "giza", "banha", "tanta", "mansoura", "zagazig", "fayoum", "kafr el sheikh"}
    if normalized in sandy_cities:
        return "sandy"
    if normalized in clay_cities:
        return "clay"
    return "loamy"


def adjust_weather_by_city(city: str, temperature: float, humidity: float):
    normalized = city.strip().lower()
    coastal_cities = {"alexandria", "port said", "damietta", "marsa matruh", "matrouh"}
    delta_cities = {"mansoura", "tanta", "zagazig", "banha", "kafr el sheikh", "fayoum"}
    upper_egypt_cities = {"aswan", "luxor", "qena", "sohag", "assiut", "minya", "beni suef"}
    desert_cities = {"hurghada", "sharm el sheikh", "north sinai", "south sinai", "siwa", "new valley"}

    if normalized in coastal_cities:
        return min(temperature, 28.0), max(humidity, 68.0)
    if normalized in delta_cities:
        return min(max(temperature, 24.0), 30.0), max(humidity, 60.0)
    if normalized in upper_egypt_cities:
        return max(temperature, 33.0), min(humidity, 42.0)
    if normalized in desert_cities:
        return max(temperature, 31.0), min(humidity, 38.0)
    return temperature, humidity


def build_recommendation(city: str):
    lat, lon = get_coordinates(city)
    if lat is None or lon is None:
        raise HTTPException(status_code=404, detail="City not found")

    weather = get_weather(lat, lon)
    temperature, humidity = adjust_weather_by_city(city, weather["temperature"], weather["humidity"])
    soil_type = infer_soil_type(city)
    recommendations, region = get_crop_recommendations(city, temperature, humidity, soil_type)

    return {
        "lat": lat,
        "lon": lon,
        "temperature": temperature,
        "humidity": humidity,
        "soil_type": soil_type,
        "region": region,
        "recommendations": recommendations,
        "recommended": recommendations[0]["name"],
    }


@router.post("/crop-request")
def create_crop_request(
    data: CropRequestSchema,
    db: Session = Depends(get_db)
):
    lat, lon = get_coordinates(data.city)
    if lat is None or lon is None:
        raise HTTPException(status_code=404, detail="City not found")

    recommended = recommend_crop(data.temperature, data.humidity, data.soil_type)

    crop = CropRequest(
        city=data.city,
        temperature=data.temperature,
        humidity=data.humidity,
        soil_type=data.soil_type,
        latitude=lat,
        longitude=lon,
        recommended_crop=recommended
    )

    db.add(crop)
    db.commit()
    db.refresh(crop)

    return {
        "status": "success",
        "recommended_crop": recommended,
        "data": {
            "recommended_crop": recommended,
            "city": crop.city,
            "temperature": crop.temperature,
            "humidity": crop.humidity,
            "soil_type": crop.soil_type,
        },
    }


@router.post("/recommend")
def recommend_for_frontend(
    data: FrontendRecommendSchema,
    db: Session = Depends(get_db)
):
    details = build_recommendation(data.city)

    crop = CropRequest(
        city=data.city,
        temperature=details["temperature"],
        humidity=details["humidity"],
        soil_type=details["soil_type"],
        latitude=details["lat"],
        longitude=details["lon"],
        recommended_crop=details["recommended"],
    )

    db.add(crop)
    db.commit()
    db.refresh(crop)

    return {
        "city": crop.city,
        "recommendations": details["recommendations"],
        "meta": {
            "temperature": crop.temperature,
            "humidity": crop.humidity,
            "soil_type": crop.soil_type,
            "region": details["region"],
        },
    }
