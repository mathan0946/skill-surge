"""
Supabase Service - Database operations for SkillSurge
"""
from supabase import create_client, Client
from app.config import get_settings
from typing import Optional
from datetime import datetime, date, timedelta
import json

settings = get_settings()

# Initialize Supabase client
supabase: Optional[Client] = None
if settings.supabase_url and settings.supabase_service_key:
    try:
        supabase = create_client(settings.supabase_url, settings.supabase_service_key)
    except Exception as e:
        print(f"Failed to initialize Supabase client: {e}")


async def create_profile(user_id: str, profile_data: dict) -> dict:
    """
    Create or update a user profile in Supabase.
    """
    if not supabase:
        print("Supabase client not initialized, using local storage")
        return profile_data
    
    try:
        # Prepare data for insertion
        record = {
            "user_id": user_id,
            "skills": json.dumps(profile_data.get("skills", [])),
            "skill_graph": json.dumps(profile_data.get("skillGraph", [])),
            "experience": json.dumps(profile_data.get("experience", [])),
            "education": json.dumps(profile_data.get("education", [])),
            "summary": profile_data.get("summary", ""),
            "strongest_skills": json.dumps(profile_data.get("strongestSkills", [])),
            "skill_gaps": json.dumps(profile_data.get("skillGaps", [])),
        }
        
        # Upsert (insert or update)
        result = supabase.table("profiles").upsert(record, on_conflict="user_id").execute()
        
        if result.data:
            return {"success": True, "data": result.data[0]}
        return {"success": False, "error": "No data returned"}
        
    except Exception as e:
        print(f"Supabase error creating profile: {e}")
        return {"success": False, "error": str(e)}


async def get_profile(user_id: str) -> Optional[dict]:
    """
    Get a user profile from Supabase.
    """
    if not supabase:
        return None
    
    try:
        result = supabase.table("profiles").select("*").eq("user_id", user_id).execute()
        
        if result.data and len(result.data) > 0:
            profile = result.data[0]
            # Parse JSON fields
            return {
                "id": profile.get("id"),
                "userId": profile.get("user_id"),
                "skills": json.loads(profile.get("skills", "[]")),
                "skillGraph": json.loads(profile.get("skill_graph", "[]")),
                "experience": json.loads(profile.get("experience", "[]")),
                "education": json.loads(profile.get("education", "[]")),
                "summary": profile.get("summary", ""),
                "strongestSkills": json.loads(profile.get("strongest_skills", "[]")),
                "skillGaps": json.loads(profile.get("skill_gaps", "[]")),
                "createdAt": profile.get("created_at"),
            }
        return None
        
    except Exception as e:
        print(f"Supabase error getting profile: {e}")
        return None


async def save_roadmap(user_id: str, roadmap_data: dict, target_role: str) -> dict:
    """
    Save a user's roadmap to Supabase.
    """
    if not supabase:
        return roadmap_data
    
    try:
        record = {
            "user_id": user_id,
            "target_role": target_role,
            "weeks": json.dumps(roadmap_data.get("weeks", [])),
            "predicted_ready_date": roadmap_data.get("predictedReadyDate", "10 weeks"),
            "total_tasks": roadmap_data.get("totalTasks", 0),
            "estimated_hours_per_week": roadmap_data.get("estimatedHoursPerWeek", 10),
        }
        
        # Use composite key for upsert (user_id, target_role)
        result = supabase.table("roadmaps").upsert(record, on_conflict="user_id,target_role").execute()
        
        if result.data:
            return {"success": True, "data": result.data[0]}
        return {"success": False, "error": "No data returned"}
        
    except Exception as e:
        print(f"Supabase error saving roadmap: {e}")
        return {"success": False, "error": str(e)}


async def get_roadmap(user_id: str) -> Optional[dict]:
    """
    Get a user's roadmap from Supabase.
    """
    if not supabase:
        return None
    
    try:
        result = supabase.table("roadmaps").select("*").eq("user_id", user_id).execute()
        
        if result.data and len(result.data) > 0:
            roadmap = result.data[0]
            return {
                "id": roadmap.get("id"),
                "userId": roadmap.get("user_id"),
                "targetRole": roadmap.get("target_role"),
                "weeks": json.loads(roadmap.get("weeks", "[]")),
                "predictedReadyDate": roadmap.get("predicted_ready_date"),
                "totalTasks": roadmap.get("total_tasks"),
                "estimatedHoursPerWeek": roadmap.get("estimated_hours_per_week"),
                "createdAt": roadmap.get("created_at"),
            }
        return None
        
    except Exception as e:
        print(f"Supabase error getting roadmap: {e}")
        return None


async def save_interview_session(user_id: str, interview_data: dict) -> dict:
    """
    Save an interview session to Supabase.
    """
    if not supabase:
        return interview_data
    
    try:
        record = {
            "user_id": user_id,
            "conversation_id": interview_data.get("conversation_id"),
            "conversation_url": interview_data.get("conversation_url"),
            "target_role": interview_data.get("target_role"),
            "status": interview_data.get("status", "active"),
            "feedback": json.dumps(interview_data.get("feedback", {})),
        }
        
        result = supabase.table("interviews").insert(record).execute()
        
        if result.data:
            return {"success": True, "data": result.data[0]}
        return {"success": False, "error": "No data returned"}
        
    except Exception as e:
        print(f"Supabase error saving interview: {e}")
        return {"success": False, "error": str(e)}


async def get_user_progress(user_id: str) -> dict:
    """
    Get user's overall progress statistics.
    """
    if not supabase:
        return {
            "problemsSolved": 0,
            "streak": 0,
            "matchScore": 0,
            "weeksCompleted": 0,
        }
    
    try:
        # Get profile for skill score
        profile = await get_profile(user_id)
        
        # Get roadmap progress
        roadmap = await get_roadmap(user_id)
        
        # Calculate stats
        total_skills = len(profile.get("skills", [])) if profile else 0
        skill_gaps = len(profile.get("skillGaps", [])) if profile else 0
        match_score = int((total_skills / (total_skills + skill_gaps)) * 100) if total_skills > 0 else 0
        
        weeks_data = roadmap.get("weeks", []) if roadmap else []
        weeks_completed = sum(1 for w in weeks_data if w.get("completed", False))
        
        # Get real streak data
        streak_data = await calculate_streak(user_id)
        
        # Get problems solved
        progress_result = supabase.table("user_progress").select("problems_solved").eq("user_id", user_id).order("date", desc=True).limit(1).execute()
        problems_solved = progress_result.data[0]["problems_solved"] if progress_result.data else 0
        
        return {
            "problemsSolved": problems_solved,
            "streak": streak_data["streak"],
            "matchScore": match_score,
            "weeksCompleted": weeks_completed,
            "totalWeeks": len(weeks_data),
            "lastActiveDate": streak_data.get("lastActiveDate"),
        }
        
    except Exception as e:
        print(f"Supabase error getting progress: {e}")
        return {
            "problemsSolved": 0,
            "streak": 0,
            "matchScore": 0,
            "weeksCompleted": 0,
        }


async def calculate_streak(user_id: str) -> dict:
    """
    Calculate the user's current streak based on consecutive days of activity.
    """
    if not supabase:
        return {"streak": 0, "lastActiveDate": None}
    
    try:
        # Get last 60 days of progress ordered by date descending
        result = supabase.table("user_progress").select("date, problems_solved, tasks_completed").eq("user_id", user_id).order("date", desc=True).limit(60).execute()
        
        if not result.data:
            return {"streak": 0, "lastActiveDate": None}
        
        streak = 0
        today = date.today()
        
        # Parse dates and sort
        active_dates = set()
        for record in result.data:
            if record.get("problems_solved", 0) > 0 or record.get("tasks_completed", 0) > 0:
                record_date = datetime.strptime(record["date"], "%Y-%m-%d").date()
                active_dates.add(record_date)
        
        if not active_dates:
            return {"streak": 0, "lastActiveDate": None}
        
        # Calculate streak starting from today or yesterday
        check_date = today
        if check_date not in active_dates:
            check_date = today - timedelta(days=1)
            if check_date not in active_dates:
                # No recent activity, streak is 0
                most_recent = max(active_dates)
                return {"streak": 0, "lastActiveDate": most_recent.isoformat()}
        
        # Count consecutive days
        while check_date in active_dates:
            streak += 1
            check_date -= timedelta(days=1)
        
        last_active = max(active_dates)
        return {"streak": streak, "lastActiveDate": last_active.isoformat()}
        
    except Exception as e:
        print(f"Error calculating streak: {e}")
        return {"streak": 0, "lastActiveDate": None}


async def record_problem_completed(user_id: str, problem_title: str) -> dict:
    """
    Record a completed problem and update streak.
    """
    if not supabase:
        return {"success": False, "error": "Database not available"}
    
    try:
        today = date.today().isoformat()
        
        # Check if there's already a record for today
        existing = supabase.table("user_progress").select("*").eq("user_id", user_id).eq("date", today).execute()
        
        if existing.data:
            # Update existing record
            current = existing.data[0]
            new_count = current.get("problems_solved", 0) + 1
            result = supabase.table("user_progress").update({
                "problems_solved": new_count,
            }).eq("user_id", user_id).eq("date", today).execute()
        else:
            # Get previous day's streak to calculate new streak
            streak_info = await calculate_streak(user_id)
            yesterday = (date.today() - timedelta(days=1)).isoformat()
            
            # Check if active yesterday to continue streak
            prev_result = supabase.table("user_progress").select("*").eq("user_id", user_id).eq("date", yesterday).execute()
            new_streak = (streak_info["streak"] + 1) if prev_result.data else 1
            
            # Insert new record
            result = supabase.table("user_progress").insert({
                "user_id": user_id,
                "date": today,
                "problems_solved": 1,
                "tasks_completed": 0,
                "streak_days": new_streak,
            }).execute()
        
        # Get updated streak
        new_streak_info = await calculate_streak(user_id)
        
        return {
            "success": True,
            "problemTitle": problem_title,
            "streak": new_streak_info["streak"],
            "date": today,
        }
        
    except Exception as e:
        print(f"Error recording problem completion: {e}")
        return {"success": False, "error": str(e)}


async def get_completed_problems(user_id: str) -> list:
    """
    Get list of dates/counts when user solved problems (for tracking which problems were completed).
    Note: For detailed problem tracking, we'd need a separate table. This returns progress summary.
    """
    if not supabase:
        return []
    
    try:
        result = supabase.table("user_progress").select("date, problems_solved").eq("user_id", user_id).order("date", desc=True).limit(30).execute()
        return result.data if result.data else []
    except Exception as e:
        print(f"Error getting completed problems: {e}")
        return []


async def calculate_job_readiness(user_id: str, target_role: str) -> dict:
    """
    Calculate job readiness forecast based on actual progress.
    """
    if not supabase:
        return {
            "readinessScore": 0,
            "weeksUntilReady": 10,
            "estimatedDate": (date.today() + timedelta(weeks=10)).isoformat(),
            "factors": {}
        }
    
    try:
        profile = await get_profile(user_id)
        roadmap = await get_roadmap(user_id)
        progress = await get_user_progress(user_id)
        
        # Calculate skill match factor (0-25 points)
        total_skills = len(profile.get("skills", [])) if profile else 0
        skill_gaps = len(profile.get("skillGaps", [])) if profile else 3
        skill_score = min(25, int((total_skills / max(total_skills + skill_gaps, 1)) * 25))
        
        # Calculate roadmap progress factor (0-25 points)
        weeks_data = roadmap.get("weeks", []) if roadmap else []
        total_tasks = sum(len(w.get("tasks", [])) for w in weeks_data)
        completed_tasks = sum(
            len([t for t in w.get("tasks", []) if t.get("completed")])
            for w in weeks_data
        )
        roadmap_score = min(25, int((completed_tasks / max(total_tasks, 1)) * 25))
        
        # Calculate practice factor based on problems solved (0-25 points)
        problems_solved = progress.get("problemsSolved", 0)
        # Assume 50 problems is full preparation
        practice_score = min(25, int((problems_solved / 50) * 25))
        
        # Calculate consistency factor based on streak (0-25 points)
        streak = progress.get("streak", 0)
        # 14 day streak is excellent
        consistency_score = min(25, int((streak / 14) * 25))
        
        # Total readiness score
        readiness_score = skill_score + roadmap_score + practice_score + consistency_score
        
        # Estimate weeks until ready
        remaining_score = 100 - readiness_score
        # Assume ~5-10 points per week of dedicated practice
        avg_weekly_progress = 7
        weeks_until_ready = max(1, int(remaining_score / avg_weekly_progress))
        
        estimated_date = (date.today() + timedelta(weeks=weeks_until_ready)).isoformat()
        
        return {
            "readinessScore": readiness_score,
            "weeksUntilReady": weeks_until_ready,
            "estimatedDate": estimated_date,
            "daysUntilReady": weeks_until_ready * 7,
            "factors": {
                "skills": {"score": skill_score, "max": 25, "label": "Skill Match"},
                "roadmap": {"score": roadmap_score, "max": 25, "label": "Roadmap Progress"},
                "practice": {"score": practice_score, "max": 25, "label": "Problem Practice"},
                "consistency": {"score": consistency_score, "max": 25, "label": "Consistency"},
            },
            "breakdown": {
                "skillsMatched": total_skills,
                "skillGaps": skill_gaps,
                "tasksCompleted": completed_tasks,
                "totalTasks": total_tasks,
                "problemsSolved": problems_solved,
                "currentStreak": streak,
            }
        }
        
    except Exception as e:
        print(f"Error calculating job readiness: {e}")
        return {
            "readinessScore": 0,
            "weeksUntilReady": 10,
            "estimatedDate": (date.today() + timedelta(weeks=10)).isoformat(),
            "factors": {}
        }
