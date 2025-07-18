# app/routers/clothing.py
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.clothing import ClothingItem
from app.ai.vision import ClothingVisionAnalyzer
from app.ai.color_analysis import ColorAnalyzer
import shutil
import uuid
import os
from pathlib import Path
from typing import Optional

router = APIRouter()

def validate_and_convert_uuid(user_id: str) -> str:
    """Validate and convert user_id to proper UUID format"""
    try:
        # Try to parse as UUID
        uuid_obj = uuid.UUID(user_id)
        return str(uuid_obj)
    except ValueError:
        # If not a valid UUID, create one based on the string
        # This allows test strings like "test-user-123" to work
        namespace = uuid.NAMESPACE_DNS
        generated_uuid = uuid.uuid5(namespace, user_id)
        return str(generated_uuid)

async def save_uploaded_image(file: UploadFile) -> str:
    """Save uploaded image file and return the file path"""
    try:
        # Create uploads directory if it doesn't exist
        upload_dir = Path("uploads")
        upload_dir.mkdir(exist_ok=True)
        
        # Generate unique filename
        file_extension = file.filename.split(".")[-1] if file.filename else "jpg"
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        file_path = upload_dir / unique_filename
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Return relative path
        return str(file_path)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File save failed: {str(e)}")

@router.post("/upload")
async def upload_clothing_item(
    file: UploadFile = File(...),
    user_id: str = Query(..., description="User ID (can be string or UUID)"),
    db: Session = Depends(get_db)
):
    """Upload and analyze clothing item using AI modules"""
    try:
        # Validate file type
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Convert user_id to valid UUID
        valid_user_id = validate_and_convert_uuid(user_id)
        
        # Save uploaded image
        image_path = await save_uploaded_image(file)
        
        # Initialize AI analyzers
        vision_analyzer = ClothingVisionAnalyzer()
        color_analyzer = ColorAnalyzer()
        
        # Analyze image with AI
        ai_analysis = vision_analyzer.analyze_clothing_image(image_path)
        
        # Create clothing items list for color analysis
        clothing_items = [{
            'metadata': {'dominant_colors': ai_analysis.get('dominant_colors', ['gray'])}
        }]
        color_analysis = color_analyzer.analyze_color_palette(clothing_items)
        
        # Create clothing item with AI metadata
        clothing_item = ClothingItem(
            user_id=valid_user_id,  # Use the validated UUID
            category=ai_analysis.get('category', 'unknown'),
            subcategory=ai_analysis.get('subcategory', 'general'),
            color=ai_analysis.get('dominant_colors', ['gray'])[0],
            image_url=image_path,
            metadata={
                'ai_analysis': ai_analysis,
                'color_analysis': color_analysis,
                'original_filename': file.filename,
                'original_user_id': user_id,  # Keep original for reference
                'converted_user_id': valid_user_id
            }
        )
        
        # Save to database
        db.add(clothing_item)
        db.commit()
        db.refresh(clothing_item)
        
        return {
            "success": True,
            "message": "Clothing item analyzed and saved successfully",
            "item_id": str(clothing_item.item_id),
            "user_id": valid_user_id,
            "original_user_id": user_id,
            "ai_analysis": ai_analysis,
            "color_analysis": color_analysis,
            "image_path": image_path
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@router.get("/user/{user_id}/items")
async def get_user_clothing(user_id: str, db: Session = Depends(get_db)):
    """Get user's clothing catalog"""
    try:
        # Convert user_id to valid UUID
        valid_user_id = validate_and_convert_uuid(user_id)
        
        items = db.query(ClothingItem).filter(ClothingItem.user_id == valid_user_id).all()
        return {
            "success": True,
            "user_id": valid_user_id,
            "original_user_id": user_id,
            "items": [
                {
                    "item_id": str(item.item_id),
                    "category": item.category,
                    "subcategory": item.subcategory,
                    "color": item.color,
                    "brand": item.brand,
                    "image_url": item.image_url,
                    "metadata": item.metadata,
                    "created_at": item.created_at.isoformat()
                }
                for item in items
            ],
            "total": len(items)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch items: {str(e)}")
