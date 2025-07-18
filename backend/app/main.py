from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.routers import clothing, recommendations, users
from app.database.connection import engine
from app.models.user import Base
from pathlib import Path

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="StyleSync AI Fashion API", version="1.0.0")

# Create uploads directory if it doesn't exist
uploads_dir = Path("uploads")
uploads_dir.mkdir(exist_ok=True)

# Serve static files (uploaded images)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# CORS middleware for mobile app access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(clothing.router, prefix="/api/v1/clothing", tags=["clothing"])
app.include_router(recommendations.router, prefix="/api/v1/recommendations", tags=["recommendations"])
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])  # ✅ Added this line

# Root endpoint
@app.get("/")
async def root():
    return {"message": "StyleSync AI Fashion API is running!"}

# Health check endpoint
@app.get("/api/v1/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "StyleSync AI Fashion API",
        "ai_modules": ["vision", "color_analysis", "recommendations"],
        "database": "connected",
        "uploads_directory": str(uploads_dir.absolute()),
        "version": "1.0.0"
    }
