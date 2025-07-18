# app/routers/recommendations.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.ai.recommendations import OutfitRecommendationEngine

router = APIRouter()

@router.post("/generate")
async def generate_outfit_recommendations(
    request_data: dict,
    db: Session = Depends(get_db)
):
    """Generate outfit recommendations using your AI engine"""
    try:
        # Extract request parameters
        user_id = request_data.get('user_id')
        mood = request_data.get('mood', 'confident')
        occasion = request_data.get('occasion', 'casual')
        weather = request_data.get('weather', {})
        
        # Use your recommendation engine
        recommendation_engine = OutfitRecommendationEngine()
        recommendations = recommendation_engine.generate_outfit_recommendations(
            user_id=user_id,
            mood=mood,
            occasion=occasion,
            weather=weather,
            db=db
        )
        
        return {"recommendations": recommendations}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendation failed: {str(e)}")
