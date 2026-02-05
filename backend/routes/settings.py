from fastapi import APIRouter, HTTPException, Request, Body
from database import get_session, get_user_settings, update_user_setting
from services.auth_service import encrypt_token, decrypt_token
from pydantic import BaseModel
import os

router = APIRouter(prefix="/api/settings", tags=["settings"])

class GeminiKeyRequest(BaseModel):
    api_key: str

@router.post("/gemini-key")
async def save_gemini_key(request: Request, key_data: GeminiKeyRequest):
    """Save user's Gemini API key (encrypted)"""
    session_id = request.cookies.get("session_id")
    if not session_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    session = get_session(session_id)
    if not session:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    if not key_data.api_key.strip():
        # If empty, maybe delete? For now just return
        return {"status": "skipped"}
        
    encrypted_key = encrypt_token(key_data.api_key)
    update_user_setting(session["user_email"], "gemini_api_key", encrypted_key)
    
    return {"status": "success"}

@router.get("/gemini-key")
async def get_gemini_key_status(request: Request):
    """Check if user has a custom Gemini API key set"""
    session_id = request.cookies.get("session_id")
    if not session_id:
        return {"is_set": False}
    
    session = get_session(session_id)
    if not session:
        return {"is_set": False}
        
    settings = get_user_settings(session["user_email"])
    is_set = False
    
    if settings and "gemini_api_key" in settings:
        is_set = True
        
    return {
        "is_set": is_set,
        "default_available": os.getenv("GEMINI_API_KEY") is not None
    }
