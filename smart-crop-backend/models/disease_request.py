from datetime import datetime

from sqlalchemy import Column, DateTime, Float, Integer, String

from database import Base


class DiseaseRequest(Base):
    __tablename__ = "disease_requests"

    id = Column(Integer, primary_key=True, index=True)
    image_url = Column(String)
    prediction = Column(String, index=True)
    confidence = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
