# app/models/clothing.py
from sqlalchemy import Column, String, DateTime, JSON, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.models.user import Base

class ClothingItem(Base):
    __tablename__ = "clothing_items"
    
    item_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=False)
    
    # Basic item info
    category = Column(String(50), nullable=False)
    subcategory = Column(String(50))
    color = Column(String(50))
    brand = Column(String(100))
    image_url = Column(String(500))
    
    # AI-generated metadata from your vision.py
    item_metadata = Column(JSON, default={})  # Stores AI analysis results
    
    # Usage tracking
    last_worn = Column(DateTime)
    purchase_date = Column(DateTime)
    times_worn = Column(Integer, default=0)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship
    user = relationship("User", back_populates="clothing_items")
