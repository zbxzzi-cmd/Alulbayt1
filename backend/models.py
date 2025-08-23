from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime
from enum import Enum
import uuid

class UserRole(str, Enum):
    SUPER_ADMIN = "super_admin"
    ADMIN = "admin"
    STUDENT = "student"

class UserStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    age: Optional[int] = None
    phone: Optional[str] = None
    role: UserRole
    status: UserStatus = UserStatus.PENDING
    hashed_password: str
    created_at: datetime = Field(default_factory=lambda: datetime.utcnow())
    updated_at: datetime = Field(default_factory=lambda: datetime.utcnow())

class UserCreate(BaseModel):
    email: EmailStr
    name: str
    age: Optional[int] = None
    phone: Optional[str] = None
    role: UserRole
    password: str
    admin_code: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: EmailStr
    name: str
    age: Optional[int] = None
    phone: Optional[str] = None
    role: UserRole
    status: UserStatus
    created_at: datetime

class Program(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    tagline: str
    logo_url: Optional[str] = None
    theme_color: str = "#3B82F6"  # Default light blue
    overview: str = ""
    created_by: str  # Admin user ID
    created_at: datetime = Field(default_factory=lambda: datetime.utcnow())
    updated_at: datetime = Field(default_factory=lambda: datetime.utcnow())
    is_active: bool = True

class ProgramCreate(BaseModel):
    name: str
    description: str
    tagline: str
    logo_url: Optional[str] = None
    theme_color: str = "#3B82F6"
    overview: str = ""

class ProgramResponse(BaseModel):
    id: str
    name: str
    description: str
    tagline: str
    logo_url: Optional[str] = None
    theme_color: str
    overview: str
    created_at: datetime
    enrolled_count: int = 0

class EnrollmentStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

class Enrollment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    student_id: str
    program_id: str
    status: EnrollmentStatus = EnrollmentStatus.PENDING
    requested_at: datetime = Field(default_factory=lambda: datetime.utcnow())
    approved_at: Optional[datetime] = None
    approved_by: Optional[str] = None  # Admin user ID

class EnrollmentRequest(BaseModel):
    program_id: str

class EnrollmentResponse(BaseModel):
    id: str
    student_id: str
    program_id: str
    status: EnrollmentStatus
    requested_at: datetime
    approved_at: Optional[datetime] = None
    student_name: str
    program_name: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[str] = None