import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ResumeUpload } from '../components/ResumeUpload';
import { SkillProficiency } from '../components/SkillProficiency';
import { RoleMatch } from '../components/RoleMatch';
import { TimeConstraint, TimeConstraint as TimeConstraintType } from '../components/TimeConstraint';
import { Button } from '../components/ui/Button';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { profileApi, rolesApi, roadmapApi } from '../services/api';
import { ArrowRight, ArrowLeft, Check, Upload, Star, Target, Clock, Sparkles, Loader2 } from 'lucide-react';

const steps = [
  { id: 1, title: 'Upload Resume', description: 'Let AI analyze your skills', icon: Upload },
  { id: 2, title: 'Rate Skills', description: 'Confirm your proficiency', icon: Star },
  { id: 3, title: 'Select Role', description: 'Choose your target role', icon: Target },
  { id: 4, title: 'Timeline', description: 'Set your preparation time', icon: Clock },
  { id: 5, title: 'Generate Plan', description: 'Create your roadmap', icon: Sparkles },
];

interface Skill {
  id: string;
  name: string;
  level: number;
  category: string;
  connections?: string[];
}

interface Role {
  id: string;
  title: string;
  matchPercentage: number;
  requiredSkills: string[];
  missingSkills: string[];
  salary?: string;
  subjects?: string[];
}

export function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setProfile, setSelectedRole } = useApp();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [ratedSkills, setRatedSkills] = useState<Skill[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoleData, setSelectedRoleData] = useState<Role | null>(null);
  const [timeConstraint, setTimeConstraint] = useState<TimeConstraintType | null>(null);
  const [resumeText, setResumeText] = useState<string>('');
  const [generatingRoadmap, setGeneratingRoadmap] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);

  const handleResumeUpload = async (text: string) => {
    setIsLoading(true);
    setResumeText(text); // Store full resume text
    
    try {
      // Send complete resume text to OpenAI for analysis
      const response = await profileApi.analyzeText(text);
      const profile = response.data?.profile || response.profile || response.data || response;
      const skillData = response.data?.data || response.data || profile;
      
      // Build skill graph from response - use the full skill data from OpenAI
      const skillGraph: Skill[] = (skillData.skills || skillData.skillGraph || []).map((s: any, index: number) => ({
        id: s.id || String(index + 1),
        name: typeof s === 'string' ? s : s.name,
        level: s.level || 50, // Use AI-determined level
        category: s.category || 'Other',
        connections: s.connections || [],
      }));
      
      setSkills(skillGraph);
      setRatedSkills(skillGraph);
      
      // Build comprehensive profile with all extracted data
      const profileInfo = {
        id: profile.id || 'demo-profile',
        userId: profile.userId,
        skills: skillGraph,
        skillGraph: skillGraph,
        experience: skillData.experience || profile.experience || [],
        education: skillData.education || profile.education || [],
        summary: skillData.summary || profile.summary || '',
        strongestSkills: skillData.strongestSkills || profile.strongestSkills || [],
        skillGaps: skillData.skillGaps || profile.skillGaps || [],
        resumeText: text, // Store for roadmap generation
        // Extended profile data from OpenAI
        projects: skillData.projects || profile.projects || [],
        achievements: skillData.achievements || profile.achievements || [],
        certifications: skillData.certifications || profile.certifications || [],
        totalYearsExperience: skillData.totalYearsExperience || profile.totalYearsExperience || 0,
        seniorityLevel: skillData.seniorityLevel || profile.seniorityLevel || 'Entry',
      };
      
      setProfileData(profileInfo);
      setProfile(profileInfo);
      setCurrentStep(2);
    } catch (error) {
      console.error('Error processing resume:', error);
      // Use sample data on error for demo
      const mockSkills: Skill[] = [
        { id: '1', name: 'JavaScript', level: 75, category: 'Languages', connections: ['2', '3'] },
        { id: '2', name: 'TypeScript', level: 70, category: 'Languages', connections: ['1'] },
        { id: '3', name: 'React', level: 80, category: 'Frontend', connections: ['1', '4'] },
        { id: '4', name: 'Node.js', level: 65, category: 'Backend', connections: ['3', '5'] },
        { id: '5', name: 'PostgreSQL', level: 55, category: 'Database', connections: ['4'] },
        { id: '6', name: 'Python', level: 50, category: 'Languages', connections: ['7'] },
        { id: '7', name: 'FastAPI', level: 45, category: 'Backend', connections: ['6'] },
        { id: '8', name: 'Docker', level: 40, category: 'DevOps', connections: ['4'] },
        { id: '9', name: 'AWS', level: 35, category: 'DevOps', connections: ['8'] },
        { id: '10', name: 'Git', level: 85, category: 'Tools', connections: [] },
      ];
      
      setSkills(mockSkills);
      setRatedSkills(mockSkills);
      setProfileData({
        id: 'demo-profile',
        skills: mockSkills,
        skillGraph: mockSkills,
        experience: ['Tech Corp - Software Engineer - 3 years'],
        education: ['BS Computer Science'],
        summary: 'Experienced software engineer with full-stack development skills',
        strongestSkills: ['JavaScript', 'React', 'TypeScript'],
        skillGaps: ['System Design', 'Algorithms', 'Data Structures'],
      });
      setCurrentStep(2);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkillsRated = (rated: Skill[]) => {
    setRatedSkills(rated);
  };

  const handleProceedToRoles = async () => {
    setIsLoading(true);
    try {
      // Update profile with rated skills
      const updatedProfile = {
        ...profileData,
        skills: ratedSkills,
        skillGraph: ratedSkills,
      };
      setProfileData(updatedProfile);
      setProfile(updatedProfile);
      
      // Get role recommendations based on rated skills WITH proficiency levels
      const skillsWithLevels = ratedSkills.map(s => ({
        name: s.name,
        category: s.category,
        proficiency: s.level,
      }));
      
      const rolesResponse = await rolesApi.getRecommendationsWithLevels(skillsWithLevels);
      const rolesData = rolesResponse.roles || rolesResponse.data?.roles || rolesResponse || [];
      
      setRoles(rolesData);
      setCurrentStep(3);
    } catch (error) {
      console.error('Error getting role recommendations:', error);
      // Use sample roles on error
      const mockRoles: Role[] = [
        {
          id: '1',
          title: 'Senior Frontend Engineer',
          matchPercentage: 75,
          requiredSkills: ['JavaScript', 'React', 'TypeScript', 'CSS'],
          missingSkills: ['System Design', 'Performance Optimization', 'Testing'],
          salary: '$150K - $200K',
          subjects: ['Data Structures', 'Algorithms', 'System Design', 'Frontend Architecture', 'Testing'],
        },
        {
          id: '2',
          title: 'Full Stack Developer',
          matchPercentage: 70,
          requiredSkills: ['JavaScript', 'React', 'Node.js', 'PostgreSQL'],
          missingSkills: ['AWS', 'Microservices', 'Docker'],
          salary: '$130K - $180K',
          subjects: ['Data Structures', 'Algorithms', 'System Design', 'Backend Development', 'Database Design', 'DevOps'],
        },
        {
          id: '3',
          title: 'Software Engineer (Backend)',
          matchPercentage: 60,
          requiredSkills: ['Python', 'Node.js', 'PostgreSQL'],
          missingSkills: ['System Design', 'Distributed Systems', 'Algorithms', 'Data Structures'],
          salary: '$140K - $190K',
          subjects: ['Data Structures', 'Algorithms', 'System Design', 'Distributed Systems', 'Database Internals'],
        },
        {
          id: '4',
          title: 'DevOps Engineer',
          matchPercentage: 45,
          requiredSkills: ['Docker', 'AWS', 'Git'],
          missingSkills: ['Kubernetes', 'Terraform', 'CI/CD', 'Monitoring'],
          salary: '$130K - $170K',
          subjects: ['Cloud Architecture', 'Container Orchestration', 'Infrastructure as Code', 'CI/CD Pipelines'],
        },
      ];
      setRoles(mockRoles);
      setCurrentStep(3);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleSelect = (role: Role) => {
    setSelectedRoleData(role);
    setSelectedRole(role);
  };

  const handleProceedToTimeline = () => {
    setCurrentStep(4);
  };

  const handleTimeSelected = (constraint: TimeConstraintType) => {
    setTimeConstraint(constraint);
  };

  const handleGenerateRoadmap = async () => {
    if (!selectedRoleData || !timeConstraint) return;
    
    setGeneratingRoadmap(true);
    setCurrentStep(5);
    
    try {
      // Generate comprehensive roadmap with all parameters
      const response = await roadmapApi.generateComprehensive({
        userId: user?.id || 'demo-user',
        targetRole: selectedRoleData.title,
        skills: ratedSkills.map(s => ({
          name: s.name,
          category: s.category,
          proficiency: s.level,
        })),
        missingSkills: selectedRoleData.missingSkills,
        timeConstraint: {
          weeks: timeConstraint.weeks,
          hoursPerDay: timeConstraint.hoursPerDay,
          intensity: timeConstraint.intensity,
        },
        resumeText: resumeText,
      });
      
      // Roadmap is saved to Supabase by the backend
      console.log('Roadmap generated:', response);
      
      // Navigate to subject overview page
      setTimeout(() => {
        navigate('/subject-overview');
      }, 2000);
    } catch (error) {
      console.error('Error generating roadmap:', error);
      // Still navigate - the page will handle missing data
      setTimeout(() => {
        navigate('/subject-overview');
      }, 2000);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 2: return ratedSkills.length > 0;
      case 3: return selectedRoleData !== null;
      case 4: return timeConstraint !== null;
      default: return true;
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-10">
          <div className="flex items-center justify-center gap-2 overflow-x-auto pb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center min-w-[80px]">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all ${
                      currentStep > step.id
                        ? 'bg-green-500 text-white'
                        : currentStep === step.id
                        ? 'bg-blue-500 text-white ring-4 ring-blue-500/30'
                        : 'bg-gray-800 text-gray-400'
                    }`}
                  >
                    {currentStep > step.id ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <p className={`text-xs font-medium ${currentStep >= step.id ? 'text-white' : 'text-gray-500'}`}>
                      {step.title}
                    </p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 md:w-16 h-0.5 mx-1 ${currentStep > step.id ? 'bg-green-500' : 'bg-gray-800'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {/* Step 1: Resume Upload */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Upload Your Resume</h1>
                <p className="text-gray-400">
                  Our AI will analyze your complete resume to extract skills and experience
                </p>
              </div>
              <ResumeUpload onUpload={handleResumeUpload} isLoading={isLoading} />
            </motion.div>
          )}

          {/* Step 2: Skill Proficiency Rating */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Rate Your Skills</h1>
                <p className="text-gray-400">
                  Help us understand your proficiency level in each skill
                </p>
              </div>
              
              <SkillProficiency skills={skills} onSkillsRated={handleSkillsRated} />
              
              <div className="flex justify-between mt-8">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button onClick={handleProceedToRoles} disabled={!canProceed() || isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Loading Roles...
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Role Selection */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Choose Your Target Role</h1>
                <p className="text-gray-400">
                  Based on your skills, here are the best matching roles
                </p>
              </div>
              
              <RoleMatch
                roles={roles}
                onSelectRole={handleRoleSelect}
                selectedRoleId={selectedRoleData?.id}
              />

              {/* Show subjects for selected role */}
              {selectedRoleData && selectedRoleData.missingSkills && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30"
                >
                  <h4 className="text-white font-medium mb-2">Subjects you'll master for {selectedRoleData.title}:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedRoleData.missingSkills.map((skill) => (
                      <span key={skill} className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}
              
              <div className="flex justify-between mt-8">
                <Button variant="outline" onClick={() => setCurrentStep(2)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button onClick={handleProceedToTimeline} disabled={!canProceed()}>
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Time Constraint */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Set Your Timeline</h1>
                <p className="text-gray-400">
                  How much time do you have for interview preparation?
                </p>
              </div>
              
              <TimeConstraint
                onTimeSelected={handleTimeSelected}
                selectedConstraint={timeConstraint || undefined}
              />
              
              <div className="flex justify-between mt-8">
                <Button variant="outline" onClick={() => setCurrentStep(3)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button onClick={handleGenerateRoadmap} disabled={!canProceed()}>
                  Generate My Roadmap
                  <Sparkles className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 5: Generating Roadmap */}
          {currentStep === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-20 h-20 mx-auto mb-8"
              >
                <Sparkles className="w-20 h-20 text-blue-500" />
              </motion.div>
              
              <h1 className="text-3xl font-bold text-white mb-4">
                Creating Your Personalized Roadmap
              </h1>
              
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                Our AI is analyzing your skills, target role, and timeline to create 
                a comprehensive learning plan with all the subjects you need to master.
              </p>
              
              <div className="space-y-3 text-left max-w-sm mx-auto">
                {[
                  'Analyzing skill gaps...',
                  'Identifying required subjects...',
                  'Creating daily study plan...',
                  'Finding best resources...',
                  'Generating your roadmap...',
                ].map((text, index) => (
                  <motion.div
                    key={text}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.5 }}
                    className="flex items-center gap-3"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ delay: index * 0.5, duration: 0.5 }}
                    >
                      {generatingRoadmap && index <= Math.floor(Date.now() / 500) % 5 ? (
                        <Check className="w-5 h-5 text-green-500" />
                      ) : (
                        <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                      )}
                    </motion.div>
                    <span className="text-gray-300">{text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
