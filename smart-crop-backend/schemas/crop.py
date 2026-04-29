from pydantic import BaseModel, Field

class CropRequestSchema(BaseModel):
    city: str = Field(..., min_length=2, max_length=50)
    temperature: float = Field(..., ge=0, le=60)
    humidity: float = Field(..., ge=0, le=100)
    soil_type: str = Field(..., min_length=3, max_length=30)