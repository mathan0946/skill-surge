from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List
from app.services.openai_service import get_daily_problem
from app.services.supabase_service import (
    get_profile as get_supabase_profile,
    get_roadmap as get_supabase_roadmap,
    get_user_progress,
    calculate_streak,
    record_problem_completed,
    calculate_job_readiness,
)
from app.api.profile import profiles_db
from app.api.roadmap import roadmaps_db

router = APIRouter()

# Track completed problems per user (in-memory backup)
completed_problems_db = {}


class ProblemCompleteRequest(BaseModel):
    problem_id: str
    problem_title: str


@router.get("/{user_id}")
async def get_dashboard(user_id: str):
    """
    Get dashboard data for a user with real streak and progress data.
    """
    # Try to get from Supabase first, fall back to in-memory
    profile = await get_supabase_profile(user_id) or profiles_db.get(user_id, {})
    roadmap = await get_supabase_roadmap(user_id) or roadmaps_db.get(user_id, {})
    
    # Get real progress data
    progress = await get_user_progress(user_id)
    streak_data = await calculate_streak(user_id)
    job_readiness = await calculate_job_readiness(user_id, roadmap.get("targetRole", "Software Engineer"))
    
    # Calculate task stats from roadmap
    all_tasks = []
    for week in roadmap.get("weeks", []):
        all_tasks.extend(week.get("tasks", []))
    
    completed_tasks = len([t for t in all_tasks if t.get("completed")])
    total_tasks = len(all_tasks) or 1
    
    # Get streak (use real data, fallback to 0)
    streak = streak_data.get("streak", 0)
    problems_solved = progress.get("problemsSolved", 0)
    
    return {
        "userId": user_id,
        "stats": {
            "streak": streak,
            "problemsSolved": problems_solved,
            "skillMatch": job_readiness.get("readinessScore", 0),
            "daysUntilReady": job_readiness.get("daysUntilReady", 70),
            "weeksUntilReady": job_readiness.get("weeksUntilReady", 10),
            "completedTasks": completed_tasks,
            "totalTasks": total_tasks,
            "progressPercentage": round((completed_tasks / total_tasks) * 100),
        },
        "jobReadiness": job_readiness,
        "profile": profile,
        "targetRole": roadmap.get("targetRole", profile.get("targetRole", "Senior Frontend Engineer")),
        "upcomingTasks": all_tasks[:3] if all_tasks else [],
        "recentAchievements": _generate_achievements(streak, problems_solved),
        "progressData": _generate_progress_data(completed_tasks, total_tasks, problems_solved),
    }


def _generate_achievements(streak: int, problems_solved: int) -> list:
    """Generate achievement badges based on actual progress."""
    achievements = []
    
    if streak >= 7:
        achievements.append({"title": f"{streak} Day Streak! 🔥", "description": "Keep it going!", "icon": "flame"})
    elif streak >= 3:
        achievements.append({"title": f"{streak} Day Streak", "description": "Building momentum", "icon": "flame"})
    elif streak > 0:
        achievements.append({"title": "Getting Started", "description": f"{streak} day streak", "icon": "flame"})
    
    if problems_solved >= 50:
        achievements.append({"title": "Problem Master", "description": f"{problems_solved} problems solved!", "icon": "trophy"})
    elif problems_solved >= 20:
        achievements.append({"title": "Rising Star", "description": f"{problems_solved} problems solved", "icon": "star"})
    elif problems_solved >= 5:
        achievements.append({"title": "Problem Solver", "description": f"{problems_solved} problems done", "icon": "code"})
    elif problems_solved > 0:
        achievements.append({"title": "First Steps", "description": f"{problems_solved} problem(s) solved", "icon": "code"})
    
    # Add placeholder if no achievements
    if not achievements:
        achievements.append({"title": "Start Your Journey", "description": "Solve your first problem!", "icon": "rocket"})
    
    return achievements[:3]


def _generate_progress_data(completed_tasks: int, total_tasks: int, problems_solved: int) -> list:
    """Generate progress chart data based on actual progress."""
    # Simple progress projection
    progress_pct = (completed_tasks / max(total_tasks, 1)) * 100
    
    return [
        {"week": "W1", "skills": min(100, int(progress_pct * 0.2)), "problems": min(problems_solved, 5)},
        {"week": "W2", "skills": min(100, int(progress_pct * 0.35)), "problems": min(problems_solved, 12)},
        {"week": "W3", "skills": min(100, int(progress_pct * 0.5)), "problems": min(problems_solved, 20)},
        {"week": "W4", "skills": min(100, int(progress_pct * 0.7)), "problems": min(problems_solved, 30)},
        {"week": "W5", "skills": min(100, int(progress_pct * 0.85)), "problems": min(problems_solved, 40)},
        {"week": "W6", "skills": min(100, int(progress_pct)), "problems": problems_solved},
    ]


@router.get("/{user_id}/daily")
async def get_daily_task(user_id: str):
    """
    Get today's recommended LeetCode problem with full details.
    """
    # Try Supabase first, then in-memory
    profile = await get_supabase_profile(user_id) or profiles_db.get(user_id, {})
    roadmap = await get_supabase_roadmap(user_id) or roadmaps_db.get(user_id, {})
    target_role = roadmap.get("targetRole", profile.get("targetRole", "Senior Frontend Engineer"))
    completed_problems = completed_problems_db.get(user_id, [])
    
    # Get real streak
    streak_data = await calculate_streak(user_id)
    
    # Get AI-recommended daily problem with reasoning
    daily = await get_daily_problem(profile, target_role, completed_problems)
    
    return {
        "userId": user_id,
        "dailyTask": daily,
        "completedToday": False,
        "streak": streak_data.get("streak", 0),
    }


@router.post("/{user_id}/complete-problem")
async def complete_problem(user_id: str, request: ProblemCompleteRequest):
    """
    Mark a problem as completed and update streak.
    """
    # Record in Supabase
    result = await record_problem_completed(user_id, request.problem_title)
    
    # Also keep in-memory for session
    if user_id not in completed_problems_db:
        completed_problems_db[user_id] = []
    
    if request.problem_title not in completed_problems_db[user_id]:
        completed_problems_db[user_id].append(request.problem_title)
    
    return {
        "success": result.get("success", True),
        "completedProblems": completed_problems_db[user_id],
        "totalCompleted": len(completed_problems_db[user_id]),
        "streak": result.get("streak", 1),
        "message": f"Great job completing '{request.problem_title}'! 🎉",
    }


@router.get("/{user_id}/job-readiness")
async def get_job_readiness(user_id: str):
    """
    Get detailed job readiness forecast.
    """
    roadmap = await get_supabase_roadmap(user_id) or roadmaps_db.get(user_id, {})
    target_role = roadmap.get("targetRole", "Software Engineer")
    
    readiness = await calculate_job_readiness(user_id, target_role)
    
    return {
        "userId": user_id,
        "targetRole": target_role,
        **readiness,
    }


@router.get("/{user_id}/progress")
async def get_progress(user_id: str):
    """
    Get detailed progress stats with real data.
    """
    roadmap = await get_supabase_roadmap(user_id) or roadmaps_db.get(user_id, {})
    progress = await get_user_progress(user_id)
    job_readiness = await calculate_job_readiness(user_id, roadmap.get("targetRole", "Software Engineer"))
    
    # Calculate weekly progress
    weekly_progress = []
    for week in roadmap.get("weeks", []):
        tasks = week.get("tasks", [])
        completed = len([t for t in tasks if t.get("completed")])
        weekly_progress.append({
            "week": week.get("number"),
            "title": week.get("title"),
            "completed": completed,
            "total": len(tasks),
            "percentage": round((completed / max(len(tasks), 1)) * 100),
        })
    
    return {
        "userId": user_id,
        "weeklyProgress": weekly_progress,
        "streak": progress.get("streak", 0),
        "problemsSolved": progress.get("problemsSolved", 0),
        "skillTrajectory": [
            {"week": 1, "match": job_readiness.get("readinessScore", 0) * 0.3},
            {"week": 2, "match": job_readiness.get("readinessScore", 0) * 0.45},
            {"week": 3, "match": job_readiness.get("readinessScore", 0) * 0.6},
            {"week": 4, "match": job_readiness.get("readinessScore", 0) * 0.75},
            {"week": 5, "match": job_readiness.get("readinessScore", 0) * 0.9},
            {"week": 6, "match": job_readiness.get("readinessScore", 0)},
        ],
        "predictedReadyDate": job_readiness.get("estimatedDate"),
        "weeksUntilReady": job_readiness.get("weeksUntilReady", 10),
        "readinessFactors": job_readiness.get("factors", {}),
    }
