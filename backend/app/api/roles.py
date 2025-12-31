from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

from app.services.openai_service import match_roles, match_roles_with_skill_levels

router = APIRouter()

# In-memory storage
selected_roles_db = {}


class RoleSelection(BaseModel):
    roleId: str


class SkillsRequest(BaseModel):
    skills: List[str]


class SkillWithLevel(BaseModel):
    name: str
    category: str
    proficiency: int


class SkillsWithLevelsRequest(BaseModel):
    skills: List[SkillWithLevel]


@router.get("/{user_id}")
async def get_roles(user_id: str):
    """
    Get role recommendations for a user.
    """
    from app.services.supabase_service import get_profile
    
    profile = await get_profile(user_id) or {}
    
    # Get AI-matched roles
    roles = await match_roles(profile)
    
    return {
        "userId": user_id,
        "roles": roles,
        "selectedRole": selected_roles_db.get(user_id),
    }


@router.post("/recommendations")
async def get_recommendations(request: SkillsRequest):
    """
    Get role recommendations based on skills list.
    """
    # Build a profile from skills
    profile = {
        "skills": [{"name": skill, "level": 70} for skill in request.skills],
    }
    
    # Get AI-matched roles
    roles = await match_roles(profile)
    
    # Transform to frontend format
    formatted_roles = []
    for role in roles:
        formatted_roles.append({
            "id": role.get("id", "1"),
            "title": role.get("title", "Software Engineer"),
            "matchPercentage": role.get("matchScore", 70),
            "requiredSkills": [s.get("name") for s in role.get("skills", []) if s.get("match")],
            "missingSkills": role.get("gaps", []),
            "salary": role.get("salary", "$100K - $150K"),
        })
    
    return {
        "roles": formatted_roles,
    }


@router.post("/recommendations-with-levels")
async def get_recommendations_with_levels(request: SkillsWithLevelsRequest):
    """
    Get role recommendations based on skills WITH proficiency levels.
    This provides more accurate role matching based on skill depth.
    """
    # Convert to dict format
    skills_list = [
        {
            "name": s.name,
            "category": s.category,
            "proficiency": s.proficiency
        }
        for s in request.skills
    ]
    
    # Get AI-matched roles with skill level consideration
    roles = await match_roles_with_skill_levels(skills_list)
    
    # Transform to frontend format
    formatted_roles = []
    for role in roles:
        formatted_roles.append({
            "id": role.get("id", "1"),
            "title": role.get("title", "Software Engineer"),
            "matchPercentage": role.get("matchScore", 70),
            "requiredSkills": [s.get("name") for s in role.get("skills", []) if s.get("match")],
            "missingSkills": role.get("gaps", []),
            "salary": role.get("salary", "$100K - $150K"),
            "timeToReady": role.get("timeToReady", "8-12 weeks"),
            "whyGoodFit": role.get("whyGoodFit", ""),
            "focusAreas": role.get("focusAreas", []),
        })
    
    return {
        "roles": formatted_roles,
    }


@router.post("/{user_id}/select")
async def select_role(user_id: str, selection: RoleSelection):
    """
    Select a target role.
    """
    selected_roles_db[user_id] = selection.roleId
    
    return {
        "success": True,
        "userId": user_id,
        "selectedRole": selection.roleId,
    }
