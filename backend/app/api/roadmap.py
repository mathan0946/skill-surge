from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from app.services.openai_service import generate_roadmap, generate_bonus_topics
from app.services.supabase_service import (
    save_roadmap, 
    get_roadmap as get_roadmap_from_db,
    update_roadmap_task,
    get_profile,
    record_task_completed,
)

router = APIRouter()


class RoadmapRequest(BaseModel):
    userId: str
    targetRole: str


class TaskUpdate(BaseModel):
    completed: bool
    weekId: Optional[str] = None


@router.post("/generate")
async def create_roadmap(request: RoadmapRequest):
    """
    Generate a personalized roadmap using GPT-4o-mini and save to Supabase.
    """
    try:
        # Get user profile from Supabase
        profile = await get_profile(request.userId)
        
        if not profile:
            # Use minimal profile if not found
            profile = {
                "skills": [],
                "experience": [],
                "skillGraph": [],
                "skillGaps": [],
            }
        
        # Generate roadmap using AI - this will ONLY use OpenAI, no mocks
        roadmap = await generate_roadmap(profile, request.targetRole)
        
        # Add user metadata
        roadmap["userId"] = request.userId
        roadmap["targetRole"] = request.targetRole
        roadmap["taskCompletionTimes"] = {
            "weekStartTimes": {},
            "completedTasks": {},
        }
        
        # Save to Supabase (required - will raise exception if fails)
        await save_roadmap(request.userId, roadmap, request.targetRole)
        
        return {
            "success": True,
            "roadmap": roadmap,
        }
        
    except Exception as e:
        print(f"Error generating roadmap: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate roadmap: {str(e)}")


@router.get("/{user_id}")
async def get_roadmap(user_id: str):
    """
    Get a user's roadmap from Supabase.
    """
    try:
        roadmap = await get_roadmap_from_db(user_id)
        
        if not roadmap:
            raise HTTPException(
                status_code=404, 
                detail="No roadmap found. Please generate a roadmap first."
            )
        
        return roadmap
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching roadmap: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch roadmap: {str(e)}")


@router.put("/{user_id}")
async def update_roadmap(user_id: str, roadmap_data: dict):
    """
    Update a user's roadmap in Supabase.
    """
    try:
        target_role = roadmap_data.get("targetRole", "Software Engineer")
        await save_roadmap(user_id, roadmap_data, target_role)
        return {"success": True, "roadmap": roadmap_data}
        
    except Exception as e:
        print(f"Error updating roadmap: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to update roadmap: {str(e)}")


@router.put("/{user_id}/task/{task_id}")
async def update_task(user_id: str, task_id: str, update: TaskUpdate):
    """
    Update a task's completion status and trigger adaptive learning if fast.
    All data is stored in Supabase.
    """
    try:
        # Fetch roadmap from Supabase
        roadmap = await get_roadmap_from_db(user_id)
        
        if not roadmap:
            raise HTTPException(status_code=404, detail="Roadmap not found")
        
        # Get or initialize task completion times from the roadmap
        task_completion_times = roadmap.get("taskCompletionTimes", {
            "weekStartTimes": {},
            "completedTasks": {},
        })
        
        # Ensure the nested dicts exist
        if "weekStartTimes" not in task_completion_times:
            task_completion_times["weekStartTimes"] = {}
        if "completedTasks" not in task_completion_times:
            task_completion_times["completedTasks"] = {}
        
        # Find and update the task
        task_found = None
        week_found = None
        
        for week in roadmap.get("weeks", []):
            for task in week.get("tasks", []):
                if task.get("id") == task_id:
                    task["completed"] = update.completed
                    task["completedAt"] = datetime.now().isoformat() if update.completed else None
                    task_found = task
                    week_found = week
                    
                    # Track completion
                    if update.completed:
                        task_completion_times["completedTasks"][task_id] = datetime.now().isoformat()
                        
                        # Mark week start time if first task in week
                        week_id = week.get("id")
                        if week_id not in task_completion_times["weekStartTimes"]:
                            task_completion_times["weekStartTimes"][week_id] = datetime.now().isoformat()
                        
                        # Record task completion for daily progress
                        await record_task_completed(user_id)
                    else:
                        # Remove from completed if uncompleting
                        task_completion_times["completedTasks"].pop(task_id, None)
                    break
            if task_found:
                break
        
        if not task_found:
            raise HTTPException(status_code=404, detail="Task not found")
        
        # Update roadmap with new completion times
        roadmap["taskCompletionTimes"] = task_completion_times
        
        # Check if week is completed and calculate speed
        week_tasks = week_found.get("tasks", [])
        completed_count = sum(1 for t in week_tasks if t.get("completed"))
        total_count = len(week_tasks)
        
        bonus_topics = None
        is_fast_learner = False
        
        if completed_count == total_count and update.completed:
            # Week completed! Check speed
            week_id = week_found.get("id")
            start_time_str = task_completion_times["weekStartTimes"].get(week_id)
            
            if start_time_str:
                start_time = datetime.fromisoformat(start_time_str)
                elapsed_hours = (datetime.now() - start_time).total_seconds() / 3600
                
                # If completed in less than 48 hours, they're fast!
                if elapsed_hours < 48:
                    is_fast_learner = True
                    
                    # Generate bonus topics using OpenAI
                    week_focus = week_found.get("focus", "General")
                    target_role = roadmap.get("targetRole", "Software Engineer")
                    
                    try:
                        bonus_topics = await generate_bonus_topics(week_focus, target_role)
                        
                        # Add bonus tasks to the week
                        if bonus_topics and "tasks" in bonus_topics:
                            existing_ids = [t.get("id") for t in week_tasks]
                            for i, bonus_task in enumerate(bonus_topics["tasks"]):
                                # Generate unique ID
                                bonus_task["id"] = f"{week_id}_bonus_{len(existing_ids) + i + 1}"
                                bonus_task["isBonus"] = True
                                bonus_task["completed"] = False
                                week_found["tasks"].append(bonus_task)
                    except Exception as e:
                        print(f"Error generating bonus topics: {e}")
        
        # Save updated roadmap to Supabase
        await update_roadmap_task(user_id, roadmap)
        
        # Calculate overall progress
        all_tasks = []
        for week in roadmap.get("weeks", []):
            all_tasks.extend(week.get("tasks", []))
        
        total_tasks = len(all_tasks)
        completed_tasks = sum(1 for t in all_tasks if t.get("completed"))
        progress_percentage = round((completed_tasks / max(total_tasks, 1)) * 100)
        
        return {
            "success": True,
            "task": task_found,
            "weekProgress": {
                "completed": completed_count,
                "total": total_count,
                "percentage": round((completed_count / max(total_count, 1)) * 100),
            },
            "overallProgress": {
                "completed": completed_tasks,
                "total": total_tasks,
                "percentage": progress_percentage,
            },
            "isFastLearner": is_fast_learner,
            "bonusTopicsAdded": bonus_topics is not None,
            "bonusTopics": bonus_topics,
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating task: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to update task: {str(e)}")


@router.get("/{user_id}/progress")
async def get_roadmap_progress(user_id: str):
    """
    Get roadmap progress statistics from Supabase.
    """
    try:
        roadmap = await get_roadmap_from_db(user_id)
        
        if not roadmap:
            return {
                "completed": 0,
                "total": 0,
                "percentage": 0,
                "weeks": [],
            }
        
        weeks_progress = []
        total_tasks = 0
        completed_tasks = 0
        
        for week in roadmap.get("weeks", []):
            week_tasks = week.get("tasks", [])
            week_completed = sum(1 for t in week_tasks if t.get("completed"))
            week_total = len(week_tasks)
            
            total_tasks += week_total
            completed_tasks += week_completed
            
            weeks_progress.append({
                "weekId": week.get("id"),
                "weekNumber": week.get("number"),
                "title": week.get("title"),
                "completed": week_completed,
                "total": week_total,
                "percentage": round((week_completed / max(week_total, 1)) * 100),
            })
        
        return {
            "completed": completed_tasks,
            "total": total_tasks,
            "percentage": round((completed_tasks / max(total_tasks, 1)) * 100),
            "weeks": weeks_progress,
        }
        
    except Exception as e:
        print(f"Error getting roadmap progress: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get progress: {str(e)}")
