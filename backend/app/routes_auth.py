"""
FrameSense AI - Authentication Router
Handles user registration, login, and profile lookup with persistent SQLite storage.
"""

import base64
import hashlib
import hmac
import json
import logging
import time
from typing import Optional
from fastapi import APIRouter, Depends, Header, HTTPException, status
from pydantic import BaseModel, EmailStr, Field

from backend.app.db import create_user, get_user_by_email, verify_password

logger = logging.getLogger("framesense.auth")
router = APIRouter(prefix="/api/auth", tags=["Authentication"])

JWT_SECRET_KEY = "framesense_ai_btech_capstone_jwt_secret_2026"


def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode('utf-8')


def create_access_token(data: dict, expires_in_seconds: int = 86400) -> str:
    """Creates a signed RFC-7519 compliant HS256 JWT access token."""
    header = {"alg": "HS256", "typ": "JWT"}
    payload = {
        **data,
        "iat": int(time.time()),
        "exp": int(time.time()) + expires_in_seconds,
    }
    header_b64 = _b64url_encode(json.dumps(header).encode('utf-8'))
    payload_b64 = _b64url_encode(json.dumps(payload).encode('utf-8'))
    signing_input = f"{header_b64}.{payload_b64}"
    sig = hmac.new(JWT_SECRET_KEY.encode('utf-8'), signing_input.encode('utf-8'), hashlib.sha256).digest()
    sig_b64 = _b64url_encode(sig)
    return f"{signing_input}.{sig_b64}"


def _b64url_decode(s: str) -> bytes:
    padding = '=' * (4 - len(s) % 4)
    return base64.urlsafe_b64decode(s + padding)


def decode_access_token(token: str) -> Optional[dict]:
    """Validates signature and expiry of an HS256 JWT access token."""
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None
        header_b64, payload_b64, sig_b64 = parts
        signing_input = f"{header_b64}.{payload_b64}"
        expected_sig = hmac.new(JWT_SECRET_KEY.encode('utf-8'), signing_input.encode('utf-8'), hashlib.sha256).digest()
        actual_sig = _b64url_decode(sig_b64)
        if not hmac.compare_digest(expected_sig, actual_sig):
            return None
        payload = json.loads(_b64url_decode(payload_b64).decode('utf-8'))
        if payload.get("exp", 0) < time.time():
            return None
        return payload
    except Exception:
        return None


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
        token = create_access_token({"sub": clean_email, "name": payload.full_name, "role": user_record.get("role", "Photographer")})
        return {
            "success": True,
            "message": "Account created successfully.",
            "access_token": token,
            "token_type": "bearer",
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
        token = create_access_token({"sub": clean_email, "name": user_record["full_name"], "role": user_record["role"]})
        return {
            "success": True,
            "message": "Authentication successful.",
            "access_token": token,
            "token_type": "bearer",
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
        token = create_access_token({"sub": clean_email, "name": demo["full_name"], "role": demo["role"]})
        return {
            "success": True,
            "message": "Academic demo profile authenticated.",
            "access_token": token,
            "token_type": "bearer",
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


async def get_current_user(authorization: Optional[str] = Header(None)) -> dict:
    """Dependency to retrieve and validate user from Bearer token."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authentication token. Please sign in.",
        )
    token = authorization.split(" ", 1)[1]
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session token expired or corrupted. Please sign in again.",
        )
    email = payload.get("sub", "").strip().lower()
    user_record = get_user_by_email(email)
    if user_record:
        return {
            "id": user_record["id"],
            "email": user_record["email"],
            "full_name": user_record["full_name"],
            "dob": user_record["dob"],
            "role": user_record["role"],
        }
    if email in ACADEMIC_DEMO_USERS:
        demo = ACADEMIC_DEMO_USERS[email]
        return {
            "id": 0,
            "email": email,
            "full_name": demo["full_name"],
            "dob": demo["dob"],
            "role": demo["role"],
        }
    return payload


@router.get("/me")
async def get_profile(current_user: dict = Depends(get_current_user)):
    """Returns the authenticated user's profile verified via JWT Bearer token."""
    return {"success": True, "user": current_user}
