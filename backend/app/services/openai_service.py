import json
from openai import OpenAI
from app.config import get_settings

settings = get_settings()

client = OpenAI(api_key=settings.openai_api_key) if settings.openai_api_key else None


async def extract_skills_from_resume(resume_text: str) -> dict:
    """
    Use GPT-4o-mini to extract comprehensive profile data from resume text.
    This includes skills with proficiency levels, projects, achievements, certifications, etc.
    """
    if not client:
        # Return mock data if no API key
        return get_mock_skill_graph()
    
    # Truncate resume text to avoid token limits (max ~15000 chars for safety)
    truncated_resume = resume_text[:15000] if len(resume_text) > 15000 else resume_text
    
    prompt = f"""You are an expert resume analyzer. Analyze the following resume text and extract ALL relevant information.
Your job is to:
1. Identify ALL technical and soft skills mentioned or implied
2. Assess proficiency level (0-100) based on context clues like years of experience, project complexity, certifications
3. Extract ALL projects with descriptions and technologies used
4. Extract ALL achievements and accomplishments
5. Identify certifications and courses
6. Determine skill gaps for career growth

IMPORTANT: 
- Infer skill levels based on: years mentioned, project complexity, leadership roles, certifications
- A skill mentioned in a senior role context = higher level (70-90)
- A skill mentioned in junior context or as "learning" = lower level (30-50)
- A skill with certifications = +10-20 boost
- A skill used in multiple projects = higher level

Resume Text:
{truncated_resume}

Respond with this EXACT JSON structure:
{{
    "skills": [
        {{
            "id": "1",
            "name": "JavaScript",
            "level": 85,
            "category": "Frontend",
            "connections": ["2", "3"],
            "yearsOfExperience": 3,
            "evidence": "Used in 5 projects, mentioned in senior role"
        }}
    ],
    "projects": [
        {{
            "id": "p1",
            "name": "Project Name",
            "description": "What the project does",
            "technologies": ["React", "Node.js"],
            "role": "Lead Developer",
            "impact": "Increased performance by 40%"
        }}
    ],
    "achievements": [
        {{
            "id": "a1",
            "title": "Achievement Title",
            "description": "What was accomplished",
            "metrics": "Quantifiable impact if available"
        }}
    ],
    "certifications": [
        {{
            "id": "c1",
            "name": "AWS Solutions Architect",
            "issuer": "Amazon",
            "year": "2023"
        }}
    ],
    "experience": [
        {{
            "company": "Company Name",
            "role": "Job Title",
            "duration": "2 years",
            "startDate": "2022",
            "endDate": "2024",
            "highlights": ["Key responsibility 1", "Key achievement 2"]
        }}
    ],
    "education": [
        {{
            "degree": "BS Computer Science",
            "institution": "University Name",
            "year": "2020",
            "gpa": "3.8"
        }}
    ],
    "summary": "A comprehensive professional summary based on the resume",
    "strongestSkills": ["Top skill 1", "Top skill 2", "Top skill 3"],
    "skillGaps": ["Skills the candidate should develop"],
    "totalYearsExperience": 5,
    "seniorityLevel": "Mid-Senior"
}}
"""

    try:
        response = client.chat.completions.create(
            model=settings.openai_model,
            messages=[
                {
                    "role": "system",
                    "content": """You are an expert resume analyzer and career coach with deep knowledge of tech industry skills and roles.
Your task is to extract comprehensive profile data from resumes.
- Be thorough - extract EVERY skill, project, and achievement mentioned
- Assess skill levels intelligently based on context, not just keywords
- If experience years are mentioned, use them to inform skill levels
- If certifications exist, boost related skill levels
- Identify connections between related skills (e.g., React connects to JavaScript)
- Always respond with valid JSON matching the exact structure requested.""",
                },
                {"role": "user", "content": prompt},
            ],
            response_format={"type": "json_object"},
            temperature=0.5,  # Lower temperature for more consistent extraction
            max_tokens=4000,
        )
        
        result = json.loads(response.choices[0].message.content)
        
        # Ensure all required fields exist with defaults
        result.setdefault("skills", [])
        result.setdefault("projects", [])
        result.setdefault("achievements", [])
        result.setdefault("certifications", [])
        result.setdefault("experience", [])
        result.setdefault("education", [])
        result.setdefault("summary", "")
        result.setdefault("strongestSkills", [])
        result.setdefault("skillGaps", [])
        result.setdefault("totalYearsExperience", 0)
        result.setdefault("seniorityLevel", "Entry")
        
        # Ensure each skill has required fields
        for i, skill in enumerate(result["skills"]):
            skill.setdefault("id", str(i + 1))
            skill.setdefault("level", 50)
            skill.setdefault("category", "Other")
            skill.setdefault("connections", [])
            skill.setdefault("yearsOfExperience", 0)
        
        return result
    except Exception as e:
        print(f"OpenAI API error: {e}")
        return get_mock_skill_graph()


async def generate_roadmap(profile: dict, target_role: str) -> dict:
    """
    Use GPT-4o-mini to generate a personalized learning roadmap with Udemy course links.
    Requires OpenAI API key - no mock fallback.
    """
    if not client:
        raise Exception("OpenAI API key not configured. Please set OPENAI_API_KEY in environment variables.")
    
    skills_str = ", ".join([s.get("name", "") for s in profile.get("skillGraph", profile.get("skills", []))])
    skill_gaps = profile.get("skillGaps", [])
    
    prompt = f"""Create a detailed 10-week learning roadmap for someone targeting the role of "{target_role}".

Current Skills: {skills_str}
Skill Gaps to Address: {skill_gaps}
Current Experience: {profile.get('experience', [])}

Create a week-by-week plan with specific tasks. IMPORTANT:
1. For courses, provide REAL Udemy course URLs (use the actual Udemy course structure like https://www.udemy.com/course/course-name/)
2. For problems, provide REAL LeetCode problem URLs
3. Include specific resources with actual links

Respond in this exact JSON format:
{{
    "weeks": [
        {{
            "id": "w1",
            "number": 1,
            "title": "Week Title",
            "description": "What this week focuses on",
            "focus": "Main skill area",
            "tasks": [
                {{
                    "id": "t1",
                    "title": "Two Sum",
                    "type": "problem",
                    "duration": "30 min",
                    "reason": "Most asked array problem at FAANG companies",
                    "completed": false,
                    "link": "https://leetcode.com/problems/two-sum/",
                    "difficulty": "Easy"
                }},
                {{
                    "id": "t2",
                    "title": "JavaScript: The Complete Guide 2024",
                    "type": "course",
                    "duration": "4 hrs",
                    "reason": "Comprehensive JavaScript fundamentals course",
                    "completed": false,
                    "link": "https://www.udemy.com/course/javascript-the-complete-guide-2020-beginner-advanced/",
                    "platform": "Udemy",
                    "instructor": "Maximilian Schwarzmüller"
                }}
            ]
        }}
    ],
    "predictedReadyDate": "10 weeks",
    "targetRole": "{target_role}",
    "totalTasks": 40,
    "estimatedHoursPerWeek": 10,
    "recommendedCourses": [
        {{
            "title": "Course Name",
            "platform": "Udemy",
            "link": "https://www.udemy.com/course/...",
            "reason": "Why this course helps"
        }}
    ]
}}
"""

    try:
        response = client.chat.completions.create(
            model=settings.openai_model,
            messages=[
                {
                    "role": "system",
                    "content": """You are an expert career coach creating personalized learning roadmaps. 
                    IMPORTANT: Provide REAL, working URLs for resources:
                    - Udemy courses: Use actual popular course URLs from Udemy
                    - LeetCode problems: Use real LeetCode problem URLs (e.g., https://leetcode.com/problems/two-sum/)
                    Focus on high-impact activities that directly prepare candidates for interviews.
                    Always respond with valid JSON.""",
                },
                {"role": "user", "content": prompt},
            ],
            response_format={"type": "json_object"},
            temperature=0.7,
        )
        
        result = json.loads(response.choices[0].message.content)
        return result
    except Exception as e:
        print(f"OpenAI API error: {e}")
        raise Exception(f"Failed to generate roadmap: {str(e)}")


async def generate_comprehensive_roadmap(
    skills: list,
    target_role: str,
    missing_skills: list,
    time_constraint: dict,
    resume_text: str
) -> dict:
    """
    Generate a comprehensive learning roadmap covering ALL subjects needed for the target role.
    Considers user's existing skill levels and time constraints.
    """
    if not client:
        raise Exception("OpenAI API key not configured. Please set OPENAI_API_KEY in environment variables.")
    
    weeks = int(time_constraint.get("weeks", 12))
    hours_per_day = float(time_constraint.get("hoursPerDay", 2))
    intensity = time_constraint.get("intensity", "moderate")
    
    # Calculate integer values for the prompt
    total_hours = int(weeks * 7 * hours_per_day)
    hours_per_week = int(7 * hours_per_day)
    
    # Limit skills to top 15 to avoid token overflow
    limited_skills = skills[:500] if len(skills) > 20 else skills
    
    # Format skills with proficiency levels (concise format)
    skills_with_levels = ", ".join([
        f"{s.get('name')}:{s.get('proficiency', 50)}%"
        for s in limited_skills
    ])
    
    # Limit missing skills list
    limited_missing = missing_skills[:10] if len(missing_skills) > 10 else missing_skills
    
    # Truncate resume text significantly
    truncated_resume = resume_text[:2000] if resume_text else "No resume provided"
    
    prompt = f"""Create a learning roadmap for "{target_role}".

User Skills: {skills_with_levels}
Skills to Learn: {limited_missing}
Duration: {weeks} weeks, {hours_per_day} hrs/day, Total: {total_hours} hours

Cover: DSA, System Design (senior roles), Behavioral Prep, Coding Practice.
Each week: 3-4 tasks with real LeetCode URLs.

JSON format:
{{
    "overview": {{
        "totalWeeks": {weeks},
        "hoursPerDay": {hours_per_day},
        "totalHours": {total_hours},
        "subjects": [{{"id": "dsa", "name": "Data Structures & Algorithms", "weeks": 4, "priority": "high"}}],
        "milestones": [{{"week": 4, "goal": "Complete DSA fundamentals"}}]
    }},
    "weeks": [
        {{
            "id": "w1",
            "number": 1,
            "title": "Week 1: Arrays & Hashing",
            "description": "Master array manipulation",
            "focus": "Data Structures",
            "tasks": [
                {{
                    "id": "w1t1",
                    "title": "Two Sum",
                    "type": "problem",
                    "duration": "30 min",
                    "reason": "Classic hash map problem",
                    "completed": false,
                    "link": "https://leetcode.com/problems/two-sum/",
                    "difficulty": "Easy"
                }}
            ]
        }}
    ],
    "predictedReadyDate": "{weeks} weeks",
    "targetRole": "{target_role}",
    "totalTasks": 50,
    "estimatedHoursPerWeek": {hours_per_week}
}}

IMPORTANT: 
- Generate ALL {weeks} weeks with 3-5 tasks each
- Use REAL LeetCode URLs (https://leetcode.com/problems/problem-name/)
- Keep task descriptions concise
- Focus on high-impact items
"""

    try:
        response = client.chat.completions.create(
            model=settings.openai_model,
            messages=[
                {
                    "role": "system",
                    "content": """You are an expert career coach. Create interview prep roadmaps with:
1. REAL LeetCode URLs (https://leetcode.com/problems/problem-name/)
2. Cover DSA, System Design, Behavioral prep
3. Respect time constraints
4. Keep responses concise but complete
Always respond with valid JSON.""",
                },
                {"role": "user", "content": prompt},
            ],
            response_format={"type": "json_object"},
            temperature=0.7,
            max_tokens=16000,
        )
        
        content = response.choices[0].message.content
        
        # Check if response was truncated
        if response.choices[0].finish_reason == "length":
            print("Warning: OpenAI response was truncated due to length limit")
        
        try:
            result = json.loads(content)
        except json.JSONDecodeError as json_err:
            print(f"JSON parse error: {json_err}")
            print(f"Response content (first 500 chars): {content[:500] if content else 'Empty'}")
            print(f"Response content (last 500 chars): {content[-500:] if content else 'Empty'}")
            raise Exception(f"Failed to parse roadmap response: {str(json_err)}")
        
        # Ensure numeric values are integers (not floats)
        if "estimatedHoursPerWeek" in result:
            result["estimatedHoursPerWeek"] = int(result["estimatedHoursPerWeek"])
        if "totalTasks" in result:
            result["totalTasks"] = int(result["totalTasks"])
        if "overview" in result:
            if "totalHours" in result["overview"]:
                result["overview"]["totalHours"] = int(result["overview"]["totalHours"])
            if "totalWeeks" in result["overview"]:
                result["overview"]["totalWeeks"] = int(result["overview"]["totalWeeks"])
        
        return result
    except Exception as e:
        print(f"OpenAI API error: {e}")
        raise Exception(f"Failed to generate comprehensive roadmap: {str(e)}")


async def match_roles_with_skill_levels(skills: list) -> list:
    """
    Match roles based on skills WITH proficiency levels for better recommendations.
    """
    if not client:
        return get_mock_roles()
    
    # Format skills with levels
    skills_formatted = "\n".join([
        f"- {s.get('name')}: {s.get('proficiency', 50)}% proficiency ({s.get('category', 'General')})"
        for s in skills
    ])
    
    prompt = f"""Based on this candidate's skills WITH proficiency levels, recommend 5 suitable job roles.

Candidate Skills:
{skills_formatted}

For each role, provide:
- Match score (based on skills AND proficiency levels - be realistic)
- Required skills (indicate if candidate has them and at what level)
- Specific skill gaps to address
- Estimated time to be interview-ready
- Salary range
- Demand level

Consider:
- High proficiency (80%+) skills as strong matches
- Medium proficiency (50-79%) skills need some improvement
- Low proficiency (<50%) skills are gaps

Respond in this exact JSON format:
{{
    "roles": [
        {{
            "id": "1",
            "title": "Senior Frontend Engineer",
            "matchScore": 78,
            "salary": "$150K - $200K",
            "skills": [
                {{"name": "JavaScript", "match": true, "candidateLevel": 85, "requiredLevel": 80}},
                {{"name": "System Design", "match": false, "candidateLevel": 30, "requiredLevel": 70}}
            ],
            "gaps": ["System Design", "Testing"],
            "demand": "High",
            "timeToReady": "6-8 weeks",
            "whyGoodFit": "Strong JavaScript and React skills match role requirements",
            "focusAreas": ["Improve system design knowledge", "Learn testing best practices"]
        }}
    ]
}}
"""

    try:
        response = client.chat.completions.create(
            model=settings.openai_model,
            messages=[
                {
                    "role": "system",
                    "content": """You are an expert career advisor matching candidates to suitable roles.
                    Consider both the skills AND their proficiency levels.
                    Be realistic with match scores - high proficiency matters.
                    Always respond with valid JSON.""",
                },
                {"role": "user", "content": prompt},
            ],
            response_format={"type": "json_object"},
            temperature=0.7,
        )
        
        result = json.loads(response.choices[0].message.content)
        return result.get("roles", [])
    except Exception as e:
        print(f"OpenAI API error: {e}")
        return get_mock_roles()


async def generate_bonus_topics(week_focus: str, target_role: str) -> dict:
    """
    Generate bonus topics for fast learners who complete a week quickly.
    Includes both Udemy courses and YouTube alternatives.
    Requires OpenAI API key.
    """
    if not client:
        raise Exception("OpenAI API key not configured")
    
    prompt = f"""The user is a fast learner who completed the "{week_focus}" week quickly while preparing for "{target_role}".

Generate 2-3 BONUS advanced tasks to challenge them further on this topic.

IMPORTANT:
1. Include both Udemy courses AND YouTube video alternatives
2. Use REAL LeetCode problem URLs (format: https://leetcode.com/problems/problem-name/)
3. Use realistic Udemy course URLs
4. Include popular FREE YouTube tutorial links from channels like: freeCodeCamp, Traversy Media, NeetCode, The Coding Train, Fireship, Tech With Tim, Corey Schafer

Respond in this exact JSON format:
{{
    "message": "🎉 You're crushing it! Here are some bonus challenges:",
    "tasks": [
        {{
            "title": "Advanced Problem Name",
            "type": "problem",
            "duration": "45 min",
            "reason": "Why this is a good challenge",
            "link": "https://leetcode.com/problems/...",
            "difficulty": "Medium",
            "provider": "LeetCode"
        }},
        {{
            "title": "Advanced Course Name",
            "type": "course",
            "duration": "2 hrs",
            "reason": "Why this deepens understanding",
            "link": "https://www.udemy.com/course/...",
            "provider": "Udemy",
            "youtubeAlternative": {{
                "title": "Free YouTube Alternative Title",
                "link": "https://www.youtube.com/watch?v=...",
                "channel": "Channel Name",
                "duration": "1.5 hrs"
            }}
        }}
    ]
}}
"""

    try:
        response = client.chat.completions.create(
            model=settings.openai_model,
            messages=[
                {
                    "role": "system",
                    "content": """You are an expert programming tutor. Generate bonus challenging content for fast learners.
                    Always include:
                    - Real LeetCode problem URLs
                    - Real Udemy course URLs  
                    - YouTube free alternatives from popular coding channels
                    Always respond with valid JSON.""",
                },
                {"role": "user", "content": prompt},
            ],
            response_format={"type": "json_object"},
            temperature=0.7,
        )
        
        result = json.loads(response.choices[0].message.content)
        return result
    except Exception as e:
        print(f"OpenAI API error generating bonus topics: {e}")
        raise Exception(f"Failed to generate bonus topics: {str(e)}")


def get_mock_bonus_topics(focus: str) -> dict:
    """Return mock bonus topics when API is unavailable."""
    return {
        "message": f"🎉 Great job completing {focus}! Here are bonus challenges:",
        "tasks": [
            {
                "title": f"Advanced {focus} Challenge",
                "type": "problem",
                "duration": "45 min",
                "reason": f"Deepen your {focus} knowledge",
                "link": "https://leetcode.com/problems/lru-cache/",
                "difficulty": "Medium",
                "provider": "LeetCode",
            },
            {
                "title": f"Master {focus} - Deep Dive",
                "type": "course",
                "duration": "2 hrs",
                "reason": "Advanced concepts and patterns",
                "link": "https://www.udemy.com/course/master-the-coding-interview-data-structures-algorithms/",
                "provider": "Udemy",
                "youtubeAlternative": {
                    "title": f"{focus} Full Course - freeCodeCamp",
                    "link": "https://www.youtube.com/watch?v=8hly31xKli0",
                    "channel": "freeCodeCamp",
                    "duration": "2 hrs",
                },
            },
        ],
    }


async def match_roles(profile: dict) -> list:
    """
    Use GPT-4o-mini to match profile to suitable roles.
    """
    if not client:
        return get_mock_roles()
    
    skills_str = ", ".join([s.get("name", "") for s in profile.get("skills", [])])
    
    prompt = f"""Based on this candidate's profile, recommend 4 suitable job roles.

Skills: {skills_str}
Experience: {profile.get('experience', [])}

For each role, provide:
- Match score (percentage)
- Required skills (mark which ones the candidate has)
- Skill gaps to address
- Salary range
- Demand level

Respond in this exact JSON format:
{{
    "roles": [
        {{
            "id": "1",
            "title": "Senior Frontend Engineer",
            "company": "Example Co",
            "matchScore": 78,
            "salary": "$150K - $200K",
            "skills": [
                {{"name": "JavaScript", "match": true}},
                {{"name": "System Design", "match": false}}
            ],
            "gaps": ["System Design", "Testing"],
            "demand": "High"
        }}
    ]
}}
"""

    try:
        response = client.chat.completions.create(
            model=settings.openai_model,
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert career advisor matching candidates to suitable roles. Be realistic with match scores. Always respond with valid JSON.",
                },
                {"role": "user", "content": prompt},
            ],
            response_format={"type": "json_object"},
            temperature=0.7,
        )
        
        result = json.loads(response.choices[0].message.content)
        return result.get("roles", [])
    except Exception as e:
        print(f"OpenAI API error: {e}")
        return get_mock_roles()


async def get_daily_problem(profile: dict, target_role: str, completed_problems: list = None) -> dict:
    """
    Use GPT-4o-mini to recommend a daily LeetCode problem with full details.
    """
    if not client:
        return get_mock_daily_problem()
    
    skills = profile.get("skillGraph", profile.get("skills", []))
    skill_gaps = profile.get("skillGaps", [])
    completed = completed_problems or []
    
    prompt = f"""Recommend a LeetCode coding problem for today's practice.

Target Role: {target_role}
User's Skills: {[s.get('name') for s in skills]}
Skill Gaps: {skill_gaps}
Already Completed: {completed}

Select a REAL LeetCode problem that:
1. Is commonly asked in FAANG/tech company interviews
2. Helps address the user's skill gaps
3. Has NOT been completed yet (check the completed list)
4. Progresses difficulty appropriately

Provide the COMPLETE problem with:
- Real LeetCode URL
- Full problem description
- Example inputs/outputs
- Constraints
- Detailed reasoning for why YOU chose this specific problem

Respond in this exact JSON format:
{{
    "id": "daily-1",
    "title": "Two Sum",
    "slug": "two-sum",
    "type": "problem",
    "difficulty": "Easy",
    "companies": ["Google", "Amazon", "Meta", "Apple"],
    "frequency": 95,
    "estimatedTime": "30 min",
    "link": "https://leetcode.com/problems/two-sum/",
    "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
    "examples": [
        {{
            "input": "nums = [2,7,11,15], target = 9",
            "output": "[0,1]",
            "explanation": "Because nums[0] + nums[1] == 9, we return [0, 1]."
        }}
    ],
    "constraints": [
        "2 <= nums.length <= 10^4",
        "-10^9 <= nums[i] <= 10^9",
        "-10^9 <= target <= 10^9",
        "Only one valid answer exists."
    ],
    "topics": ["Array", "Hash Table"],
    "reason": "This problem is recommended because: 1) It's asked in 95% of Google interviews, 2) It teaches hash map optimization which addresses your Data Structures skill gap, 3) It's a perfect warm-up for the Two Pointers pattern you'll need for harder problems.",
    "hints": [
        "A really brute force way would be to search for all possible pairs of numbers but that would be too slow.",
        "Try to use a hash map to find the complement in O(1) time."
    ],
    "relatedProblems": [
        {{"title": "3Sum", "link": "https://leetcode.com/problems/3sum/", "difficulty": "Medium"}},
        {{"title": "Two Sum II", "link": "https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/", "difficulty": "Medium"}}
    ]
}}
"""

    try:
        response = client.chat.completions.create(
            model=settings.openai_model,
            messages=[
                {
                    "role": "system",
                    "content": """You are an expert coding interview coach. You have deep knowledge of LeetCode problems and FAANG interview patterns.
                    IMPORTANT: 
                    - Only recommend REAL LeetCode problems with correct URLs
                    - Provide the actual problem description as it appears on LeetCode
                    - Give detailed reasoning explaining WHY this specific problem helps the user
                    - Include real example test cases
                    Always respond with valid JSON.""",
                },
                {"role": "user", "content": prompt},
            ],
            response_format={"type": "json_object"},
            temperature=0.7,
        )
        
        result = json.loads(response.choices[0].message.content)
        return result
    except Exception as e:
        print(f"OpenAI API error: {e}")
        return get_mock_daily_problem()


# Mock data functions for demo mode
def get_mock_skill_graph() -> dict:
    return {
        "skills": [
            {"id": "1", "name": "JavaScript", "level": 85, "category": "Frontend", "connections": ["2", "3"]},
            {"id": "2", "name": "React", "level": 80, "category": "Frontend", "connections": ["1", "4"]},
            {"id": "3", "name": "TypeScript", "level": 70, "category": "Frontend", "connections": ["1", "2"]},
            {"id": "4", "name": "Node.js", "level": 75, "category": "Backend", "connections": ["2", "5"]},
            {"id": "5", "name": "Python", "level": 65, "category": "Backend", "connections": ["4", "6"]},
            {"id": "6", "name": "SQL", "level": 70, "category": "Database", "connections": ["5"]},
            {"id": "7", "name": "Git", "level": 85, "category": "DevOps", "connections": ["4"]},
            {"id": "8", "name": "Docker", "level": 45, "category": "DevOps", "connections": ["7"]},
        ],
        "experience": ["Software Engineer at Tech Corp (2 years)", "Intern at StartupXYZ (6 months)"],
        "education": ["B.S. Computer Science - State University"],
        "summary": "Full-stack developer with 2.5 years of experience in web development",
        "strongestSkills": ["JavaScript", "React", "Git"],
        "skillGaps": ["System Design", "Testing", "Cloud Services"],
    }


def get_mock_roadmap(target_role: str = "Senior Frontend Engineer") -> dict:
    """Return role-specific mock roadmap based on target role."""
    
    # Normalize role for matching
    role_lower = target_role.lower()
    
    # Backend/Python focused roles
    if any(kw in role_lower for kw in ["backend", "python", "django", "flask", "data engineer", "ml engineer", "machine learning"]):
        return get_backend_roadmap(target_role)
    
    # Full Stack roles
    if any(kw in role_lower for kw in ["full stack", "fullstack"]):
        return get_fullstack_roadmap(target_role)
    
    # DevOps/Cloud roles
    if any(kw in role_lower for kw in ["devops", "cloud", "sre", "infrastructure", "platform"]):
        return get_devops_roadmap(target_role)
    
    # Data Science roles
    if any(kw in role_lower for kw in ["data scientist", "data analyst", "analytics"]):
        return get_data_science_roadmap(target_role)
    
    # Default: Frontend focused
    return get_frontend_roadmap(target_role)


def get_frontend_roadmap(target_role: str) -> dict:
    return {
        "weeks": [
            {
                "id": "w1",
                "number": 1,
                "title": "Foundation & Data Structures",
                "description": "Build strong fundamentals with arrays, strings, and hash maps",
                "focus": "Data Structures",
                "tasks": [
                    {
                        "id": "t1",
                        "title": "Two Sum",
                        "type": "problem",
                        "duration": "30 min",
                        "reason": "Most frequently asked problem at Google, Amazon, Meta",
                        "completed": False,
                        "link": "https://leetcode.com/problems/two-sum/",
                        "difficulty": "Easy",
                        "provider": "LeetCode"
                    },
                    {
                        "id": "t2",
                        "title": "Valid Anagram",
                        "type": "problem",
                        "duration": "25 min",
                        "reason": "Essential hash map practice for string manipulation",
                        "completed": False,
                        "link": "https://leetcode.com/problems/valid-anagram/",
                        "difficulty": "Easy",
                        "provider": "LeetCode"
                    },
                    {
                        "id": "t3",
                        "title": "JavaScript Algorithms and Data Structures Masterclass",
                        "type": "course",
                        "duration": "4 hrs",
                        "reason": "Comprehensive DSA foundation with JavaScript examples",
                        "completed": False,
                        "link": "https://www.udemy.com/course/js-algorithms-and-data-structures-masterclass/",
                        "provider": "Udemy",
                        "instructor": "Colt Steele",
                        "youtubeAlternative": {
                            "title": "Data Structures and Algorithms with JavaScript - freeCodeCamp",
                            "link": "https://www.youtube.com/watch?v=t2CEgPsws3U",
                            "channel": "freeCodeCamp",
                            "duration": "4 hrs"
                        }
                    },
                ],
            },
            {
                "id": "w2",
                "number": 2,
                "title": "Two Pointers & Sliding Window",
                "description": "Master efficient array traversal techniques",
                "focus": "Algorithms",
                "tasks": [
                    {
                        "id": "t4",
                        "title": "Valid Palindrome",
                        "type": "problem",
                        "duration": "25 min",
                        "reason": "Classic two pointer problem asked at Facebook",
                        "completed": False,
                        "link": "https://leetcode.com/problems/valid-palindrome/",
                        "difficulty": "Easy",
                        "provider": "LeetCode"
                    },
                    {
                        "id": "t5",
                        "title": "Container With Most Water",
                        "type": "problem",
                        "duration": "35 min",
                        "reason": "Medium difficulty two pointer optimization problem",
                        "completed": False,
                        "link": "https://leetcode.com/problems/container-with-most-water/",
                        "difficulty": "Medium",
                        "provider": "LeetCode"
                    },
                    {
                        "id": "t6",
                        "title": "Maximum Subarray (Kadane's Algorithm)",
                        "type": "problem",
                        "duration": "30 min",
                        "reason": "Essential sliding window/dynamic programming problem",
                        "completed": False,
                        "link": "https://leetcode.com/problems/maximum-subarray/",
                        "difficulty": "Medium",
                        "provider": "LeetCode"
                    },
                    {
                        "id": "t6b",
                        "title": "Sliding Window Technique",
                        "type": "course",
                        "duration": "2 hrs",
                        "reason": "Master the sliding window pattern for array problems",
                        "completed": False,
                        "link": "https://www.udemy.com/course/master-the-coding-interview-data-structures-algorithms/",
                        "provider": "Udemy",
                        "youtubeAlternative": {
                            "title": "Sliding Window Technique - NeetCode",
                            "link": "https://www.youtube.com/watch?v=p-ss2JNynmw",
                            "channel": "NeetCode",
                            "duration": "30 min"
                        }
                    },
                ],
            },
            {
                "id": "w3",
                "number": 3,
                "title": "Trees & Graphs",
                "description": "Understand tree traversals and graph algorithms",
                "focus": "Data Structures",
                "tasks": [
                    {
                        "id": "t7",
                        "title": "Invert Binary Tree",
                        "type": "problem",
                        "duration": "20 min",
                        "reason": "Famous interview problem, tests tree manipulation",
                        "completed": False,
                        "link": "https://leetcode.com/problems/invert-binary-tree/",
                        "difficulty": "Easy",
                        "provider": "LeetCode"
                    },
                    {
                        "id": "t8",
                        "title": "Graph Theory Algorithms",
                        "type": "course",
                        "duration": "3 hrs",
                        "reason": "Deep dive into BFS, DFS, and graph traversals",
                        "completed": False,
                        "link": "https://www.udemy.com/course/graph-theory-algorithms/",
                        "provider": "Udemy",
                        "instructor": "William Fiset",
                        "youtubeAlternative": {
                            "title": "Graph Algorithms for Technical Interviews - freeCodeCamp",
                            "link": "https://www.youtube.com/watch?v=tWVWeAqZ0WU",
                            "channel": "freeCodeCamp",
                            "duration": "2 hrs"
                        }
                    },
                ],
            },
            {
                "id": "w4",
                "number": 4,
                "title": "System Design Basics",
                "description": "Learn fundamentals of scalable system design",
                "focus": "System Design",
                "tasks": [
                    {
                        "id": "t9",
                        "title": "System Design Interview – An insider's guide",
                        "type": "course",
                        "duration": "5 hrs",
                        "reason": "Industry standard system design preparation",
                        "completed": False,
                        "link": "https://www.udemy.com/course/system-design-interview-prep/",
                        "provider": "Udemy",
                        "youtubeAlternative": {
                            "title": "System Design for Beginners - NeetCode",
                            "link": "https://www.youtube.com/watch?v=m8Icp_Cid5o",
                            "channel": "NeetCode",
                            "duration": "1 hr"
                        }
                    },
                    {
                        "id": "t10",
                        "title": "Mock Interview #1",
                        "type": "interview",
                        "duration": "45 min",
                        "reason": "Practice with AI interviewer to identify weak areas",
                        "completed": False
                    },
                ],
            },
        ],
        "predictedReadyDate": "10 weeks",
        "targetRole": "Senior Frontend Engineer",
        "totalTasks": 40,
        "estimatedHoursPerWeek": 10,
        "recommendedCourses": [
            {
                "title": "JavaScript Algorithms and Data Structures Masterclass",
                "platform": "Udemy",
                "link": "https://www.udemy.com/course/js-algorithms-and-data-structures-masterclass/",
                "reason": "Best-rated DSA course for JavaScript developers"
            },
            {
                "title": "React - The Complete Guide 2024",
                "platform": "Udemy",
                "link": "https://www.udemy.com/course/react-the-complete-guide-incl-redux/",
                "reason": "Master React for frontend engineering roles"
            }
        ]
    }


def get_mock_roles() -> list:
    return [
        {
            "id": "1",
            "title": "Senior Frontend Engineer",
            "company": "Google",
            "matchScore": 78,
            "salary": "$150K - $200K",
            "skills": [
                {"name": "JavaScript", "match": True},
                {"name": "React", "match": True},
                {"name": "TypeScript", "match": True},
                {"name": "System Design", "match": False},
            ],
            "gaps": ["System Design", "Testing"],
            "demand": "High",
        },
        {
            "id": "2",
            "title": "Full Stack Developer",
            "company": "Meta",
            "matchScore": 72,
            "salary": "$140K - $180K",
            "skills": [
                {"name": "JavaScript", "match": True},
                {"name": "React", "match": True},
                {"name": "Node.js", "match": True},
                {"name": "GraphQL", "match": False},
            ],
            "gaps": ["GraphQL", "AWS"],
            "demand": "High",
        },
    ]


def get_mock_daily_problem() -> dict:
    return {
        "id": "daily-1",
        "title": "Two Sum",
        "slug": "two-sum",
        "type": "problem",
        "difficulty": "Easy",
        "companies": ["Google", "Amazon", "Meta", "Apple", "Microsoft"],
        "frequency": 95,
        "estimatedTime": "30 min",
        "link": "https://leetcode.com/problems/two-sum/",
        "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.",
        "examples": [
            {
                "input": "nums = [2,7,11,15], target = 9",
                "output": "[0,1]",
                "explanation": "Because nums[0] + nums[1] == 9, we return [0, 1]."
            },
            {
                "input": "nums = [3,2,4], target = 6",
                "output": "[1,2]",
                "explanation": "nums[1] + nums[2] == 6"
            },
            {
                "input": "nums = [3,3], target = 6",
                "output": "[0,1]",
                "explanation": "nums[0] + nums[1] == 6"
            }
        ],
        "constraints": [
            "2 <= nums.length <= 10^4",
            "-10^9 <= nums[i] <= 10^9",
            "-10^9 <= target <= 10^9",
            "Only one valid answer exists."
        ],
        "topics": ["Array", "Hash Table"],
        "reason": "This problem is specifically chosen for you because:\n\n1. **Interview Frequency**: Two Sum appears in 95% of technical interviews at Google, Amazon, and Meta. It's often the first problem asked as a warm-up.\n\n2. **Skill Building**: It teaches the crucial pattern of using hash maps for O(n) lookups, which is fundamental for solving more complex problems.\n\n3. **Foundation for Harder Problems**: Mastering Two Sum prepares you for 3Sum, 4Sum, and Two Sum II which are commonly asked follow-up questions.\n\n4. **Matches Your Profile**: Based on your JavaScript skills, this problem will help you practice efficient data structure usage in your primary language.",
        "hints": [
            "A really brute force way would be to search for all possible pairs of numbers but that would be too slow. Try O(n^2) first if you're stuck.",
            "Try to use a hash map to reduce the time complexity. Can you find the complement of each number in O(1)?",
            "One pass through the array while building the hash map is enough!"
        ],
        "relatedProblems": [
            {"title": "3Sum", "link": "https://leetcode.com/problems/3sum/", "difficulty": "Medium"},
            {"title": "Two Sum II - Input Array Is Sorted", "link": "https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/", "difficulty": "Medium"},
            {"title": "Two Sum III - Data structure design", "link": "https://leetcode.com/problems/two-sum-iii-data-structure-design/", "difficulty": "Easy"},
            {"title": "4Sum", "link": "https://leetcode.com/problems/4sum/", "difficulty": "Medium"}
        ],
        "optimalSolution": {
            "approach": "Hash Map",
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(n)",
            "explanation": "Use a hash map to store each number's complement as you iterate through the array."
        }
    }
