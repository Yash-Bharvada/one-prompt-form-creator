from fastapi import APIRouter, HTTPException, Request, Depends
from models import FormGenerationRequest, FormGenerationResponse
from services.gemini_service import generate_form_schema
from services.google_form_service import GoogleFormService
from services.google_form_service import GoogleFormService
from services.auth_service import decrypt_token, refresh_access_token, encrypt_token
from database import get_session, get_oauth_token, store_oauth_token, save_form_history, get_user_settings
from datetime import datetime

router = APIRouter(prefix="/api", tags=["generation"])


def get_current_user(request: Request):
    """Dependency to get current authenticated user"""
    session_id = request.cookies.get("session_id")
    
    if not session_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    session = get_session(session_id)
    
    if not session:
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    
    return session["user_email"]


@router.post("/generate", response_model=FormGenerationResponse)
async def generate_form(
    request: FormGenerationRequest,
    user_email: str = Depends(get_current_user)
):
    """
    Main form generation endpoint
    
    Flow:
    1. Validate session
    2. Retrieve user OAuth token
    3. Call Gemini to generate form schema
    4. Call GoogleFormService to create form
    5. Save to history
    6. Return form URL
    """
    try:
        # Step 1: Get user's OAuth token
        token_data = get_oauth_token(user_email)
        
        if not token_data:
            raise HTTPException(status_code=401, detail="No OAuth token found. Please re-authenticate.")
        
        # Decrypt access token
        access_token = decrypt_token(token_data["access_token"])
        
        # Check if token is expired and refresh if needed
        if token_data["token_expiry"] < datetime.utcnow():
            refresh_token = decrypt_token(token_data["refresh_token"])
            new_token_data = refresh_access_token(refresh_token)
            
            # Update stored token
            encrypted_access = encrypt_token(new_token_data["access_token"])
            store_oauth_token(
                user_email=user_email,
                access_token=encrypted_access,
                refresh_token=token_data["refresh_token"],  # Keep same refresh token
                expires_in=new_token_data["expires_in"]
            )
            
            access_token = new_token_data["access_token"]
        
        # Get user specific Gemini Key if available
        user_settings = get_user_settings(user_email)
        user_api_key = None
        
        if user_settings and "gemini_api_key" in user_settings:
            try:
                user_api_key = decrypt_token(user_settings["gemini_api_key"])
            except Exception:
                print("Failed to decrypt user API key, falling back to default")

        # Step 2: Generate form schema with Gemini
        form_schema = generate_form_schema(request.prompt, api_key=user_api_key)
        
        if not form_schema:
            raise HTTPException(
                status_code=500,
                detail="Failed to generate form schema. Please try rephrasing your prompt."
            )
        
        # Step 3: Create Google Form
        form_service = GoogleFormService(access_token)
        form_url, form_id = form_service.create_form(form_schema)
        
        # Step 4: Save to history
        save_form_history(
            user_email=user_email,
            form_id=form_id,
            form_url=form_url,
            form_title=form_schema.title,
            prompt=request.prompt
        )
        
        # Step 5: Return response
        return FormGenerationResponse(
            form_url=form_url,
            form_id=form_id,
            title=form_schema.title
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Form generation failed: {str(e)}")


# Import encrypt_token for token refresh
from services.auth_service import encrypt_token
