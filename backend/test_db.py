# test_db.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.user import Base, User
from app.models.clothing import ClothingItem
from app.models.outfit import Outfit
import os

# Test database connection
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost/stylesync")
engine = create_engine(DATABASE_URL)

# Test table creation
Base.metadata.create_all(bind=engine)

# Test session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

# Test creating a user
test_user = User(
    email="test@stylesync.com",
    hashed_password="hashed_password_here",
    full_name="Test User"
)

db.add(test_user)
db.commit()
print("✅ Database connection and models working correctly!")
