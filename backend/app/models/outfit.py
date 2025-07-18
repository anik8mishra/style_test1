# app/models/outfit.py
from sqlalchemy import Column, String, DateTime, JSON, ForeignKey, Integer, Float
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.models.user import Base

class Outfit(Base):
    __tablename__ = "outfits"
    
    outfit_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=False)
    
    # Outfit composition
    item_ids = Column(ARRAY(UUID), nullable=False)
    
    # Context information
    occasion = Column(String(100))
    mood = Column(String(50))
    weather_conditions = Column(JSON, default={})
    
    # AI-generated data
    ai_confidence_score = Column(Float, default=0.0)
    style_description = Column(String(500))
    color_analysis = Column(JSON, default={})
    
    # User feedback
    rating = Column(Integer)
    user_notes = Column(String(1000))
    
    # Usage tracking
    date_created = Column(DateTime, default=datetime.utcnow)
    times_worn = Column(Integer, default=0)
    last_worn = Column(DateTime)
    
    # Relationship
    user = relationship("User", back_populates="outfits")
