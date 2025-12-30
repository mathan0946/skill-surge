"""
Profile Agent - Agent #1
Parses resume and creates a Career Knowledge Graph using GPT-4o-mini.
"""
from app.services.openai_service import extract_skills_from_resume


class ProfileAgent:
    """
    Agent responsible for:
    - Parsing resume PDF/text
    - Extracting skills with proficiency levels
    - Building skill graph with connections
    - Identifying skill gaps
    """
    
    def __init__(self):
        self.name = "Profile Agent"
        self.agent_id = 1
        
    async def process_resume(self, resume_text: str) -> dict:
        """
        Process resume text and extract skill graph.
        
        Args:
            resume_text: Raw text extracted from resume PDF
            
        Returns:
            Dictionary containing:
            - skills: List of skills with levels
            - skillGraph: Connected skill nodes
            - experience: Work experience
            - education: Education history
            - gaps: Identified skill gaps
        """
        result = await extract_skills_from_resume(resume_text)
        
        return {
            "agent": self.name,
            "agentId": self.agent_id,
            "status": "success",
            "data": result,
        }
    
    async def analyze_skill_gaps(self, current_skills: list, target_role: str) -> list:
        """
        Analyze gaps between current skills and target role requirements.
        """
        # This would use GPT-4o-mini to compare skills vs role requirements
        # For now, return common gaps
        common_gaps = {
            "Senior Frontend Engineer": ["System Design", "Testing", "Performance Optimization"],
            "Full Stack Developer": ["DevOps", "Cloud Services", "Microservices"],
            "Software Engineer": ["System Design", "Distributed Systems", "Algorithms"],
        }
        return common_gaps.get(target_role, ["System Design", "Testing"])


profile_agent = ProfileAgent()
