from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import auth, generate, history, settings
from database import verify_connection
import uvicorn

app = FastAPI(
    title="One-Prompt Google Form Creator API",
    description="Generate Google Forms from natural language prompts using AI",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(generate.router)
app.include_router(history.router)
app.include_router(settings.router)


@app.on_event("startup")
async def startup_event():
    """Verify MongoDB connection on startup"""
    if verify_connection():
        print("✓ MongoDB connection successful")
    else:
        print("✗ MongoDB connection failed - please check your MongoDB installation")


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "One-Prompt Google Form Creator API",
        "status": "running",
        "version": "1.0.0"
    }


@app.get("/health")
async def health():
    """Detailed health check"""
    mongo_status = verify_connection()
    
    return {
        "api": "healthy",
        "mongodb": "connected" if mongo_status else "disconnected"
    }


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
