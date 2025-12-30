from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

from app.services.openai_service import match_roles
from app.api.profile import profiles_db

router = APIRouter()

# In-memory storage
selected_roles_db = {}


class RoleSelection(BaseModel):
    roleId: str


class SkillsRequest(BaseModel):
    skills: List[str]


@router.get("/{user_id}")
async def get_roles(user_id: str):
    """
    Get role recommendations for a user.
    """
    profile = profiles_db.get(user_id, {})
    
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


@router.post("/{user_id}/select")
async def select_role(user_id: str, selection: RoleSelection):
    """
    Select a target role.
    """
    selected_roles_db[user_id] = selection.roleId
    
    # Update profile with target role
    if user_id in profiles_db:
        profiles_db[user_id]["targetRole"] = selection.roleId
    
    return {
        "success": True,
        "userId": user_id,
        "selectedRole": selection.roleId,
    }
