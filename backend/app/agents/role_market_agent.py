"""
Role Market Agent - Agent #2
Analyzes job market and recommends suitable roles.
"""
from app.services.openai_service import match_roles


class RoleMarketAgent:
    """
    Agent responsible for:
    - Analyzing job market trends
    - Matching user profile to roles
    - Calculating match scores
    - Identifying skill gaps per role
    """
    
    def __init__(self):
        self.name = "Role Market Agent"
        self.agent_id = 2
        
    async def find_matching_roles(self, profile: dict) -> dict:
        """
        Find roles that match the user's profile.
        
        Args:
            profile: User profile with skills and experience
            
        Returns:
            List of matching roles with match scores
        """
        roles = await match_roles(profile)
        
        return {
            "agent": self.name,
            "agentId": self.agent_id,
            "status": "success",
            "data": {
                "roles": roles,
                "totalMatches": len(roles),
                "topMatch": roles[0] if roles else None,
            },
        }
    
    def calculate_match_score(self, user_skills: list, role_requirements: list) -> int:
        """
        Calculate how well user skills match role requirements.
        """
        if not role_requirements:
            return 0
        
        matched = sum(1 for req in role_requirements if req in user_skills)
        return round((matched / len(role_requirements)) * 100)


role_market_agent = RoleMarketAgent()
