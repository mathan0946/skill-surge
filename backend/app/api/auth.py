"""
Authentication API Routes
"""
from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel, EmailStr
from typing import Optional

from app.services.auth_service import (
    register_user,
    login_user,
    logout_user,
    get_user_from_token,
    refresh_session,
    reset_password,
    UserCredentials,
    UserRegistration,
)

router = APIRouter()


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None


class RefreshRequest(BaseModel):
    refresh_token: str


class ResetPasswordRequest(BaseModel):
    email: EmailStr


async def get_current_user(authorization: Optional[str] = Header(None)):
    """
    Dependency to get current user from Authorization header.
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required")
    
    try:
        # Extract token from "Bearer <token>"
        token = authorization.replace("Bearer ", "")
        user = await get_user_from_token(token)
        
        if not user:
            raise HTTPException(status_code=401, detail="Invalid or expired token")
        
        return user
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.post("/register")
async def register(request: RegisterRequest):
    """
    Register a new user.
    """
    credentials = UserRegistration(
        email=request.email,
        password=request.password,
        full_name=request.full_name,
    )
    
    result = await register_user(credentials)
    
    if not result.success:
        raise HTTPException(status_code=400, detail=result.error)
    
    return {
        "success": True,
        "user": result.user,
        "access_token": result.access_token,
        "refresh_token": result.refresh_token,
        "message": "Registration successful! Please check your email to verify your account.",
    }


@router.post("/login")
async def login(request: LoginRequest):
    """
    Login user with email and password.
    """
    credentials = UserCredentials(
        email=request.email,
        password=request.password,
    )
    
    result = await login_user(credentials)
    
    if not result.success:
        raise HTTPException(status_code=401, detail=result.error)
    
    return {
        "success": True,
        "user": result.user,
        "access_token": result.access_token,
        "refresh_token": result.refresh_token,
    }


@router.post("/logout")
async def logout(authorization: Optional[str] = Header(None)):
    """
    Logout current user.
    """
    if authorization:
        token = authorization.replace("Bearer ", "")
        await logout_user(token)
    
    return {"success": True, "message": "Logged out successfully"}


@router.get("/me")
async def get_current_user_info(user: dict = Depends(get_current_user)):
    """
    Get current user information.
    """
    return {
        "success": True,
        "user": user,
    }


@router.post("/refresh")
async def refresh_token(request: RefreshRequest):
    """
    Refresh access token using refresh token.
    """
    result = await refresh_session(request.refresh_token)
    
    if not result.success:
        raise HTTPException(status_code=401, detail=result.error)
    
    return {
        "success": True,
        "access_token": result.access_token,
        "refresh_token": result.refresh_token,
    }


@router.post("/reset-password")
async def request_password_reset(request: ResetPasswordRequest):
    """
    Request password reset email.
    """
    result = await reset_password(request.email)
    
    # Always return success to prevent email enumeration
    return {
        "success": True,
        "message": "If an account with that email exists, a password reset link has been sent.",
    }
