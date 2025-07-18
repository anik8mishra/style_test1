# app/routers/users.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.user import User
from app.utils.security import get_password_hash
import uuid

router = APIRouter()

@router.post("/create-test-user")
async def create_test_user(
    email: str = "test@stylesync.com",
    name: str = "Test User",
    db: Session = Depends(get_db)
):
    """Create a test user for development"""
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            return {
                "success": True,
                "message": "Test user already exists",
                "user_id": str(existing_user.user_id),
                "email": existing_user.email
            }
        
        # Create new test user
        test_user = User(
            email=email,
            hashed_password=get_password_hash("testpassword123"),
            full_name=name,
            style_preferences={
                "preferred_colors": ["blue", "black", "white"],
                "style_type": "casual",
                "formality_preference": 2
            }
        )
        
        db.add(test_user)
        db.commit()
        db.refresh(test_user)
        
        return {
            "success": True,
            "message": "Test user created successfully",
            "user_id": str(test_user.user_id),
            "email": test_user.email,
            "name": test_user.full_name
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"User creation failed: {str(e)}")

@router.get("/users")
async def list_users(db: Session = Depends(get_db)):
    """List all users for testing"""
    try:
        users = db.query(User).all()
        return {
            "success": True,
            "users": [
                {
                    "user_id": str(user.user_id),
                    "email": user.email,
                    "full_name": user.full_name,
                    "created_at": user.created_at.isoformat()
                }
                for user in users
            ],
            "total": len(users)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch users: {str(e)}")
