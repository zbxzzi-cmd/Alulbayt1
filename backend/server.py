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
from datetime import datetime, timezone
from passlib.context import CryptContext
import asyncio
import secrets
import hashlib
from models import User, UserRole, UserStatus, ContentItem, ContentType, Token, UserCreate, UserLogin, UserResponse, PasswordResetRequest, PasswordReset, ProgramTab, StatTab
from auth import create_access_token, verify_password, get_current_user, verify_token, get_password_hash


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
                "content": "Enroll Now!",
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
            },
            {
                "key": "login_page_title",
                "content_type": ContentType.PAGE_TITLE,
                "title": "Login Page Title",
                "content": "Welcome Back",
                "description": "Title for the login page"
            },
            {
                "key": "login_page_subtitle",
                "content_type": ContentType.LANDING_PAGE,
                "title": "Login Page Subtitle",
                "content": "Sign in to access your Ahlulbayt Studies account",
                "description": "Subtitle text for the login page"
            },
            {
                "key": "signup_page_title",
                "content_type": ContentType.PAGE_TITLE,
                "title": "Sign Up Page Title",
                "content": "Join Ahlulbayt Studies",
                "description": "Title for the signup page"
            },
            {
                "key": "signup_page_subtitle",
                "content_type": ContentType.LANDING_PAGE,
                "title": "Sign Up Page Subtitle",
                "content": "Create your account to begin your Islamic education journey",
                "description": "Subtitle text for the signup page"
            },
            {
                "key": "login_button",
                "content_type": ContentType.BUTTON_LABEL,
                "title": "Login Button",
                "content": "Sign In",
                "description": "Text for the login button"
            },
            {
                "key": "signup_button",
                "content_type": ContentType.BUTTON_LABEL,
                "title": "Sign Up Button",
                "content": "Create Account",
                "description": "Text for the signup button"
            },
            {
                "key": "forgot_password_link",
                "content_type": ContentType.NAVIGATION,
                "title": "Forgot Password Link",
                "content": "Forgot your password?",
                "description": "Link text for password recovery"
            },
            {
                "key": "switch_to_signup",
                "content_type": ContentType.NAVIGATION,
                "title": "Switch to Sign Up",
                "content": "Don't have an account? Sign up here",
                "description": "Link to switch from login to signup"
            },
            {
                "key": "switch_to_login",
                "content_type": ContentType.NAVIGATION,
                "title": "Switch to Login",
                "content": "Already have an account? Sign in here",
                "description": "Link to switch from signup to login"
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

@api_router.post("/test-jwt-verify")
async def test_jwt_verification(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Test JWT token verification"""
    try:
        token_data = verify_token(credentials)
        user = await db.users.find_one({"id": token_data.user_id})
        if user:
            return {
                "token_valid": True,
                "user_id": user["id"],
                "email": user["email"],
                "role": user["role"],
                "message": "JWT token verified successfully"
            }
        else:
            return {"token_valid": False, "error": "User not found"}
    except HTTPException as e:
        return {"token_valid": False, "error": e.detail}
@api_router.post("/register", response_model=dict)
async def register_user(user_data: UserCreate):
    """Register a new user (admin or student)"""
    try:
        # Check if user already exists
        existing_user = await db.users.find_one({"email": user_data.email})
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Validate admin registration code if user is registering as admin
        if user_data.role == UserRole.ADMIN:
            if not user_data.admin_code or user_data.admin_code != os.environ.get("ADMIN_REGISTRATION_CODE"):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid admin registration code"
                )
        
        # Create user object
        hashed_password = get_password_hash(user_data.password)
        
        # Set user status based on role
        if user_data.role == UserRole.ADMIN:
            user_status = UserStatus.APPROVED  # Admins are auto-approved
        else:
            user_status = UserStatus.PENDING   # Students need approval
        
        new_user = User(
            email=user_data.email,
            name=user_data.name,
            age=user_data.age,
            phone=user_data.phone,
            role=user_data.role,
            status=user_status,
            hashed_password=hashed_password,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        # Insert user into database
        user_dict = new_user.dict()
        await db.users.insert_one(user_dict)
        
        # Create JWT token for the new user (using UUID string as required)
        token_data = {"sub": new_user.id}
        access_token = create_access_token(data=token_data)
        
        # Return user info and token
        user_response = UserResponse(**new_user.dict())
        
        return {
            "message": "User registered successfully",
            "user": user_response.dict(),
            "access_token": access_token,
            "token_type": "bearer",
            "status": "approved" if user_data.role == UserRole.ADMIN else "pending_approval"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )

@api_router.post("/login", response_model=dict)
async def login_user(user_credentials: UserLogin):
    """Login user and return JWT token"""
    try:
        # Find user by email
        user = await db.users.find_one({"email": user_credentials.email})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Verify password
        if not verify_password(user_credentials.password, user["hashed_password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Check if user is approved (students need approval, admins are auto-approved)
        if user["status"] != UserStatus.APPROVED:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is pending approval. Please wait for admin approval."
            )
        
        # Create JWT token using user ID (UUID string as required)
        token_data = {"sub": user["id"]}
        access_token = create_access_token(data=token_data)
        
        # Return user info and token
        user_response = UserResponse(**user)
        
        return {
            "message": "Login successful",
            "user": user_response.dict(),
            "access_token": access_token,
            "token_type": "bearer"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}"
        )

@api_router.post("/request-password-reset", response_model=dict)
async def request_password_reset(reset_request: PasswordResetRequest):
    """Request password reset - generates and stores reset token"""
    try:
        # Find user by email
        user = await db.users.find_one({"email": reset_request.email})
        if not user:
            # For security, don't reveal if email exists or not
            return {
                "message": "If an account with that email exists, a password reset link has been sent.",
                "success": True
            }
        
        # Generate secure reset token
        reset_token = secrets.token_urlsafe(32)
        token_hash = hashlib.sha256(reset_token.encode()).hexdigest()
        
        # Set expiration time (1 hour from now)
        from datetime import timedelta
        expires_at = datetime.utcnow() + timedelta(hours=1)
        
        # Store hashed token in database
        await db.users.update_one(
            {"id": user["id"]},
            {
                "$set": {
                    "password_reset_token": token_hash,
                    "password_reset_expires": expires_at,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        # In a real app, you would send an email with the reset_token
        # For MVP testing, we'll return the token (remove this in production)
        return {
            "message": "If an account with that email exists, a password reset link has been sent.",
            "success": True,
            "reset_token": reset_token  # REMOVE THIS IN PRODUCTION
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Password reset request failed: {str(e)}"
        )

@api_router.post("/reset-password", response_model=dict)
async def reset_password(reset_data: PasswordReset):
    """Reset password using valid reset token"""
    try:
        # Hash the provided token to match stored hash
        token_hash = hashlib.sha256(reset_data.token.encode()).hexdigest()
        
        # Find user with matching token that hasn't expired
        user = await db.users.find_one({
            "password_reset_token": token_hash,
            "password_reset_expires": {"$gt": datetime.utcnow()}
        })
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired reset token"
            )
        
        # Hash the new password
        new_hashed_password = get_password_hash(reset_data.new_password)
        
        # Update password and clear reset token
        await db.users.update_one(
            {"id": user["id"]},
            {
                "$set": {
                    "hashed_password": new_hashed_password,
                    "updated_at": datetime.utcnow()
                },
                "$unset": {
                    "password_reset_token": "",
                    "password_reset_expires": ""
                }
            }
        )
        
        return {
            "message": "Password has been successfully reset. You can now login with your new password.",
            "success": True
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Password reset failed: {str(e)}"
        )

@api_router.get("/users/{user_id}")
async def get_user_by_id(user_id: str):
    """Get user by ID (for testing purposes)"""
    try:
        user = await db.users.find_one({"id": user_id})
        if user:
            user_response = UserResponse(**user)
            return user_response.dict()
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@api_router.get("/users/pending/list")
async def get_pending_users():
    """Get list of pending users (for admin approval testing)"""
    try:
        pending_users = await db.users.find({"status": "pending"}).to_list(100)
        return {
            "pending_users": [
                {
                    "id": user["id"],
                    "email": user["email"],
                    "name": user["name"],
                    "role": user["role"],
                    "created_at": user["created_at"]
                }
                for user in pending_users
            ],
            "count": len(pending_users)
        }
    except Exception as e:
        return {"error": str(e)}

@api_router.get("/theme-test")
async def theme_test():
    """Test endpoint returning current theme specifications"""
    try:
        return {
            "light_theme": {
                "program_border_width": "2px",
                "stats_bg_color": "#ffffff",
                "text_primary": "#2C3E50",
                "card_border_aqua": "#E0F7FA",
                "card_border_pink": "#FCE4EC",
                "card_border_orange": "#FFF3E0",
                "card_border_green": "#E8F5E8"
            },
            "dark_theme": {
                "program_border_width": "3px",
                "stats_bg_color": "rgba(255, 255, 255, 0.06)",
                "text_primary": "#F8FAFC",
                "card_border_aqua": "#4A90A4",
                "card_border_pink": "#B8739B",
                "card_border_orange": "#CC9966",
                "card_border_green": "#7AAF7A"
            },
            "glassmorphism": {
                "backdrop_filter": "blur(25px)",
                "isolation": "isolate",
                "background_light": "rgba(255, 255, 255, 0.85)",
                "background_dark": "rgba(255, 255, 255, 0.06)"
            },
            "hover_effects": {
                "transform": "translateY(-8px)",
                "transition": "cubic-bezier(0.4, 0, 0.2, 1)",
                "shadow_dark": "0 12px 32px rgba(0, 0, 0, 0.4)"
            },
            "wcag_compliance": {
                "min_contrast_ratio": "4.5:1",
                "text_on_dark": "#F8FAFC",
                "text_on_light": "#2C3E50"
            },
            "message": "Theme system successfully implemented with comprehensive light/dark mode support"
        }
    except Exception as e:
        return {"error": str(e)}

# Admin Tab Management Endpoints

@api_router.get("/admin/program-tabs")
async def get_program_tabs():
    """Get all program tabs"""
    try:
        tabs = await db.program_tabs.find().sort("order", 1).to_list(length=None)
        return [ProgramTab(**tab) for tab in tabs]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching program tabs: {str(e)}"
        )

@api_router.post("/admin/program-tabs")
async def create_program_tab(tab_data: ProgramTab, current_user: User = Depends(get_current_user)):
    """Create a new program tab (admin only)"""
    try:
        if current_user.role not in [UserRole.SUPER_ADMIN, UserRole.ADMIN]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )
        
        # Get highest order value
        highest_order_doc = await db.program_tabs.find().sort("order", -1).limit(1).to_list(length=1)
        highest_order = highest_order_doc[0]["order"] + 1 if highest_order_doc else 1
        
        tab_dict = tab_data.dict()
        tab_dict["order"] = highest_order
        tab_dict["updated_at"] = datetime.now(timezone.utc)
        
        result = await db.program_tabs.insert_one(tab_dict)
        tab_dict["_id"] = str(result.inserted_id)
        
        return ProgramTab(**tab_dict)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating program tab: {str(e)}"
        )

@api_router.put("/admin/program-tabs/{tab_id}")
async def update_program_tab(tab_id: str, tab_data: dict, current_user: User = Depends(get_current_user)):
    """Update a program tab (admin only)"""
    try:
        if current_user.role not in [UserRole.SUPER_ADMIN, UserRole.ADMIN]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )
        
        tab_data["updated_at"] = datetime.now(timezone.utc)
        
        result = await db.program_tabs.update_one(
            {"id": tab_id},
            {"$set": tab_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Program tab not found")
        
        updated_tab = await db.program_tabs.find_one({"id": tab_id})
        return ProgramTab(**updated_tab)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating program tab: {str(e)}"
        )

@api_router.delete("/admin/program-tabs/{tab_id}")
async def delete_program_tab(tab_id: str, current_user: User = Depends(get_current_user)):
    """Delete a program tab (admin only)"""
    try:
        if current_user.role not in [UserRole.SUPER_ADMIN, UserRole.ADMIN]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )
        
        result = await db.program_tabs.delete_one({"id": tab_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Program tab not found")
        
        return {"message": "Program tab deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting program tab: {str(e)}"
        )

@api_router.get("/admin/stat-tabs")
async def get_stat_tabs():
    """Get all stat tabs"""
    try:
        tabs = await db.stat_tabs.find().sort("order", 1).to_list(length=None)
        return [StatTab(**tab) for tab in tabs]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching stat tabs: {str(e)}"
        )

@api_router.post("/admin/stat-tabs")
async def create_stat_tab(tab_data: StatTab, current_user: User = Depends(get_current_user)):
    """Create a new stat tab (admin only)"""
    try:
        if current_user.role not in [UserRole.SUPER_ADMIN, UserRole.ADMIN]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )
        
        # Get highest order value
        highest_order_doc = await db.stat_tabs.find().sort("order", -1).limit(1).to_list(length=1)
        highest_order = highest_order_doc[0]["order"] + 1 if highest_order_doc else 1
        
        tab_dict = tab_data.dict()
        tab_dict["order"] = highest_order
        tab_dict["updated_at"] = datetime.now(timezone.utc)
        
        result = await db.stat_tabs.insert_one(tab_dict)
        tab_dict["_id"] = str(result.inserted_id)
        
        return StatTab(**tab_dict)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating stat tab: {str(e)}"
        )

@api_router.put("/admin/stat-tabs/{tab_id}")
async def update_stat_tab(tab_id: str, tab_data: dict, current_user: User = Depends(get_current_user)):
    """Update a stat tab (admin only)"""
    try:
        if current_user.role not in [UserRole.SUPER_ADMIN, UserRole.ADMIN]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )
        
        tab_data["updated_at"] = datetime.now(timezone.utc)
        
        result = await db.stat_tabs.update_one(
            {"id": tab_id},
            {"$set": tab_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Stat tab not found")
        
        updated_tab = await db.stat_tabs.find_one({"id": tab_id})
        return StatTab(**updated_tab)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating stat tab: {str(e)}"
        )

@api_router.delete("/admin/stat-tabs/{tab_id}")
async def delete_stat_tab(tab_id: str, current_user: User = Depends(get_current_user)):
    """Delete a stat tab (admin only)"""
    try:
        if current_user.role not in [UserRole.SUPER_ADMIN, UserRole.ADMIN]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )
        
        result = await db.stat_tabs.delete_one({"id": tab_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Stat tab not found")
        
        return {"message": "Stat tab deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting stat tab: {str(e)}"
        )

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
