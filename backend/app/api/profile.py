from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import uuid

from app.services.openai_service import extract_skills_from_resume
from app.services.supabase_service import create_profile, get_profile as get_profile_from_db
from app.services.resume_parser import parse_resume_file, get_enhanced_prompt_context

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


# Supported file extensions
SUPPORTED_EXTENSIONS = ['.pdf', '.docx', '.doc', '.txt']


@router.post("/upload")
async def upload_resume(file: UploadFile = File(...)):
    """
    Upload a resume (PDF, DOCX, or TXT) and extract comprehensive profile data.
    Uses robust multi-method parsing + GPT-4o-mini for intelligent extraction.
    """
    # Check file extension
    filename = file.filename.lower() if file.filename else ""
    ext = '.' + filename.split('.')[-1] if '.' in filename else ''
    
    if ext not in SUPPORTED_EXTENSIONS:
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported file format. Supported formats: {', '.join(SUPPORTED_EXTENSIONS)}"
        )
    
    try:
        # Read file content
        content = await file.read()
        
        if len(content) == 0:
            raise HTTPException(status_code=400, detail="Empty file uploaded")
        
        print(f"[ResumeParser] Processing file: {file.filename} ({len(content)} bytes)")
        
        # Step 1: Use robust parser to extract text and structure
        parsed_resume = await parse_resume_file(content, file.filename)
        
        print(f"[ResumeParser] Parsing confidence: {parsed_resume.parsing_confidence:.0%}")
        print(f"[ResumeParser] Detected {len(parsed_resume.detected_skills)} skills, {len(parsed_resume.detected_experience)} experiences")
        
        # Step 2: Build enhanced context for OpenAI
        if parsed_resume.parsing_confidence > 0.5:
            # Good parsing - use structured context
            enhanced_context = get_enhanced_prompt_context(parsed_resume)
            resume_text_for_ai = enhanced_context
        else:
            # Poor parsing - use raw text
            resume_text_for_ai = parsed_resume.raw_text
        
        # Fallback if no text extracted
        if not resume_text_for_ai.strip():
            print("[ResumeParser] Warning: No text extracted, using demo data")
            resume_text_for_ai = "Demo resume: Software Engineer with JavaScript, React, Python skills"
        
        # Step 3: Use GPT-4o-mini for comprehensive analysis
        skill_data = await extract_skills_from_resume(resume_text_for_ai)
        
        # Step 4: Merge AI results with parser results for better accuracy
        # Add any skills detected by parser but missed by AI
        ai_skill_names = [s.get("name", "").lower() for s in skill_data.get("skills", [])]
        for parser_skill in parsed_resume.detected_skills:
            if parser_skill.lower() not in ai_skill_names:
                skill_data.setdefault("skills", []).append({
                    "id": str(uuid.uuid4())[:8],
                    "name": parser_skill,
                    "level": 60,  # Default moderate level
                    "category": "Technical",
                    "connections": [],
                    "evidence": "Detected from resume text"
                })
        
        # Step 5: Create profile with unique IDs
        profile_id = str(uuid.uuid4())
        user_id = f"user-{uuid.uuid4().hex[:8]}"
        
        # Build comprehensive profile from AI analysis + parser data
        profile = {
            "id": profile_id,
            "userId": user_id,
            "skills": [s.get("name") for s in skill_data.get("skills", [])],
            "experience": skill_data.get("experience", []) or parsed_resume.detected_experience,
            "education": skill_data.get("education", []) or parsed_resume.detected_education,
            "skillGraph": skill_data.get("skills", []),
            "summary": skill_data.get("summary", ""),
            "strongestSkills": skill_data.get("strongestSkills", []),
            "skillGaps": skill_data.get("skillGaps", []),
            # Extended profile data
            "projects": skill_data.get("projects", []) or parsed_resume.detected_projects,
            "achievements": skill_data.get("achievements", []),
            "certifications": skill_data.get("certifications", []) or [{"name": c} for c in parsed_resume.detected_certifications],
            "totalYearsExperience": skill_data.get("totalYearsExperience", 0),
            "seniorityLevel": skill_data.get("seniorityLevel", "Entry"),
            # Parsing metadata
            "parsingConfidence": parsed_resume.parsing_confidence,
            "contactInfo": parsed_resume.contact_info,
        }
        
        # Store in Supabase
        await create_profile(user_id, profile)
        
        print(f"[ResumeParser] Profile created: {len(profile['skills'])} skills, {len(profile['projects'])} projects")
        
        return {
            "success": True, 
            "profile": profile, 
            "data": skill_data,
            "parsingMetadata": {
                "confidence": parsed_resume.parsing_confidence,
                "sectionsDetected": list(parsed_resume.sections.keys()),
                "skillsDetectedByParser": len(parsed_resume.detected_skills),
                "contactInfo": parsed_resume.contact_info
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error processing resume: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error processing resume: {str(e)}")


@router.post("/analyze")
async def analyze_resume_text(request: ResumeTextRequest):
    """
    Analyze resume text directly using GPT-4o-mini.
    This endpoint is for when text is pasted or sent directly.
    Uses the same robust parsing as file upload.
    """
    try:
        resume_text = request.resume_text
        
        if not resume_text.strip():
            raise HTTPException(status_code=400, detail="Resume text cannot be empty")
        
        print(f"[ResumeParser] Analyzing text: {len(resume_text)} characters")
        
        # Step 1: Parse the text using our robust parser
        # Convert text to bytes for the parser
        text_bytes = resume_text.encode('utf-8')
        parsed_resume = await parse_resume_file(text_bytes, "resume.txt")
        
        print(f"[ResumeParser] Text parsing confidence: {parsed_resume.parsing_confidence:.0%}")
        print(f"[ResumeParser] Detected {len(parsed_resume.detected_skills)} skills")
        
        # Step 2: Build enhanced context if parsing was successful
        if parsed_resume.parsing_confidence > 0.3:
            enhanced_context = get_enhanced_prompt_context(parsed_resume)
            text_for_ai = enhanced_context
        else:
            text_for_ai = resume_text
        
        # Step 3: Use GPT-4o-mini for comprehensive analysis
        skill_data = await extract_skills_from_resume(text_for_ai)
        
        # Step 4: Merge parser results with AI results
        ai_skill_names = [s.get("name", "").lower() for s in skill_data.get("skills", [])]
        for parser_skill in parsed_resume.detected_skills:
            if parser_skill.lower() not in ai_skill_names:
                skill_data.setdefault("skills", []).append({
                    "id": str(uuid.uuid4())[:8],
                    "name": parser_skill,
                    "level": 60,
                    "category": "Technical",
                    "connections": [],
                    "evidence": "Detected from resume text"
                })
        
        # Step 5: Create profile
        profile_id = str(uuid.uuid4())
        user_id = request.user_id or f"user-{uuid.uuid4().hex[:8]}"
        
        profile = {
            "id": profile_id,
            "userId": user_id,
            "skills": [s.get("name") for s in skill_data.get("skills", [])],
            "experience": skill_data.get("experience", []) or parsed_resume.detected_experience,
            "education": skill_data.get("education", []) or parsed_resume.detected_education,
            "skillGraph": skill_data.get("skills", []),
            "summary": skill_data.get("summary", ""),
            "strongestSkills": skill_data.get("strongestSkills", []),
            "skillGaps": skill_data.get("skillGaps", []),
            "projects": skill_data.get("projects", []) or parsed_resume.detected_projects,
            "achievements": skill_data.get("achievements", []),
            "certifications": skill_data.get("certifications", []) or [{"name": c} for c in parsed_resume.detected_certifications],
            "totalYearsExperience": skill_data.get("totalYearsExperience", 0),
            "seniorityLevel": skill_data.get("seniorityLevel", "Entry"),
            "parsingConfidence": parsed_resume.parsing_confidence,
            "contactInfo": parsed_resume.contact_info,
        }
        
        # Store in Supabase
        await create_profile(user_id, profile)
        
        print(f"[ResumeParser] Profile created: {len(profile['skills'])} skills")
        
        return {
            "success": True, 
            "profile": profile, 
            "data": skill_data,
            "parsingMetadata": {
                "confidence": parsed_resume.parsing_confidence,
                "sectionsDetected": list(parsed_resume.sections.keys()),
                "skillsDetectedByParser": len(parsed_resume.detected_skills),
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error analyzing resume: {e}")
        import traceback
        traceback.print_exc()
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
