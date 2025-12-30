from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from app.services.openai_service import generate_roadmap, generate_bonus_topics
from app.services.supabase_service import save_roadmap, get_roadmap as get_roadmap_from_db
from app.api.profile import profiles_db

router = APIRouter()

# In-memory storage for demo
roadmaps_db = {}
# Track task completion times for adaptive learning
task_completion_times = {}


class RoadmapRequest(BaseModel):
    userId: str
    targetRole: str


class TaskUpdate(BaseModel):
    completed: bool
    weekId: Optional[str] = None


@router.post("/generate")
async def create_roadmap(request: RoadmapRequest):
    """
    Generate a personalized roadmap using GPT-4o-mini.
    """
    # Get user profile
    profile = profiles_db.get(request.userId, {
        "skills": [
            {"name": "JavaScript", "level": 85},
            {"name": "React", "level": 80},
        ],
        "experience": ["Software Engineer"],
        "skillGraph": [
            {"id": "1", "name": "JavaScript", "level": 85, "category": "Frontend"},
            {"id": "2", "name": "React", "level": 80, "category": "Frontend"},
        ],
    })
    
    # Generate roadmap using AI
    roadmap = await generate_roadmap(profile, request.targetRole)
    
    # Store roadmap
    roadmap["userId"] = request.userId
    roadmap["targetRole"] = request.targetRole
    roadmaps_db[request.userId] = roadmap
    
    # Save to Supabase
    try:
        await save_roadmap(request.userId, roadmap, request.targetRole)
    except Exception as e:
        print(f"Supabase save error: {e}")
    
    return {
        "success": True,
        "roadmap": roadmap,
    }


@router.get("/{user_id}")
async def get_roadmap(user_id: str):
    """
    Get a user's roadmap from memory, Supabase, or return demo.
    """
    # Check in-memory first
    if user_id in roadmaps_db:
        return roadmaps_db[user_id]
    
    # Try Supabase
    try:
        db_roadmap = await get_roadmap_from_db(user_id)
        if db_roadmap:
            roadmaps_db[user_id] = db_roadmap
            return db_roadmap
    except Exception as e:
        print(f"Supabase fetch error: {e}")
    
    # Return demo roadmap
    return {
        "userId": user_id,
        "weeks": [
            {
                "id": "w1",
                "number": 1,
                "title": "Foundation & Data Structures",
                "description": "Build strong fundamentals with arrays, strings, and hash maps",
                "focus": "Data Structures",
                "tasks": [
                    {"id": "t1", "title": "Two Sum", "type": "problem", "duration": "30 min", "completed": False},
                    {"id": "t2", "title": "Valid Anagram", "type": "problem", "duration": "25 min", "completed": False},
                    {"id": "t3", "title": "Arrays & Hashing Course", "type": "course", "duration": "2 hrs", "completed": False},
                ],
            },
            {
                "id": "w2",
                "number": 2,
                "title": "Two Pointers & Sliding Window",
                "description": "Master efficient array traversal techniques",
                "focus": "Algorithms",
                "tasks": [
                    {"id": "t4", "title": "Valid Palindrome", "type": "problem", "duration": "25 min", "completed": False},
                    {"id": "t5", "title": "Container With Most Water", "type": "problem", "duration": "35 min", "completed": False},
                ],
            },
            {
                "id": "w3",
                "number": 3,
                "title": "Trees & Graphs",
                "description": "Understand tree traversals and graph algorithms",
                "focus": "Data Structures",
                "tasks": [
                    {"id": "t6", "title": "Invert Binary Tree", "type": "problem", "duration": "20 min", "completed": False},
                    {"id": "t7", "title": "Binary Search Tree Course", "type": "course", "duration": "2 hrs", "completed": False},
                ],
            },
            {
                "id": "w4",
                "number": 4,
                "title": "System Design Basics",
                "description": "Learn fundamentals of scalable system design",
                "focus": "System Design",
                "tasks": [
                    {"id": "t8", "title": "System Design Course", "type": "course", "duration": "3 hrs", "completed": False},
                    {"id": "t9", "title": "Design URL Shortener", "type": "problem", "duration": "1 hr", "completed": False},
                    {"id": "t10", "title": "Mock Interview #1", "type": "interview", "duration": "45 min", "completed": False},
                ],
            },
        ],
        "predictedReadyDate": "10 weeks",
        "targetRole": "Senior Frontend Engineer",
        "totalTasks": 10,
        "estimatedHoursPerWeek": 10,
    }


@router.put("/{user_id}")
async def update_roadmap(user_id: str, roadmap_data: dict):
    """
    Update a user's roadmap.
    """
    if user_id not in roadmaps_db:
        roadmaps_db[user_id] = roadmap_data
    else:
        roadmaps_db[user_id].update(roadmap_data)
    
    return {"success": True, "roadmap": roadmaps_db[user_id]}


@router.put("/{user_id}/task/{task_id}")
async def update_task(user_id: str, task_id: str, update: TaskUpdate):
    """
    Update a task's completion status and trigger adaptive learning if fast.
    """
    roadmap = roadmaps_db.get(user_id)
    if not roadmap:
        # Try to fetch from Supabase
        try:
            roadmap = await get_roadmap_from_db(user_id)
            if roadmap:
                roadmaps_db[user_id] = roadmap
        except:
            pass
    
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    
    # Initialize completion tracking for user
    if user_id not in task_completion_times:
        task_completion_times[user_id] = {
            "weekStartTimes": {},
            "completedTasks": {},
        }
    
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
                    task_completion_times[user_id]["completedTasks"][task_id] = datetime.now()
                    
                    # Mark week start time if first task in week
                    week_id = week.get("id")
                    if week_id not in task_completion_times[user_id]["weekStartTimes"]:
                        task_completion_times[user_id]["weekStartTimes"][week_id] = datetime.now()
                break
        if task_found:
            break
    
    if not task_found:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Check if week is completed and calculate speed
    week_tasks = week_found.get("tasks", [])
    completed_count = sum(1 for t in week_tasks if t.get("completed"))
    total_count = len(week_tasks)
    
    bonus_topics = None
    is_fast_learner = False
    
    if completed_count == total_count:
        # Week completed! Check speed
        week_id = week_found.get("id")
        start_time = task_completion_times[user_id]["weekStartTimes"].get(week_id)
        
        if start_time:
            elapsed_hours = (datetime.now() - start_time).total_seconds() / 3600
            
            # If completed in less than 24 hours, they're fast!
            # Expected pace is ~1 week = 168 hours
            if elapsed_hours < 48:  # Completed week in less than 2 days
                is_fast_learner = True
                
                # Generate bonus topics
                week_focus = week_found.get("focus", "General")
                target_role = roadmap.get("targetRole", "Software Engineer")
                
                try:
                    bonus_topics = await generate_bonus_topics(week_focus, target_role)
                    
                    # Add bonus tasks to the week
                    if bonus_topics and "tasks" in bonus_topics:
                        existing_ids = [t.get("id") for t in week_tasks]
                        for bonus_task in bonus_topics["tasks"]:
                            # Generate unique ID
                            bonus_task["id"] = f"{week_id}_bonus_{len(existing_ids) + 1}"
                            bonus_task["isBonus"] = True
                            week_found["tasks"].append(bonus_task)
                            existing_ids.append(bonus_task["id"])
                except Exception as e:
                    print(f"Error generating bonus topics: {e}")
    
    # Save updated roadmap
    try:
        await save_roadmap(user_id, roadmap, roadmap.get("targetRole", "Software Engineer"))
    except Exception as e:
        print(f"Error saving roadmap: {e}")
    
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


@router.get("/{user_id}/progress")
async def get_roadmap_progress(user_id: str):
    """
    Get roadmap progress statistics.
    """
    roadmap = roadmaps_db.get(user_id)
    if not roadmap:
        try:
            roadmap = await get_roadmap_from_db(user_id)
        except:
            pass
    
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
