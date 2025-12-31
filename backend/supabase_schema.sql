-- SkillSurge Supabase Schema
-- Run this SQL in the Supabase SQL Editor to create the required tables

-- Profiles table: Stores user skill profiles
CREATE TABLE IF NOT EXISTS profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    skills JSONB DEFAULT '[]'::jsonb,
    skill_graph JSONB DEFAULT '[]'::jsonb,
    experience JSONB DEFAULT '[]'::jsonb,
    education JSONB DEFAULT '[]'::jsonb,
    summary TEXT DEFAULT '',
    strongest_skills JSONB DEFAULT '[]'::jsonb,
    skill_gaps JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Roadmaps table: Stores personalized learning roadmaps
CREATE TABLE IF NOT EXISTS roadmaps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    target_role TEXT NOT NULL,
    weeks JSONB DEFAULT '[]'::jsonb,
    overview JSONB DEFAULT NULL,
    predicted_ready_date TEXT DEFAULT '10 weeks',
    total_tasks INTEGER DEFAULT 0,
    estimated_hours_per_week INTEGER DEFAULT 10,
    task_completion_times JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, target_role)
);

-- Migration: Add task_completion_times column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'roadmaps' AND column_name = 'task_completion_times') THEN
        ALTER TABLE roadmaps ADD COLUMN task_completion_times JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- Migration: Add overview column if it doesn't exist (for comprehensive roadmaps)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'roadmaps' AND column_name = 'overview') THEN
        ALTER TABLE roadmaps ADD COLUMN overview JSONB DEFAULT NULL;
    END IF;
END $$;

-- Migration: Add projects column to profiles if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'projects') THEN
        ALTER TABLE profiles ADD COLUMN projects JSONB DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- Migration: Add achievements column to profiles if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'achievements') THEN
        ALTER TABLE profiles ADD COLUMN achievements JSONB DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- Migration: Add certifications column to profiles if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'certifications') THEN
        ALTER TABLE profiles ADD COLUMN certifications JSONB DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- Migration: Add total_years_experience column to profiles if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'total_years_experience') THEN
        ALTER TABLE profiles ADD COLUMN total_years_experience INTEGER DEFAULT 0;
    END IF;
END $$;

-- Migration: Add seniority_level column to profiles if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'seniority_level') THEN
        ALTER TABLE profiles ADD COLUMN seniority_level TEXT DEFAULT 'Entry';
    END IF;
END $$;

-- Interview sessions table: Stores mock interview sessions
CREATE TABLE IF NOT EXISTS interview_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    target_role TEXT NOT NULL,
    session_data JSONB DEFAULT '{}'::jsonb,
    feedback JSONB DEFAULT '{}'::jsonb,
    score INTEGER,
    duration_minutes INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Progress table: Tracks user progress over time
CREATE TABLE IF NOT EXISTS user_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    tasks_completed INTEGER DEFAULT 0,
    problems_solved INTEGER DEFAULT 0,
    hours_studied NUMERIC(5,2) DEFAULT 0,
    streak_days INTEGER DEFAULT 0,
    current_week INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_roadmaps_user_id ON roadmaps(user_id);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_user_id ON interview_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_roadmaps_updated_at ON roadmaps;
CREATE TRIGGER update_roadmaps_updated_at
    BEFORE UPDATE ON roadmaps
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (optional, for production)
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE roadmaps ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE interview_sessions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Grant access to authenticated users (for production with Supabase Auth)
-- CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid()::text = user_id);
-- CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid()::text = user_id);
