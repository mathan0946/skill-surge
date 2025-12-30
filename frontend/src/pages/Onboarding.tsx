import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ResumeUpload } from '../components/ResumeUpload';
import { SkillGraph } from '../components/SkillGraph';
import { RoleMatch } from '../components/RoleMatch';
import { Button } from '../components/ui/Button';
import { useApp } from '../context/AppContext';
import { profileApi, rolesApi } from '../services/api';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';

const steps = [
  { id: 1, title: 'Upload Resume', description: 'Let AI analyze your skills' },
  { id: 2, title: 'Review Skills', description: 'Verify your skill graph' },
  { id: 3, title: 'Select Role', description: 'Choose your target role' },
];

export function Onboarding() {
  const navigate = useNavigate();
  const { setProfile, setSelectedRole } = useApp();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [skills, setSkills] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);

  const handleResumeUpload = async (text: string) => {
    setIsLoading(true);
    try {
      const response = await profileApi.analyzeText(text);
      const profileData = response.data?.profile || response.profile || response.data || response;
      const skillData = response.data?.data || response.data || profileData;
      
      // Build skill graph from response
      const skillGraph = skillData.skills || skillData.skillGraph || [];
      
      setSkills(skillGraph);
      setProfile({
        id: profileData.id || 'demo-profile',
        skills: skillGraph,
        skillGraph: skillGraph,  // Store for the visual graph
        experience: skillData.experience || profileData.experience || [],
        education: skillData.education || profileData.education || [],
        summary: skillData.summary || profileData.summary || '',
        strongestSkills: skillData.strongestSkills || profileData.strongestSkills || [],
        skillGaps: skillData.skillGaps || profileData.skillGaps || [],
      });
      
      // Get role recommendations
      const skillNames = skillGraph.map((s: any) => typeof s === 'string' ? s : s.name);
      const rolesResponse = await rolesApi.getRecommendations(skillNames);
      setRoles(rolesResponse.roles || rolesResponse.data?.roles || rolesResponse || []);
      
      setCurrentStep(2);
    } catch (error) {
      console.error('Error processing resume:', error);
      // Use mock data on error
      const mockSkills = [
        { id: '1', name: 'JavaScript', level: 85, category: 'Languages', connections: ['2', '3'] },
        { id: '2', name: 'TypeScript', level: 80, category: 'Languages', connections: ['1'] },
        { id: '3', name: 'React', level: 82, category: 'Frontend', connections: ['1', '4'] },
        { id: '4', name: 'Node.js', level: 75, category: 'Backend', connections: ['3', '5'] },
        { id: '5', name: 'PostgreSQL', level: 70, category: 'Database', connections: ['4'] },
        { id: '6', name: 'Python', level: 65, category: 'Languages', connections: ['7'] },
        { id: '7', name: 'FastAPI', level: 60, category: 'Backend', connections: ['6'] },
        { id: '8', name: 'Docker', level: 55, category: 'DevOps', connections: ['4'] },
      ];
      
      const mockRoles = [
        {
          id: '1',
          title: 'Senior Frontend Engineer',
          matchPercentage: 78,
          requiredSkills: ['JavaScript', 'React', 'TypeScript'],
          missingSkills: ['System Design', 'Testing', 'Performance'],
          salary: '$150K - $200K',
        },
        {
          id: '2',
          title: 'Full Stack Developer',
          matchPercentage: 72,
          requiredSkills: ['JavaScript', 'React', 'Node.js', 'PostgreSQL'],
          missingSkills: ['AWS', 'Microservices'],
          salary: '$130K - $180K',
        },
        {
          id: '3',
          title: 'Software Engineer',
          matchPercentage: 68,
          requiredSkills: ['JavaScript', 'Python', 'PostgreSQL'],
          missingSkills: ['System Design', 'Distributed Systems', 'Algorithms'],
          salary: '$140K - $190K',
        },
      ];
      
      setSkills(mockSkills);
      setRoles(mockRoles);
      setProfile({
        id: 'demo-profile',
        skills: mockSkills,
        skillGraph: mockSkills,  // Store for the visual graph
        experience: ['Tech Corp - Senior Engineer - 3 years'],
        education: ['BS Computer Science'],
        summary: 'Experienced software engineer',
        strongestSkills: ['JavaScript', 'React', 'TypeScript'],
        skillGaps: ['System Design', 'Testing'],
      });
      setCurrentStep(2);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleSelect = (role: any) => {
    setSelectedRoleId(role.id);
    setSelectedRole(role);
  };

  const handleComplete = () => {
    navigate('/roadmap');
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors ${
                      currentStep > step.id
                        ? 'bg-green-500 text-white'
                        : currentStep === step.id
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-800 text-gray-400'
                    }`}
                  >
                    {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
                  </div>
                  <div className="mt-2 text-center">
                    <p className={`text-sm font-medium ${currentStep >= step.id ? 'text-white' : 'text-gray-500'}`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-20 h-0.5 mx-4 ${currentStep > step.id ? 'bg-green-500' : 'bg-gray-800'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Upload Your Resume</h1>
                <p className="text-gray-400">Our AI will analyze your skills and experience</p>
              </div>
              <ResumeUpload onUpload={handleResumeUpload} isLoading={isLoading} />
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Your Skill Graph</h1>
                <p className="text-gray-400">Review the skills we extracted from your resume</p>
              </div>
              
              <SkillGraph skills={skills} />
              
              <div className="flex justify-between mt-8">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button onClick={() => setCurrentStep(3)}>
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Choose Your Target Role</h1>
                <p className="text-gray-400">We'll create a personalized roadmap for your chosen role</p>
              </div>
              
              <RoleMatch
                roles={roles}
                onSelectRole={handleRoleSelect}
                selectedRoleId={selectedRoleId || undefined}
              />
              
              <div className="flex justify-between mt-8">
                <Button variant="outline" onClick={() => setCurrentStep(2)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button onClick={handleComplete} disabled={!selectedRoleId}>
                  Generate Roadmap
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
