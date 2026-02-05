from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
import os
from dotenv import load_dotenv
from typing import Dict, Any, Tuple
from cryptography.fernet import Fernet
import base64
import hashlib

load_dotenv()

# OAuth2 Configuration
CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8000/api/auth/callback")
SECRET_KEY = os.getenv("SECRET_KEY", "")

# Scopes required for Google Forms and Drive
SCOPES = [
    "https://www.googleapis.com/auth/forms.body",
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/userinfo.email",
    "openid"
]

# Encryption setup
def get_cipher():
    """Get Fernet cipher for token encryption"""
    # Derive a key from SECRET_KEY
    key = base64.urlsafe_b64encode(hashlib.sha256(SECRET_KEY.encode()).digest())
    return Fernet(key)


def encrypt_token(token: str) -> str:
    """Encrypt a token"""
    cipher = get_cipher()
    return cipher.encrypt(token.encode()).decode()


def decrypt_token(encrypted_token: str) -> str:
    """Decrypt a token"""
    cipher = get_cipher()
    return cipher.decrypt(encrypted_token.encode()).decode()


# ============ Stage 1: Generate OAuth URL ============

def get_auth_url(state: str = None) -> str:
    """
    Generate Google OAuth2 authorization URL
    
    Args:
        state: Optional state parameter for CSRF protection
        
    Returns:
        Authorization URL to redirect user to
    """
    flow = Flow.from_client_config(
        {
            "web": {
                "client_id": CLIENT_ID,
                "client_secret": CLIENT_SECRET,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "redirect_uris": [REDIRECT_URI]
            }
        },
        scopes=SCOPES,
        redirect_uri=REDIRECT_URI
    )
    
    authorization_url, _ = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true',
        state=state,
        prompt='consent'  # Force consent to get refresh token
    )
    
    return authorization_url


# ============ Stage 2: Handle OAuth Callback ============

def handle_callback(code: str) -> Tuple[Dict[str, Any], str]:
    """
    Exchange authorization code for tokens and get user info
    
    Args:
        code: Authorization code from OAuth callback
        
    Returns:
        Tuple of (token_data, user_email)
    """
    flow = Flow.from_client_config(
        {
            "web": {
                "client_id": CLIENT_ID,
                "client_secret": CLIENT_SECRET,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "redirect_uris": [REDIRECT_URI]
            }
        },
        scopes=SCOPES,
        redirect_uri=REDIRECT_URI
    )
    
    # Exchange code for tokens
    flow.fetch_token(code=code)
    credentials = flow.credentials
    
    # Get user email
    user_info_service = build('oauth2', 'v2', credentials=credentials)
    user_info = user_info_service.userinfo().get().execute()
    user_email = user_info.get('email')
    
    # Prepare token data
    token_data = {
        "access_token": credentials.token,
        "refresh_token": credentials.refresh_token,
        "expires_in": 3600  # Default 1 hour
    }
    
    return token_data, user_email


# ============ Token Refresh ============

def refresh_access_token(refresh_token: str) -> Dict[str, Any]:
    """
    Refresh an expired access token
    
    Args:
        refresh_token: The refresh token
        
    Returns:
        New token data
    """
    credentials = Credentials(
        token=None,
        refresh_token=refresh_token,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=CLIENT_ID,
        client_secret=CLIENT_SECRET
    )
    
    # Refresh the token
    from google.auth.transport.requests import Request
    credentials.refresh(Request())
    
    return {
        "access_token": credentials.token,
        "expires_in": 3600
    }


def get_credentials_from_token(access_token: str) -> Credentials:
    """
    Create Credentials object from access token
    
    Args:
        access_token: The access token
        
    Returns:
        Google Credentials object
    """
    return Credentials(token=access_token)
