from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.api import profile, roadmap, interview, dashboard, roles, auth

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    description="AI Career Co-Pilot API with 13 autonomous agents",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(profile.router, prefix="/api/profile", tags=["Profile"])
app.include_router(roadmap.router, prefix="/api/roadmap", tags=["Roadmap"])
app.include_router(interview.router, prefix="/api/interview", tags=["Interview"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(roles.router, prefix="/api/roles", tags=["Roles"])


@app.get("/")
async def root():
    return {
        "name": settings.app_name,
        "status": "running",
        "agents": 13,
        "message": "Welcome to SkillSurge API",
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}
