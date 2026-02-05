from fastapi import APIRouter, HTTPException, Request, Query
from database import get_session, get_form_history
from typing import List, Dict, Any

router = APIRouter(prefix="/api", tags=["history"])


@router.get("/history")
async def get_history(
    request: Request,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100)
) -> List[Dict[str, Any]]:
    """
    Retrieve user's form generation history
    
    Args:
        skip: Number of records to skip (pagination)
        limit: Maximum number of records to return
        
    Returns:
        List of form history records
    """
    session_id = request.cookies.get("session_id")
    
    if not session_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    session = get_session(session_id)
    
    if not session:
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    
    user_email = session["user_email"]
    
    # Get history from database
    history = get_form_history(user_email, skip=skip, limit=limit)
    
    # Convert ObjectId to string for JSON serialization
    for record in history:
        record["_id"] = str(record["_id"])
    
    return history

@router.get("/stats")
async def get_stats(request: Request) -> Dict[str, Any]:
    """Get usage statistics for the user"""
    session_id = request.cookies.get("session_id")
    if not session_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    session = get_session(session_id)
    if not session:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    # Get all history to count
    # Note: For production, we should have a more efficient specific count query
    history = get_form_history(session["user_email"], skip=0, limit=1000)
    
    return {
        "total_forms": len(history),
        # Hardcoded for now as we don't track these yet
        "total_responses": 0,
        "tokens_used": "0" 
    }
