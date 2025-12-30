"""
Authentication Service using Supabase Auth
"""
from supabase import create_client, Client
from app.config import settings
from typing import Optional, Dict, Any
from pydantic import BaseModel, EmailStr


class UserCredentials(BaseModel):
    email: EmailStr
    password: str


class UserRegistration(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None


class AuthResponse(BaseModel):
    success: bool
    user: Optional[Dict[str, Any]] = None
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    error: Optional[str] = None


def get_supabase_client() -> Client:
    """Get Supabase client instance."""
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)


async def register_user(credentials: UserRegistration) -> AuthResponse:
    """
    Register a new user with Supabase Auth.
    """
    try:
        supabase = get_supabase_client()
        
        # Sign up with email and password
        response = supabase.auth.sign_up({
            "email": credentials.email,
            "password": credentials.password,
            "options": {
                "data": {
                    "full_name": credentials.full_name or "",
                }
            }
        })
        
        if response.user:
            return AuthResponse(
                success=True,
                user={
                    "id": response.user.id,
                    "email": response.user.email,
                    "full_name": response.user.user_metadata.get("full_name", ""),
                    "created_at": str(response.user.created_at),
                },
                access_token=response.session.access_token if response.session else None,
                refresh_token=response.session.refresh_token if response.session else None,
            )
        else:
            return AuthResponse(
                success=False,
                error="Registration failed. Please try again."
            )
            
    except Exception as e:
        error_msg = str(e)
        if "User already registered" in error_msg:
            return AuthResponse(success=False, error="Email already registered")
        return AuthResponse(success=False, error=f"Registration error: {error_msg}")


async def login_user(credentials: UserCredentials) -> AuthResponse:
    """
    Login user with Supabase Auth.
    """
    try:
        supabase = get_supabase_client()
        
        # Sign in with email and password
        response = supabase.auth.sign_in_with_password({
            "email": credentials.email,
            "password": credentials.password,
        })
        
        if response.user and response.session:
            return AuthResponse(
                success=True,
                user={
                    "id": response.user.id,
                    "email": response.user.email,
                    "full_name": response.user.user_metadata.get("full_name", ""),
                    "created_at": str(response.user.created_at),
                },
                access_token=response.session.access_token,
                refresh_token=response.session.refresh_token,
            )
        else:
            return AuthResponse(
                success=False,
                error="Invalid email or password"
            )
            
    except Exception as e:
        error_msg = str(e)
        if "Invalid login credentials" in error_msg:
            return AuthResponse(success=False, error="Invalid email or password")
        return AuthResponse(success=False, error=f"Login error: {error_msg}")


async def logout_user(access_token: str) -> AuthResponse:
    """
    Logout user from Supabase.
    """
    try:
        supabase = get_supabase_client()
        supabase.auth.sign_out()
        return AuthResponse(success=True)
    except Exception as e:
        return AuthResponse(success=False, error=str(e))


async def get_user_from_token(access_token: str) -> Optional[Dict[str, Any]]:
    """
    Get user data from access token.
    """
    try:
        supabase = get_supabase_client()
        response = supabase.auth.get_user(access_token)
        
        if response.user:
            return {
                "id": response.user.id,
                "email": response.user.email,
                "full_name": response.user.user_metadata.get("full_name", ""),
                "created_at": str(response.user.created_at),
            }
        return None
    except Exception as e:
        print(f"Token verification error: {e}")
        return None


async def refresh_session(refresh_token: str) -> AuthResponse:
    """
    Refresh user session with refresh token.
    """
    try:
        supabase = get_supabase_client()
        response = supabase.auth.refresh_session(refresh_token)
        
        if response.session:
            return AuthResponse(
                success=True,
                user={
                    "id": response.user.id,
                    "email": response.user.email,
                    "full_name": response.user.user_metadata.get("full_name", ""),
                },
                access_token=response.session.access_token,
                refresh_token=response.session.refresh_token,
            )
        return AuthResponse(success=False, error="Failed to refresh session")
    except Exception as e:
        return AuthResponse(success=False, error=str(e))


async def reset_password(email: str) -> AuthResponse:
    """
    Send password reset email.
    """
    try:
        supabase = get_supabase_client()
        supabase.auth.reset_password_for_email(email)
        return AuthResponse(success=True)
    except Exception as e:
        return AuthResponse(success=False, error=str(e))
