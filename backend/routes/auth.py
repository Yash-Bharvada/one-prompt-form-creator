from fastapi import APIRouter, HTTPException, Response, Request
from fastapi.responses import RedirectResponse
import secrets
from services.auth_service import get_auth_url, handle_callback, encrypt_token
from database import create_session, get_session, delete_session, store_oauth_token, delete_oauth_token

router = APIRouter(prefix="/api/auth", tags=["authentication"])

# In-memory state storage (in production, use Redis or similar)
_auth_states = {}


@router.get("/login")
async def login():
    """
    Stage 1: Generate Google OAuth URL and redirect user
    
    Returns:
        OAuth authorization URL
    """
    try:
        # Generate CSRF state token
        state = secrets.token_urlsafe(32)
        
        # Get OAuth URL
        auth_url = get_auth_url(state=state)
        
        return {"auth_url": auth_url, "state": state}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate auth URL: {str(e)}")


@router.get("/callback")
async def callback(code: str, state: str = None, response: Response = None):
    """
    Stage 2: Handle OAuth callback, exchange code for tokens
    
    Args:
        code: Authorization code from Google
        state: CSRF state token
        
    Returns:
        Redirect to frontend with session
    """
    try:
        # In this simplified flow, we trust the state if it comes back from Google
        # For stricter security, the frontend should verify the state matches what it received in /login
        
        # Exchange code for tokens
        token_data, user_email = handle_callback(code)
        
        # Encrypt and store tokens
        encrypted_access = encrypt_token(token_data["access_token"])
        encrypted_refresh = encrypt_token(token_data["refresh_token"])
        
        store_oauth_token(
            user_email=user_email,
            access_token=encrypted_access,
            refresh_token=encrypted_refresh,
            expires_in=token_data["expires_in"]
        )
        
        # Create session
        session_id = secrets.token_urlsafe(32)
        create_session(user_email=user_email, session_id=session_id)
        
        # Determine redirect URL based on environment
        import os
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
        
        # Set session cookie and redirect to frontend
        redirect_response = RedirectResponse(url=frontend_url)
        redirect_response.set_cookie(
            key="session_id",
            value=session_id,
            httponly=True,
            max_age=86400,  # 24 hours
            samesite="lax",
            secure=True if "https" in frontend_url else False
        )
        
        return redirect_response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OAuth callback failed: {str(e)}")


@router.get("/status")
async def auth_status(request: Request):
    """
    Check current authentication status
    
    Returns:
        User authentication status
    """
    session_id = request.cookies.get("session_id")
    
    if not session_id:
        return {"authenticated": False}
    
    session = get_session(session_id)
    
    if not session:
        return {"authenticated": False}
    
    return {
        "authenticated": True,
        "user_email": session["user_email"]
    }


@router.post("/logout")
async def logout(request: Request, response: Response):
    """
    Logout user and clear session
    
    Returns:
        Success message
    """
    session_id = request.cookies.get("session_id")
    
    if session_id:
        session = get_session(session_id)
        if session:
            # Delete tokens and session
            delete_oauth_token(session["user_email"])
            delete_session(session_id)
    
    # Clear cookie
    response.delete_cookie("session_id")
    
    return {"message": "Logged out successfully"}
