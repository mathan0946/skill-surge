import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { DEMO_PROFILE, DEMO_ROLES } from '../data/mockDemoData';
import { 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Upload, 
  Star, 
  Target, 
  Clock, 
  Sparkles, 
  Loader2,
  FileText,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

const steps = [
  { id: 1, title: 'Upload Resume', description: 'Let AI analyze your skills', icon: Upload },
  { id: 2, title: 'Your Skills', description: 'Extracted from resume', icon: Star },
  { id: 3, title: 'Select Role', description: 'Choose your target role', icon: Target },
  { id: 4, title: 'Timeline', description: 'Set your preparation time', icon: Clock },
  { id: 5, title: 'Generate Plan', description: 'Create your roadmap', icon: Sparkles },
];

interface Skill {
  id: string;
  name: string;
  level: number;
  category: string;
}

interface Role {
  id: string;
  title: string;
  matchPercentage: number;
  requiredSkills: string[];
  missingSkills: string[];
  salary?: string;
}

export function Onboarding() {
  const navigate = useNavigate();
  useAuth(); // For auth context
  const { setProfile, setSelectedRole } = useApp();
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedRoleData, setSelectedRoleData] = useState<Role | null>(null);
  const [selectedWeeks, setSelectedWeeks] = useState(12);
  const [hoursPerDay, setHoursPerDay] = useState(3);
  const [generatingProgress, setGeneratingProgress] = useState(0);

  // Simulate resume processing with demo data
  const handleResumeUpload = () => {
    setIsProcessing(true);
    
    // Simulate AI processing delay
    setTimeout(() => {
      // Extract skills from DEMO_PROFILE
      const extractedSkills: Skill[] = DEMO_PROFILE.skills.map(s => ({
        id: s.id,
        name: s.name,
        level: s.level,
        category: s.category,
      }));
      
      setSkills(extractedSkills);
      setProfile(DEMO_PROFILE as any);
      setIsProcessing(false);
      setCurrentStep(2);
    }, 2000);
  };

  const handleRoleSelect = (role: Role) => {
    setSelectedRoleData(role);
    setSelectedRole(role as any);
  };

  const handleGenerateRoadmap = () => {
    setCurrentStep(5);
    
    // Animate progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      setGeneratingProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          navigate('/subjects');
        }, 500);
      }
    }, 600);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Languages': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'AI/ML': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'Frontend': 'bg-green-500/20 text-green-400 border-green-500/30',
      'Backend': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      'Database': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'Tools': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    };
    return colors[category] || colors['Tools'];
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
              className="max-w-2xl mx-auto"
            >
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Upload Your Resume</h1>
                <p className="text-gray-400">
                  Our AI will analyze your skills, experience, and projects
                </p>
              </div>

              <div className="bg-gray-900/60 backdrop-blur-sm rounded-2xl border border-gray-800 p-8">
                {!isProcessing ? (
                  <div 
                    onClick={handleResumeUpload}
                    className="border-2 border-dashed border-gray-700 rounded-xl p-12 text-center cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/5 transition-all"
                  >
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Upload className="w-8 h-8 text-blue-400" />
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2">
                      Click to upload your resume
                    </h3>
                    <p className="text-gray-500 text-sm mb-4">
                      PDF, DOC, or TXT (Max 10MB)
                    </p>
                    <Button>
                      <FileText className="w-4 h-4 mr-2" />
                      Select Resume
                    </Button>
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                      className="w-16 h-16 mx-auto mb-6"
                    >
                      <Loader2 className="w-16 h-16 text-blue-500" />
                    </motion.div>
                    <h3 className="text-xl font-medium text-white mb-2">
                      Analyzing Your Resume...
                    </h3>
                    <p className="text-gray-400">
                      Extracting skills, experience, and achievements
                    </p>
                    <div className="mt-6 space-y-2 max-w-xs mx-auto">
                      {['Reading document...', 'Extracting skills...', 'Analyzing experience...'].map((text, i) => (
                        <motion.div
                          key={text}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.5 }}
                          className="flex items-center gap-2 text-sm text-gray-400"
                        >
                          <Check className="w-4 h-4 text-green-400" />
                          {text}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 2: Skills Display */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">
                  Your Skills Profile
                </h1>
                <p className="text-gray-400">
                  We found <span className="text-blue-400 font-semibold">{skills.length} skills</span> from your resume
                </p>
              </div>

              {/* Profile Summary Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 rounded-2xl p-6 border border-blue-500/20 mb-6"
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-2xl font-bold text-white">
                    {DEMO_PROFILE.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-white">{DEMO_PROFILE.name}</h2>
                    <p className="text-gray-400 text-sm mt-1">{DEMO_PROFILE.summary.slice(0, 150)}...</p>
                    <div className="flex gap-4 mt-3">
                      <span className="text-sm text-gray-400">
                        <span className="text-white font-medium">{DEMO_PROFILE.projects.length}</span> Projects
                      </span>
                      <span className="text-sm text-gray-400">
                        <span className="text-white font-medium">{DEMO_PROFILE.totalYearsExperience}</span> Years Exp
                      </span>
                      <span className="text-sm text-gray-400">
                        <span className="text-white font-medium">{DEMO_PROFILE.certifications.length}</span> Certifications
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Skills by Category */}
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                {['Languages', 'AI/ML', 'Frontend', 'Backend', 'Database'].map((category, catIndex) => {
                  const categorySkills = skills.filter(s => s.category === category);
                  if (categorySkills.length === 0) return null;
                  
                  return (
                    <motion.div
                      key={category}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: catIndex * 0.1 }}
                      className="bg-gray-900/60 rounded-xl p-4 border border-gray-800"
                    >
                      <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${getCategoryColor(category).split(' ')[0].replace('/20', '')}`} />
                        {category}
                      </h3>
                      <div className="space-y-2">
                        {categorySkills.map((skill, skillIndex) => (
                          <motion.div
                            key={skill.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: catIndex * 0.1 + skillIndex * 0.05 }}
                            className="flex items-center justify-between"
                          >
                            <span className="text-gray-300 text-sm">{skill.name}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${skill.level}%` }}
                                  transition={{ duration: 0.5, delay: catIndex * 0.1 + skillIndex * 0.05 }}
                                  className={`h-full rounded-full ${
                                    skill.level >= 80 ? 'bg-green-500' :
                                    skill.level >= 60 ? 'bg-blue-500' :
                                    skill.level >= 40 ? 'bg-yellow-500' : 'bg-orange-500'
                                  }`}
                                />
                              </div>
                              <span className="text-xs text-gray-500 w-8">{skill.level}%</span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Strongest Skills */}
              <div className="bg-gray-900/60 rounded-xl p-4 border border-gray-800 mb-8">
                <h3 className="text-white font-medium mb-3">🔥 Strongest Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {DEMO_PROFILE.strongestSkills.map((skill, i) => (
                    <span key={i} className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-sm border border-green-500/30">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button onClick={() => setCurrentStep(3)}>
                  Continue to Role Selection
                  <ArrowRight className="w-4 h-4 ml-2" />
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

              <div className="grid md:grid-cols-2 gap-4 mb-8">
                {DEMO_ROLES.map((role, index) => (
                  <motion.div
                    key={role.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleRoleSelect(role)}
                    className={`relative p-5 rounded-xl border cursor-pointer transition-all ${
                      selectedRoleData?.id === role.id
                        ? 'bg-blue-500/20 border-blue-500'
                        : 'bg-gray-900/60 border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    {/* Match Badge */}
                    <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium ${
                      role.matchPercentage >= 90 ? 'bg-green-500/20 text-green-400' :
                      role.matchPercentage >= 80 ? 'bg-blue-500/20 text-blue-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {role.matchPercentage}% Match
                    </div>

                    <h3 className="text-lg font-bold text-white mb-1">{role.title}</h3>
                    <p className="text-green-400 text-sm mb-3">{role.salary}</p>

                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-1.5">Your Skills:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {role.requiredSkills.slice(0, 4).map(skill => (
                          <span key={skill} className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs">
                            ✓ {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 mb-1.5">Skills to Learn:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {role.missingSkills.slice(0, 3).map(skill => (
                          <span key={skill} className="px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded text-xs">
                            + {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {selectedRoleData?.id === role.id && (
                      <div className="absolute top-4 left-4">
                        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(2)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button onClick={() => setCurrentStep(4)} disabled={!selectedRoleData}>
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Timeline */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-2xl mx-auto"
            >
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Set Your Timeline</h1>
                <p className="text-gray-400">
                  How much time can you dedicate to preparation?
                </p>
              </div>

              <div className="bg-gray-900/60 rounded-2xl p-6 border border-gray-800 mb-6">
                {/* Weeks Selection */}
                <div className="mb-8">
                  <label className="text-white font-medium mb-4 block">
                    Preparation Duration
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {[4, 8, 12, 16].map(weeks => (
                      <button
                        key={weeks}
                        onClick={() => setSelectedWeeks(weeks)}
                        className={`p-4 rounded-xl border transition-all ${
                          selectedWeeks === weeks
                            ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                            : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                        }`}
                      >
                        <div className="text-2xl font-bold">{weeks}</div>
                        <div className="text-xs">weeks</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hours Per Day */}
                <div>
                  <label className="text-white font-medium mb-4 block">
                    Hours per Day: <span className="text-blue-400">{hoursPerDay}h</span>
                  </label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setHoursPerDay(Math.max(1, hoursPerDay - 1))}
                      className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white"
                    >
                      <ChevronDown className="w-5 h-5" />
                    </button>
                    <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                        style={{ width: `${(hoursPerDay / 8) * 100}%` }}
                      />
                    </div>
                    <button
                      onClick={() => setHoursPerDay(Math.min(8, hoursPerDay + 1))}
                      className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white"
                    >
                      <ChevronUp className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/30 mb-8">
                <h4 className="text-white font-medium mb-2">Your Plan Summary</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-400">{selectedWeeks}</div>
                    <div className="text-xs text-gray-400">Weeks</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-400">{hoursPerDay}h</div>
                    <div className="text-xs text-gray-400">Daily</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-400">{selectedWeeks * 7 * hoursPerDay}</div>
                    <div className="text-xs text-gray-400">Total Hours</div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(3)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button onClick={handleGenerateRoadmap}>
                  Generate My Roadmap
                  <Sparkles className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 5: Generating */}
          {currentStep === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 max-w-md mx-auto"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-20 h-20 mx-auto mb-8"
              >
                <Sparkles className="w-20 h-20 text-blue-500" />
              </motion.div>

              <h1 className="text-3xl font-bold text-white mb-4">
                Creating Your Roadmap
              </h1>

              <p className="text-gray-400 mb-8">
                Building a personalized learning path for {selectedRoleData?.title}
              </p>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-gray-800 rounded-full mb-6 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${generatingProgress}%` }}
                />
              </div>

              <div className="space-y-3 text-left">
                {[
                  { text: 'Analyzing skill gaps...', done: generatingProgress >= 20 },
                  { text: 'Selecting core subjects...', done: generatingProgress >= 40 },
                  { text: 'Creating weekly roadmap...', done: generatingProgress >= 60 },
                  { text: 'Finding best resources...', done: generatingProgress >= 80 },
                  { text: 'Finalizing your plan...', done: generatingProgress >= 100 },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.2 }}
                    className="flex items-center gap-3"
                  >
                    {item.done ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : (
                      <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                    )}
                    <span className={item.done ? 'text-green-400' : 'text-gray-400'}>
                      {item.text}
                    </span>
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
