from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import Optional
import PyPDF2
import io
import uuid

from app.services.openai_service import extract_skills_from_resume
from app.services.supabase_service import create_profile, get_profile as get_profile_from_db

router = APIRouter()


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
        
        # Store in Supabase (required)
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
        
        # Store in Supabase (required)
        await create_profile(user_id, profile)
        
        return {"success": True, "profile": profile, "data": skill_data}
        
    except Exception as e:
        print(f"Error analyzing resume: {e}")
        raise HTTPException(status_code=500, detail=f"Error analyzing resume: {str(e)}")


@router.get("/{user_id}")
async def get_profile(user_id: str):
    """
    Get a user's profile from Supabase.
    """
    try:
        profile = await get_profile_from_db(user_id)
        
        if not profile:
            raise HTTPException(
                status_code=404,
                detail="Profile not found. Please upload your resume first."
            )
        
        return profile
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching profile: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching profile: {str(e)}")


@router.get("/{user_id}/skills")
async def get_skill_graph(user_id: str):
    """
    Get a user's skill graph from Supabase.
    """
    try:
        profile = await get_profile_from_db(user_id)
        
        if not profile:
            raise HTTPException(
                status_code=404,
                detail="Profile not found. Please upload your resume first."
            )
        
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
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching skill graph: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching skill graph: {str(e)}")
