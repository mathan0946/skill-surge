"""
Mock Interview Agent - Agent #13
Conducts AI video interviews using Tavus CVI.
"""
from app.services.tavus_service import (
    create_interview_persona,
    create_conversation,
    get_conversation,
    end_conversation,
)


class MockInterviewAgent:
    """
    Agent responsible for:
    - Creating interview personas
    - Conducting video mock interviews
    - Generating feedback and scores
    - Tracking interview performance over time
    """
    
    def __init__(self):
        self.name = "Mock Interview Agent"
        self.agent_id = 13
        
    async def start_interview(self, user_id: str, interview_type: str, target_role: str) -> dict:
        """
        Start a mock interview session.
        
        Args:
            user_id: User identifier
            interview_type: behavioral, technical, or system-design
            target_role: Target job role
            
        Returns:
            Interview session details with video URL
        """
        # Create persona for this interview type
        persona = await create_interview_persona(interview_type, target_role)
        
        # Create conversation
        conversation = await create_conversation(
            persona_id=persona.get("persona_id"),
            user_name=f"Candidate {user_id}",
        )
        
        return {
            "agent": self.name,
            "agentId": self.agent_id,
            "status": "success",
            "data": {
                "interviewId": conversation.get("conversation_id"),
                "conversationUrl": conversation.get("conversation_url"),
                "type": interview_type,
                "targetRole": target_role,
            },
        }
    
    async def end_interview(self, interview_id: str) -> dict:
        """
        End an interview session and trigger feedback generation.
        """
        result = await end_conversation(interview_id)
        
        return {
            "agent": self.name,
            "agentId": self.agent_id,
            "status": "success",
            "data": result,
        }
    
    def generate_feedback(self, interview_data: dict) -> dict:
        """
        Generate AI feedback based on interview performance.
        """
        # In production, this would analyze the interview transcript/video
        return {
            "overallScore": 78,
            "categories": [
                {"name": "Communication", "score": 85, "feedback": "Clear responses"},
                {"name": "Technical Depth", "score": 72, "feedback": "Good fundamentals"},
                {"name": "Problem Solving", "score": 78, "feedback": "Logical approach"},
                {"name": "Confidence", "score": 80, "feedback": "Good presence"},
            ],
            "strengths": ["Clear communication", "Good examples"],
            "improvements": ["Discuss edge cases", "Time complexity analysis"],
        }


mock_interview_agent = MockInterviewAgent()
