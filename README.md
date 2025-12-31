# SkillSurge - AI Career Co-Pilot

An intelligent career development platform that analyzes your skills, recommends optimal career paths, and creates personalized learning roadmaps to help you land your dream job.

## 🎯 Project Overview

SkillSurge is an AI-powered platform designed to bridge the gap between your current skills and your target role. Using advanced resume analysis, skill assessment, and intelligent roadmap generation, it provides a comprehensive preparation strategy tailored to your career goals.

### Problem Statement
Job seekers struggle to:
- Accurately assess their current skill levels
- Identify critical skill gaps for their target roles
- Create structured, personalized learning plans
- Stay motivated with measurable progress tracking
- Practice with realistic, role-specific problems

SkillSurge solves all of these challenges with an intelligent, AI-driven approach.

## ✨ Key Features

### 1. **Smart Resume Analysis**
- Upload your resume (PDF, DOC, TXT)
- AI automatically extracts skills, experience, projects, and achievements
- Intelligent skill categorization (Languages, AI/ML, Frontend, Backend, Database, etc.)
- Proficiency level assessment based on context

### 2. **Intelligent Role Recommendations**
- Analyzes your skill profile against job market data
- Recommends roles with match percentages
- Shows required vs. missing skills for each role
- Displays salary ranges for transparency

### 3. **Personalized Roadmaps**
- Subject-wise breakdown of learning areas
- Core subjects tailored to your target role
- Week-by-week learning plan with estimated hours
- Priority-based subject ordering (High/Medium/Low)

### 4. **Structured Learning Paths**
Each subject includes:
- **Weekly breakdown** with specific focus areas
- **Task-based structure** (videos, readings, coding problems, projects)
- **Progress tracking** with completion percentages
- **Difficulty levels** (Easy, Medium, Hard) for realistic preparation
- **Resource links** to curated learning materials

### 5. **Daily Practice System**
- Daily coding problems matched to your learning path
- Difficulty progression from fundamentals to advanced
- Company-specific problem frequencies
- Streak tracking for consistency motivation

### 6. **Dashboard Analytics**
- Real-time skill match percentage
- Streak tracking for daily consistency
- Problems solved counter
- Job-readiness prediction based on progress
- Skill improvement visualization over weeks

### 7. **Interview Preparation**
- Mock interview simulator with AI evaluation
- Behavioral question practice
- Technical problem solving
- Interview feedback and improvement areas

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- React 18 with TypeScript
- Vite for lightning-fast builds
- TailwindCSS for responsive design
- Framer Motion for smooth animations
- Recharts for analytics visualization
- Lucide Icons for UI components

**Backend:**
- FastAPI (Python 3.12)
- Supabase PostgreSQL for data persistence
- OpenAI GPT-4o-mini for AI analysis
- Python-DOCX and PyPDF2 for resume parsing

**AI/ML:**
- OpenAI API for skill extraction and analysis
- Intelligent prompt engineering for role recommendations
- LangChain for RAG-based knowledge retrieval

### System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   React Frontend                        │
│  (Vite + TypeScript + TailwindCSS + Framer Motion)     │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
    ┌───▼──────┐          ┌──────▼────────┐
    │ FastAPI  │          │  Supabase     │
    │ Backend  │◄────────►│  PostgreSQL   │
    └───┬──────┘          └──────┬────────┘
        │                        │
        │         ┌──────────────┘
        │         │
    ┌───▼─────────▼──┐
    │   OpenAI API   │
    │  (GPT-4o-mini) │
    └────────────────┘
```

## 📁 Project Structure

```
SkillSurge/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Onboarding.tsx          # 5-step onboarding flow
│   │   │   ├── Dashboard.tsx            # Main dashboard with daily problem
│   │   │   ├── SubjectOverview.tsx      # All subjects overview
│   │   │   ├── SubjectDetail.tsx        # Individual subject roadmap
│   │   │   ├── Interview.tsx            # Mock interview simulator
│   │   │   └── Auth pages               # Login, signup, password reset
│   │   ├── components/
│   │   │   ├── ResumeUpload.tsx         # Resume file upload
│   │   │   ├── SkillProficiency.tsx     # Skill rating interface
│   │   │   ├── RoleMatch.tsx            # Role selection cards
│   │   │   ├── DailyProblemCard.tsx     # Daily coding problem
│   │   │   ├── SkillGraph.tsx           # Skill visualization
│   │   │   └── Layout.tsx               # Navigation layout
│   │   ├── context/
│   │   │   ├── AuthContext.tsx          # Authentication state
│   │   │   └── AppContext.tsx           # Global app state
│   │   ├── services/
│   │   │   └── api.ts                   # API client
│   │   └── data/
│   │       └── mockDemoData.ts          # Complete demo data
│   ├── package.json
│   └── vite.config.ts
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth.py                  # Authentication endpoints
│   │   │   ├── profile.py               # Profile management
│   │   │   ├── roles.py                 # Role recommendations
│   │   │   ├── roadmap.py               # Roadmap generation
│   │   │   ├── dashboard.py             # Dashboard data
│   │   │   └── interview.py             # Interview endpoints
│   │   ├── services/
│   │   │   ├── resume_parser.py         # Resume parsing logic
│   │   │   ├── supabase_service.py      # Database operations
│   │   │   ├── openai_service.py        # OpenAI integration
│   │   │   └── roadmap_generator.py     # Roadmap AI generation
│   │   └── models.py                    # Data models
│   ├── main.py                          # FastAPI app entry
│   ├── requirements.txt
│   └── venv/                            # Virtual environment
│
├── README.md (this file)
└── .git/
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.12+
- Supabase account
- OpenAI API key
- Git

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will start at `http://localhost:5173` (or 5174 if port is busy)

### Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # macOS/Linux

pip install -r requirements.txt
python main.py
```

The backend will start at `http://localhost:8000`

### Environment Variables

**Frontend (.env):**
```
VITE_API_URL=http://localhost:8000
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

**Backend (.env):**
```
DATABASE_URL=postgresql://user:password@localhost/skillsurge
OPENAI_API_KEY=your_openai_key
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
```

## 📊 Data Flow

### Onboarding Journey

1. **Resume Upload** → User uploads resume (PDF/DOC/TXT)
2. **Skill Extraction** → AI analyzes resume and extracts skills with proficiency levels
3. **Skill Review** → User reviews/adjusts extracted skills and proficiency ratings
4. **Role Selection** → AI recommends matching roles based on skills
5. **Timeline Setting** → User selects preparation duration and daily hours
6. **Roadmap Generation** → AI creates personalized learning roadmap

### Learning Experience

```
User Profile (Skills + Target Role)
        ↓
Role Analysis (Required Skills, Gaps)
        ↓
Subject Selection (4-6 core subjects)
        ↓
Weekly Breakdown (6-12 weeks)
        ↓
Daily Tasks (Videos, Readings, Problems, Projects)
        ↓
Progress Tracking (Completion %, Skill Improvement)
        ↓
Job Readiness Score & Timeline
```

## 🧠 AI Integration

### Resume Analysis
- Extracts skills with context understanding
- Identifies experience level for each skill
- Recognizes projects and achievements
- Detects certifications and education

### Role Recommendations
- Matches user skills against job requirements
- Calculates match percentages
- Identifies skill gaps
- Suggests learning priorities

### Roadmap Generation
- Creates personalized learning plans
- Assigns appropriate difficulty progression
- Curates relevant resources
- Optimizes timeline based on available hours

### Daily Problem Selection
- Matches problems to current learning focus
- Progressively increases difficulty
- Considers company-specific frequencies
- Tracks solved problems

## 📈 Key Metrics

The platform tracks:
- **Skill Match %**: Current alignment with target role
- **Day Streak**: Consecutive days of practice
- **Problems Solved**: Total coding problems completed
- **Weeks Until Ready**: Estimated time to job readiness
- **Subject Progress**: Completion % for each subject
- **Weekly Improvement**: Skill growth visualization

## 🔐 Security

- Supabase authentication with email/password
- JWT token-based API authentication
- HTTPS only in production
- User data encryption in database
- Secure API endpoints with middleware validation

## 🎓 Learning Subjects

The platform covers 4-6 core subjects depending on target role:

### Common Subjects
- **Data Structures & Algorithms** (6 weeks) - Foundation for technical interviews
- **System Design** (4 weeks) - Architecture and scalability
- **AI/ML Fundamentals** (4 weeks) - Core concepts for AI roles
- **Behavioral** (2 weeks) - STAR method and company fit

### Role-Specific Subjects
- Full Stack Development, DevOps, NLP, Computer Vision, etc.

Each subject contains:
- 3-5 weeks of structured content
- 15-30 daily tasks
- Videos, reading materials, coding problems
- Real-world projects for hands-on learning

## 🎯 Target Users

- **Job Seekers**: Preparing for career transitions
- **Recent Graduates**: Entering the tech industry
- **Career Changers**: Moving to AI/ML or specialized roles
- **Interview Preparation**: Candidates in active job search
- **Skill Development**: Professionals upgrading their expertise

## 📚 Technology Details

### Resume Parsing
- Multi-method extraction: PyPDF2, pdfplumber, pdfminer, PyMuPDF
- Fallback mechanisms for edge cases
- Intelligent section detection (Skills, Experience, Education, Projects)
- Regex-based pattern matching for skill extraction

### Database Schema
- **users** - User accounts and authentication
- **profiles** - User skill profiles and resume data
- **roles** - Target role information and requirements
- **roadmaps** - Generated learning roadmaps
- **subjects** - Learning subjects and content
- **user_progress** - Tracking user progress
- **daily_problems** - Daily coding problem pool
- **user_solutions** - User problem submissions and solutions

### API Endpoints

**Auth**
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Current user

**Profile**
- `POST /api/profile` - Create profile
- `GET /api/profile/{id}` - Get profile
- `POST /api/profile/analyze-resume` - Resume analysis

**Roadmap**
- `POST /api/roadmap/generate` - Generate roadmap
- `GET /api/roadmap/{id}` - Get roadmap details
- `GET /api/roadmap/{id}/subjects` - Subject-wise breakdown

**Dashboard**
- `GET /api/dashboard/{user_id}` - Dashboard data
- `GET /api/dashboard/{user_id}/daily` - Daily problem
- `POST /api/dashboard/{user_id}/complete` - Mark problem complete

## 🧪 Testing

Run frontend tests:
```bash
cd frontend
npm run test
```

Run backend tests:
```bash
cd backend
pytest
```

## 📝 Development Workflow

1. Create feature branch: `git checkout -b feature/feature-name`
2. Make changes and commit: `git commit -m "feat: description"`
3. Push to remote: `git push origin feature/feature-name`
4. Create pull request on GitHub

## 🚢 Deployment

### Frontend (Vercel)
```bash
npm run build
vercel deploy
```

### Backend (Railway/Render)
```bash
git push origin main
# Auto-deploys from GitHub
```

## 🐛 Known Limitations

- Resume parsing works best with standard formats
- AI analysis depends on OpenAI API availability
- Real-time collaboration features not yet implemented
- Mobile app not yet available

## 🔮 Future Features

- [ ] Mobile app (React Native)
- [ ] Real-time collaboration on learning plans
- [ ] Peer comparison and community features
- [ ] Video tutorials integrated in platform
- [ ] Company-specific preparation paths
- [ ] Mentor matching system
- [ ] Job opportunity recommendations
- [ ] Interview recordings and playback

## 📞 Support

For issues, questions, or feature requests:
1. Check existing GitHub issues
2. Create a new issue with detailed description
3. Contact support: support@skillsurge.ai

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

## 👥 Author

**Mathana Guru Sabareesan S**
- AI/ML Engineer
- Full-stack developer
- Hackathon finalist (7th place at IIT Kharagpur Data Science Hackathon)

## 🙏 Acknowledgments

- OpenAI for GPT-4o-mini API
- Supabase for database infrastructure
- React and Vite communities
- FastAPI framework
- All contributors and testers

---

**SkillSurge** - Your AI Career Co-Pilot 🚀

*Last Updated: December 2025*
