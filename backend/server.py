from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime
from passlib.context import CryptContext
import asyncio
from models import User, UserRole, UserStatus, ContentItem, ContentType, Token
from auth import create_access_token, verify_password


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
security = HTTPBearer()

async def create_super_admin():
    """Create super admin user if it doesn't exist"""
    try:
        existing_admin = await db.users.find_one({"email": "zbazzi199@gmail.com"})
        if not existing_admin:
            super_admin = User(
                email="zbazzi199@gmail.com",
                name="Super Admin",
                role=UserRole.SUPER_ADMIN,
                status=UserStatus.APPROVED,
                hashed_password=pwd_context.hash("SuperSecure2025!"),
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            await db.users.insert_one(super_admin.dict())
            logger.info("Super admin created successfully")
        else:
            logger.info("Super admin already exists")
    except Exception as e:
        logger.error(f"Error creating super admin: {e}")

async def create_default_content():
    """Create default content items if they don't exist"""
    try:
        default_content = [
            {
                "key": "landing_hero_title",
                "content_type": ContentType.LANDING_PAGE,
                "title": "Landing Page Hero Title",
                "content": "Welcome to Ahlulbayt Studies",
                "description": "Main title displayed on the landing page"
            },
            {
                "key": "landing_hero_subtitle",
                "content_type": ContentType.LANDING_PAGE,
                "title": "Landing Page Hero Subtitle",
                "content": "Discover our comprehensive Islamic education programs",
                "description": "Subtitle text below the hero title"
            },
            {
                "key": "enroll_button",
                "content_type": ContentType.BUTTON_LABEL,
                "title": "Enroll Button Label",
                "content": "Enroll Now",
                "description": "Text for the enrollment button on program cards"
            },
            {
                "key": "overview_button",
                "content_type": ContentType.BUTTON_LABEL,
                "title": "Overview Button Label",
                "content": "Program Overview",
                "description": "Text for the overview button on program cards"
            },
            {
                "key": "admin_dashboard_title",
                "content_type": ContentType.PAGE_TITLE,
                "title": "Admin Dashboard Title",
                "content": "Admin Dashboard",
                "description": "Title for the admin dashboard page"
            },
            {
                "key": "student_dashboard_title",
                "content_type": ContentType.PAGE_TITLE,
                "title": "Student Dashboard Title",
                "content": "Student Dashboard",
                "description": "Title for the student dashboard page"
            },
            {
                "key": "add_program_button",
                "content_type": ContentType.BUTTON_LABEL,
                "title": "Add Program Button",
                "content": "Add New Program",
                "description": "Button text for adding new programs"
            }
        ]
        
        super_admin = await db.users.find_one({"email": "zbazzi199@gmail.com"})
        if not super_admin:
            logger.error("Super admin not found for content creation")
            return
            
        for content_data in default_content:
            existing_content = await db.content_items.find_one({"key": content_data["key"]})
            if not existing_content:
                content_item = ContentItem(
                    **content_data,
                    updated_by=super_admin["id"]
                )
                await db.content_items.insert_one(content_item.dict())
                logger.info(f"Created default content: {content_data['key']}")
            else:
                logger.info(f"Content already exists: {content_data['key']}")
                
    except Exception as e:
        logger.error(f"Error creating default content: {e}")

async def init_database():
    """Initialize database with required data"""
    await create_super_admin()
    await create_default_content()

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.get("/check-super-admin")
async def check_super_admin():
    """Check if super admin exists in database"""
    try:
        admin = await db.users.find_one({"email": "zbazzi199@gmail.com"})
        if admin:
            return {
                "exists": True,
                "email": admin["email"],
                "name": admin["name"],
                "role": admin["role"],
                "status": admin["status"],
                "created_at": admin["created_at"]
            }
        else:
            return {"exists": False, "message": "Super admin not found"}
    except Exception as e:
        return {"exists": False, "error": str(e)}

@api_router.get("/content/{key}")
async def get_content_by_key(key: str):
    """Get content item by key"""
    try:
        content = await db.content_items.find_one({"key": key})
        if content:
            return {
                "key": content["key"],
                "content": content["content"],
                "title": content["title"],
                "content_type": content["content_type"]
            }
        else:
            return {"error": f"Content with key '{key}' not found"}
    except Exception as e:
        return {"error": str(e)}

@api_router.post("/test-jwt")
async def test_jwt_creation():
    """Test JWT token creation using super admin"""
    try:
        admin = await db.users.find_one({"email": "zbazzi199@gmail.com"})
        if admin:
            # Create token using MongoDB _id as string (critical requirement)
            token_data = {"sub": admin["id"]}  # Using 'id' field (UUID string) not '_id' (ObjectId)
            access_token = create_access_token(data=token_data)
            return {
                "access_token": access_token,
                "token_type": "bearer",
                "user_id": admin["id"],
                "message": "JWT token created successfully using MongoDB _id as string"
            }
        else:
            return {"error": "Super admin not found"}
    except Exception as e:
        return {"error": str(e)}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_db():
    await init_database()

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
