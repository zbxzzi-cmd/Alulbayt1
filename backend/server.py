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
from models import User, UserRole, UserStatus, ContentItem, ContentType


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

async def init_database():
    """Initialize database with required data"""
    await create_super_admin()

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
