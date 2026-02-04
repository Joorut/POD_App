from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime


# User schemas
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    full_name: str
    role: Optional[str] = "worker"


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: str
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# POD schemas
class PODCreate(BaseModel):
    case_number: str
    driver_name: str
    foreman_name: Optional[str] = None
    customer_name: Optional[str] = None
    notes: Optional[str] = None
    photo_paths: Optional[List[str]] = None
    signature_path: Optional[str] = None


class PODResponse(PODCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class EmailRequest(BaseModel):
    to_email: str
    subject: Optional[str] = None
    body: Optional[str] = None
