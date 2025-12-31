import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface Skill {
  id: string;
  name: string;
  level: number;
  category: string;
  connections?: string[];
  yearsOfExperience?: number;
  evidence?: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  role?: string;
  impact?: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  metrics?: string;
}

interface Certification {
  id: string;
  name: string;
  issuer: string;
  year?: string;
}

interface Experience {
  company: string;
  role: string;
  duration: string;
  startDate?: string;
  endDate?: string;
  highlights?: string[];
}

interface Education {
  degree: string;
  institution: string;
  year?: string;
  gpa?: string;
}

interface Profile {
  id: string;
  userId?: string;
  skills: Skill[];
  skillGraph: Skill[];  // For the visual graph
  experience: (string | Experience)[];
  education: (string | Education)[];
  summary: string;
  strongestSkills: string[];
  skillGaps: string[];
  // Extended profile data
  projects?: Project[];
  achievements?: Achievement[];
  certifications?: Certification[];
  totalYearsExperience?: number;
  seniorityLevel?: string;
  resumeText?: string;
}

interface Role {
  id: string;
  title: string;
  company?: string;
  matchPercentage: number;
  requiredSkills: string[];
  missingSkills: string[];
  salary?: string;
}

interface AppContextType {
  profile: Profile | null;
  setProfile: (profile: Profile | null) => void;
  selectedRole: Role | null;
  setSelectedRole: (role: Role | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  userId: string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Use authenticated user ID from AuthContext
  const userId = user?.id || 'demo-user';

  return (
    <AppContext.Provider
      value={{
        profile,
        setProfile,
        selectedRole,
        setSelectedRole,
        isLoading,
        setIsLoading,
        userId,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
