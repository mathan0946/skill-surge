"""
Question Bank Agent - Agent #12
Assigns daily problems based on interview frequency and skill level.
"""
from app.services.openai_service import get_daily_problem


class QuestionBankAgent:
    """
    Agent responsible for:
    - Assigning daily coding problems
    - Tracking problem frequency at target companies
    - Implementing spaced repetition
    - Adaptive difficulty adjustment
    """
    
    def __init__(self):
        self.name = "Question Bank Agent"
        self.agent_id = 12
        
    async def get_daily_assignment(self, profile: dict, target_role: str) -> dict:
        """
        Get today's recommended problem.
        
        Args:
            profile: User profile with skill levels
            target_role: Target job role
            
        Returns:
            Problem assignment with reasoning
        """
        problem = await get_daily_problem(profile, target_role)
        
        return {
            "agent": self.name,
            "agentId": self.agent_id,
            "status": "success",
            "data": problem,
        }
    
    def get_spaced_repetition_problems(self, solved_problems: list, days_since_solve: dict) -> list:
        """
        Get problems due for review based on spaced repetition.
        """
        review_intervals = [1, 3, 7, 14, 30]  # Days
        due_for_review = []
        
        for problem_id, days in days_since_solve.items():
            for interval in review_intervals:
                if days == interval:
                    due_for_review.append(problem_id)
                    break
        
        return due_for_review
    
    def calculate_next_difficulty(self, recent_performance: list) -> str:
        """
        Adjust difficulty based on recent performance.
        """
        if not recent_performance:
            return "Easy"
        
        avg_score = sum(recent_performance) / len(recent_performance)
        
        if avg_score >= 80:
            return "Hard"
        elif avg_score >= 60:
            return "Medium"
        else:
            return "Easy"


question_bank_agent = QuestionBankAgent()
