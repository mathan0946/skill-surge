import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface Skill {
  id: string;
  name: string;
  level: number;
  category: string;
  connections: string[];
  yearsOfExperience?: number;
}

interface Profile {
  id: string;
  skills: Skill[];
  skillGraph: Skill[];  // For the visual graph
  experience: string[];
  education: string[];
  summary: string;
  strongestSkills: string[];
  skillGaps: string[];
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
  const [profile, setProfile] = useState<Profile | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Mock user ID for demo (in production, this would come from auth)
  const userId = `user-${Date.now().toString(36)}`;

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
