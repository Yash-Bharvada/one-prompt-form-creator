from pymongo import MongoClient
from pymongo.database import Database
from pymongo.collection import Collection
import os
from dotenv import load_dotenv
from typing import Optional, Dict, Any
from datetime import datetime, timedelta

load_dotenv()

# MongoDB connection
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/")
DATABASE_NAME = "google_forms_creator"

# Global MongoDB client
_mongo_client: Optional[MongoClient] = None
_database: Optional[Database] = None


def get_mongo_client() -> MongoClient:
    """Get or create MongoDB client"""
    global _mongo_client
    if _mongo_client is None:
        _mongo_client = MongoClient(MONGODB_URI)
    return _mongo_client


def get_database() -> Database:
    """Get database instance"""
    global _database
    if _database is None:
        client = get_mongo_client()
        _database = client[DATABASE_NAME]
    return _database


def get_collection(collection_name: str) -> Collection:
    """Get a specific collection"""
    db = get_database()
    return db[collection_name]


# ============ Session Management ============

def create_session(user_email: str, session_id: str, expires_in_hours: int = 24) -> Dict[str, Any]:
    """Create a new user session"""
    sessions = get_collection("sessions")
    session_data = {
        "session_id": session_id,
        "user_email": user_email,
        "created_at": datetime.utcnow(),
        "expires_at": datetime.utcnow() + timedelta(hours=expires_in_hours)
    }
    sessions.insert_one(session_data)
    return session_data


def get_session(session_id: str) -> Optional[Dict[str, Any]]:
    """Retrieve a session by ID"""
    sessions = get_collection("sessions")
    session = sessions.find_one({"session_id": session_id})
    
    if session and session["expires_at"] > datetime.utcnow():
        return session
    return None


def delete_session(session_id: str) -> bool:
    """Delete a session"""
    sessions = get_collection("sessions")
    result = sessions.delete_one({"session_id": session_id})
    return result.deleted_count > 0


# ============ OAuth Token Management ============

def store_oauth_token(user_email: str, access_token: str, refresh_token: str, expires_in: int) -> None:
    """Store or update OAuth tokens for a user"""
    tokens = get_collection("oauth_tokens")
    token_data = {
        "user_email": user_email,
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_expiry": datetime.utcnow() + timedelta(seconds=expires_in),
        "created_at": datetime.utcnow()
    }
    tokens.update_one(
        {"user_email": user_email},
        {"$set": token_data},
        upsert=True
    )


def get_oauth_token(user_email: str) -> Optional[Dict[str, Any]]:
    """Retrieve OAuth tokens for a user"""
    tokens = get_collection("oauth_tokens")
    return tokens.find_one({"user_email": user_email})


def delete_oauth_token(user_email: str) -> bool:
    """Delete OAuth tokens for a user"""
    tokens = get_collection("oauth_tokens")
    result = tokens.delete_one({"user_email": user_email})
    return result.deleted_count > 0


# ============ Form History Management ============

def save_form_history(user_email: str, form_id: str, form_url: str, form_title: str, prompt: str) -> None:
    """Save form generation to history"""
    history = get_collection("form_history")
    history_data = {
        "user_email": user_email,
        "form_id": form_id,
        "form_url": form_url,
        "form_title": form_title,
        "prompt": prompt,
        "created_at": datetime.utcnow()
    }
    history.insert_one(history_data)


def get_form_history(user_email: str, skip: int = 0, limit: int = 20) -> list:
    """Retrieve form history for a user"""
    history = get_collection("form_history")
    cursor = history.find({"user_email": user_email}).sort("created_at", -1).skip(skip).limit(limit)
    return list(cursor)


# ============ Database Initialization ============

def verify_connection() -> bool:
    """Verify MongoDB connection"""
    try:
        client = get_mongo_client()
        client.server_info()  # Will raise exception if cannot connect
        return True
    except Exception as e:
        print(f"MongoDB connection failed: {e}")
        return False


# ============ User Settings Management ============

def get_user_settings(user_email: str) -> Optional[Dict[str, Any]]:
    """Retrieve user settings"""
    settings = get_collection("user_settings")
    return settings.find_one({"user_email": user_email})


def update_user_setting(user_email: str, key: str, value: Any) -> None:
    """Update a specific user setting"""
    settings = get_collection("user_settings")
    settings.update_one(
        {"user_email": user_email},
        {"$set": {key: value, "updated_at": datetime.utcnow()}},
        upsert=True
    )
