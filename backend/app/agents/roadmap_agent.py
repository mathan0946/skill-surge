"""
Roadmap Agent - Agent #3
Generates personalized learning roadmaps.
"""
from app.services.openai_service import generate_roadmap


class RoadmapAgent:
    """
    Agent responsible for:
    - Generating personalized learning plans
    - Creating week-by-week schedules
    - Adapting roadmap based on progress
    - Predicting job-ready timeline
    """
    
    def __init__(self):
        self.name = "Roadmap Agent"
        self.agent_id = 3
        
    async def create_roadmap(self, profile: dict, target_role: str) -> dict:
        """
        Generate a personalized roadmap for the target role.
        
        Args:
            profile: User profile with current skills
            target_role: Target job role
            
        Returns:
            Week-by-week learning plan
        """
        roadmap = await generate_roadmap(profile, target_role)
        
        return {
            "agent": self.name,
            "agentId": self.agent_id,
            "status": "success",
            "data": roadmap,
        }
    
    async def update_roadmap(self, current_roadmap: dict, progress: dict) -> dict:
        """
        Update roadmap based on user progress.
        """
        # Adjust timeline based on actual progress
        # Speed up if user is ahead, slow down if behind
        return current_roadmap
    
    def estimate_completion_time(self, skill_gaps: list, hours_per_week: int) -> str:
        """
        Estimate time to job-ready based on gaps and available time.
        """
        # Rough estimate: 5 hours per skill gap
        total_hours = len(skill_gaps) * 5
        weeks = total_hours // hours_per_week
        return f"{weeks} weeks"


roadmap_agent = RoadmapAgent()
