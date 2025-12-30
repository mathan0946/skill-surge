from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import Optional
import PyPDF2
import io
import uuid

from app.services.openai_service import extract_skills_from_resume
from app.services.supabase_service import create_profile, get_profile as get_profile_from_db

router = APIRouter()

# In-memory storage for demo (fallback if Supabase not configured)
profiles_db = {}


class ResumeTextRequest(BaseModel):
    resume_text: str
    user_id: Optional[str] = None


class ProfileResponse(BaseModel):
    id: str
    userId: str
    skills: list
    experience: list
    education: list
    skillGraph: list
    summary: Optional[str] = None
    strongestSkills: Optional[list] = None
    skillGaps: Optional[list] = None


@router.post("/upload")
async def upload_resume(file: UploadFile = File(...)):
    """
    Upload a resume PDF and extract skills using GPT-4o-mini.
    """
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    try:
        # Read PDF content
        content = await file.read()
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(content))
        
        # Extract text from all pages
        resume_text = ""
        for page in pdf_reader.pages:
            resume_text += page.extract_text() + "\n"
        
        if not resume_text.strip():
            resume_text = "Demo resume: Software Engineer with JavaScript, React, Python skills"
        
        # Use GPT-4o-mini to extract skills and build knowledge graph
        skill_data = await extract_skills_from_resume(resume_text)
        
        # Create profile with unique IDs
        profile_id = str(uuid.uuid4())
        user_id = f"user-{uuid.uuid4().hex[:8]}"
        
        profile = {
            "id": profile_id,
            "userId": user_id,
            "skills": [s.get("name") for s in skill_data.get("skills", [])],
            "experience": skill_data.get("experience", []),
            "education": skill_data.get("education", []),
            "skillGraph": skill_data.get("skills", []),
            "summary": skill_data.get("summary", ""),
            "strongestSkills": skill_data.get("strongestSkills", []),
            "skillGaps": skill_data.get("skillGaps", []),
        }
        
        # Store in memory
        profiles_db[user_id] = profile
        
        # Also store in Supabase
        await create_profile(user_id, profile)
        
        return {"success": True, "profile": profile, "data": skill_data}
        
    except Exception as e:
        print(f"Error processing resume: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing resume: {str(e)}")


@router.post("/analyze")
async def analyze_resume_text(request: ResumeTextRequest):
    """
    Analyze resume text directly using GPT-4o-mini.
    This endpoint is for when text is pasted or sent directly.
    """
    try:
        resume_text = request.resume_text
        
        if not resume_text.strip():
            raise HTTPException(status_code=400, detail="Resume text cannot be empty")
        
        # Use GPT-4o-mini to extract skills and build knowledge graph
        skill_data = await extract_skills_from_resume(resume_text)
        
        # Create profile with unique IDs
        profile_id = str(uuid.uuid4())
        user_id = request.user_id or f"user-{uuid.uuid4().hex[:8]}"
        
        profile = {
            "id": profile_id,
            "userId": user_id,
            "skills": [s.get("name") for s in skill_data.get("skills", [])],
            "experience": skill_data.get("experience", []),
            "education": skill_data.get("education", []),
            "skillGraph": skill_data.get("skills", []),
            "summary": skill_data.get("summary", ""),
            "strongestSkills": skill_data.get("strongestSkills", []),
            "skillGaps": skill_data.get("skillGaps", []),
        }
        
        # Store in memory
        profiles_db[user_id] = profile
        
        # Also store in Supabase
        await create_profile(user_id, profile)
        
        return {"success": True, "profile": profile, "data": skill_data}
        
    except Exception as e:
        print(f"Error analyzing resume: {e}")
        raise HTTPException(status_code=500, detail=f"Error analyzing resume: {str(e)}")


@router.get("/{user_id}")
async def get_profile(user_id: str):
    """
    Get a user's profile from memory, Supabase, or return demo.
    """
    # Check in-memory first
    if user_id in profiles_db:
        return profiles_db[user_id]
    
    # Try to fetch from Supabase
    try:
        db_profile = await get_profile_from_db(user_id)
        if db_profile:
            profiles_db[user_id] = db_profile
            return db_profile
    except Exception as e:
        print(f"Supabase fetch error: {e}")
    
    # Return demo profile as fallback
    demo_profile = {
        "id": "demo-profile-1",
        "userId": user_id,
        "skills": ["JavaScript", "React", "Python", "Node.js", "SQL", "Git"],
        "experience": ["Software Engineer at Tech Corp", "Intern at StartupXYZ"],
        "education": ["B.S. Computer Science"],
        "skillGraph": [
            {"id": "1", "name": "JavaScript", "level": 85, "category": "Frontend", "connections": ["2", "3"]},
            {"id": "2", "name": "React", "level": 80, "category": "Frontend", "connections": ["1", "4"]},
            {"id": "3", "name": "TypeScript", "level": 70, "category": "Frontend", "connections": ["1", "2"]},
            {"id": "4", "name": "Node.js", "level": 75, "category": "Backend", "connections": ["2", "5"]},
            {"id": "5", "name": "Python", "level": 65, "category": "Backend", "connections": ["4", "6"]},
            {"id": "6", "name": "SQL", "level": 70, "category": "Database", "connections": ["5"]},
        ],
        "summary": "Experienced software engineer with full-stack development skills.",
        "strongestSkills": ["JavaScript", "React"],
        "skillGaps": ["System Design", "Cloud Architecture"],
    }
    profiles_db[user_id] = demo_profile
    return demo_profile


@router.get("/{user_id}/skills")
async def get_skill_graph(user_id: str):
    """
    Get a user's skill graph.
    """
    profile = await get_profile(user_id)
    return {
        "userId": user_id,
        "skills": profile.get("skillGraph", []),
        "summary": {
            "totalSkills": len(profile.get("skillGraph", [])),
            "avgLevel": sum(s.get("level", 0) for s in profile.get("skillGraph", [])) // max(len(profile.get("skillGraph", [])), 1),
            "strongSkills": len([s for s in profile.get("skillGraph", []) if s.get("level", 0) >= 70]),
            "weakSkills": len([s for s in profile.get("skillGraph", []) if s.get("level", 0) < 50]),
        }
    }
