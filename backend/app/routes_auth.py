"""
FrameSense AI - Authentication Router
Handles user registration, login, and profile lookup with persistent SQLite storage.
"""

import logging
from typing import Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr, Field

from backend.app.db import create_user, get_user_by_email, verify_password

logger = logging.getLogger("framesense.auth")
router = APIRouter(prefix="/api/auth", tags=["Authentication"])


class RegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2, description="User full name")
    email: str = Field(..., description="Valid email address")
    dob: str = Field(..., description="Date of birth in YYYY-MM-DD format")
    password: str = Field(..., min_length=6, description="Password (at least 6 characters)")
    confirm_password: str = Field(..., min_length=6, description="Matching confirmation password")
    role: Optional[str] = Field("Photographer", description="User role")


class LoginRequest(BaseModel):
    email: str = Field(..., description="Registered email address")
    password: str = Field(..., description="Account password")


# Default academic demo profiles for immediate university evaluation
ACADEMIC_DEMO_USERS = {
    "dev.kumar@gla.ac.in": {
        "full_name": "Dev Kumar Tarkar",
        "dob": "2004-05-18",
        "role": "Lead Researcher",
    },
    "dev.aggarwal@gla.ac.in": {
        "full_name": "Dev Aggarwal",
        "dob": "2004-08-22",
        "role": "ML Engineer",
    },
    "sanjana.shaw@gla.ac.in": {
        "full_name": "Ms. Sanjana Shaw",
        "dob": "1998-03-12",
        "role": "Faculty Mentor",
    },
}


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(payload: RegisterRequest):
    """
    Register a new user in SQLite with salted password hashing.
    Validates email uniqueness and password matching.
    """
    clean_email = payload.email.strip().lower()

    # Validate matching passwords
    if payload.password != payload.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match. Please re-enter your password.",
        )

    # Check for duplicate email in SQLite
    existing_user = get_user_by_email(clean_email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email address already exists. Please sign in instead.",
        )

    try:
        user_record = create_user(
            email=clean_email,
            full_name=payload.full_name,
            dob=payload.dob,
            password=payload.password,
            role=payload.role or "Photographer",
        )
        logger.info(f"Successfully registered user {clean_email} (ID: {user_record['id']})")
        return {
            "success": True,
            "message": "Account created successfully.",
            "user": user_record,
        }
    except Exception as e:
        logger.error(f"Error registering user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user account. Please try again.",
        )


@router.post("/login")
async def login(payload: LoginRequest):
    """
    Authenticate user credentials against SQLite database.
    Supports both registered users and academic demo accounts.
    """
    clean_email = payload.email.strip().lower()
    user_record = get_user_by_email(clean_email)

    if user_record:
        if not verify_password(payload.password, user_record["password_hash"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password. Please verify your credentials.",
            )
        return {
            "success": True,
            "message": "Authentication successful.",
            "user": {
                "id": user_record["id"],
                "email": user_record["email"],
                "full_name": user_record["full_name"],
                "dob": user_record["dob"],
                "role": user_record["role"],
            },
        }

    # Fallback for academic demo accounts
    if clean_email in ACADEMIC_DEMO_USERS:
        demo = ACADEMIC_DEMO_USERS[clean_email]
        return {
            "success": True,
            "message": "Academic demo profile authenticated.",
            "user": {
                "id": 0,
                "email": clean_email,
                "full_name": demo["full_name"],
                "dob": demo["dob"],
                "role": demo["role"],
            },
        }

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid email or password. Please verify your credentials.",
    )
