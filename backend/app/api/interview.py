from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

from app.services.tavus_service import (
    create_interview_persona,
    create_conversation,
    get_conversation,
    end_conversation,
)

router = APIRouter()

# In-memory storage for demo
interviews_db = {}


class InterviewRequest(BaseModel):
    userId: str
    type: str  # behavioral, technical, system-design
    targetRole: Optional[str] = "Senior Frontend Engineer"


class InterviewFeedback(BaseModel):
    interviewId: str
    communication: int
    technicalDepth: int
    problemSolving: int
    confidence: int
    overallScore: int
    strengths: list
    improvements: list


@router.post("/start")
async def start_interview(request: InterviewRequest):
    """
    Start a mock interview session using Tavus CVI.
    
    Flow:
    1. Create (or reuse) a persona for this interview type
    2. Create a conversation with that persona
    3. Return the conversation URL for the frontend to embed
    """
    # Create a persona for this interview type
    persona = await create_interview_persona(request.type, request.targetRole)
    
    # Create a conversation with the persona
    conversation = await create_conversation(
        persona_id=persona.get("persona_id"),
        user_name=f"User {request.userId}",
        interview_type=request.type,
    )
    
    # Determine if this is demo mode
    is_demo = persona.get("demo", False) or conversation.get("status") in ["demo", "error"]
    
    # Store interview data
    interview_id = conversation.get("conversation_id", "demo-interview")
    
    interviews_db[interview_id] = {
        "id": interview_id,
        "userId": request.userId,
        "type": request.type,
        "targetRole": request.targetRole,
        "personaId": persona.get("persona_id"),
        "conversationUrl": conversation.get("conversation_url"),
        "status": "demo" if is_demo else "active",
        "startTime": None,
        "duration": 0,
        "demo": is_demo,
        "message": conversation.get("message") if is_demo else None,
    }
    
    return {
        "success": True,
        "interview": {
            "id": interview_id,
            "conversationUrl": conversation.get("conversation_url"),
            "type": request.type,
            "status": "demo" if is_demo else "active",
            "demo": is_demo,
            "message": conversation.get("message") if is_demo else "Interview ready! Click the video to join.",
        },
    }


@router.get("/{interview_id}")
async def get_interview(interview_id: str):
    """
    Get interview details.
    """
    if interview_id in interviews_db:
        return interviews_db[interview_id]
    
    # Check with Tavus
    conversation = await get_conversation(interview_id)
    return {
        "id": interview_id,
        "status": conversation.get("status", "unknown"),
        "duration": conversation.get("duration", 0),
    }


@router.post("/{interview_id}/end")
async def end_interview_session(interview_id: str):
    """
    End an interview session.
    """
    result = await end_conversation(interview_id)
    
    if interview_id in interviews_db:
        interviews_db[interview_id]["status"] = "ended"
    
    return {"success": True, "result": result}


@router.get("/{interview_id}/feedback")
async def get_interview_feedback(interview_id: str):
    """
    Get AI-generated feedback for an interview.
    """
    # In a real implementation, this would analyze the interview recording
    # For demo, return mock feedback
    interview = interviews_db.get(interview_id, {})
    
    return {
        "interviewId": interview_id,
        "type": interview.get("type", "behavioral"),
        "overallScore": 78,
        "categories": [
            {
                "name": "Communication",
                "score": 85,
                "feedback": "Clear and structured responses. Good use of examples.",
            },
            {
                "name": "Technical Depth",
                "score": 72,
                "feedback": "Solid fundamentals, could explore edge cases more.",
            },
            {
                "name": "Problem Solving",
                "score": 78,
                "feedback": "Good approach, consider discussing trade-offs.",
            },
            {
                "name": "Confidence",
                "score": 80,
                "feedback": "Maintained composure, good eye contact.",
            },
        ],
        "strengths": [
            "Clear communication style",
            "Good use of STAR method",
            "Strong JavaScript knowledge",
        ],
        "improvements": [
            "Discuss edge cases more thoroughly",
            "Practice time complexity analysis",
            "Ask more clarifying questions",
        ],
        "recommendedPractice": [
            {"title": "System Design Basics", "type": "course"},
            {"title": "Mock Interview #2", "type": "interview"},
        ],
    }
