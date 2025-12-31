import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Calendar,
  Target,
  CheckCircle,
  ChevronRight,
  Brain,
  Code,
  Users,
  Server,
  Zap,
  TrendingUp,
  Award,
  Play,
  Flame,
} from 'lucide-react';
import { DEMO_SUBJECTS, DEMO_PROFILE } from '../data/mockDemoData';
import type { Subject } from '../data/mockDemoData';

const getSubjectIcon = (iconName: string) => {
  const icons: { [key: string]: any } = {
    Code: Code,
    Brain: Brain,
    Server: Server,
    Users: Users,
    BookOpen: BookOpen,
    Zap: Zap,
  };
  return icons[iconName] || BookOpen;
};

const getGradientClass = (color: string) => {
  return color || 'from-blue-500 to-cyan-500';
};

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case 'high':
      return { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', label: '🔥 High Priority' };
    case 'medium':
      return { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30', label: '⚡ Medium' };
    case 'low':
      return { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30', label: '🌱 Low' };
    default:
      return { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/30', label: 'Normal' };
  }
};

export default function SubjectOverview() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole] = useState("AI/ML Engineer");

  useEffect(() => {
    // Simulate loading and use mock data
    const timer = setTimeout(() => {
      setSubjects(DEMO_SUBJECTS);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const getTotalProgress = () => {
    let totalCompleted = 0;
    let totalTasks = 0;
    subjects.forEach(s => {
      totalCompleted += s.completedTasks;
      totalTasks += s.totalTasks;
    });
    return totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;
  };

  const getTotalWeeks = () => {
    return subjects.reduce((sum, s) => sum + s.totalWeeks, 0);
  };

  const getTotalTasks = () => {
    return subjects.reduce((sum, s) => sum + s.totalTasks, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const overallProgress = getTotalProgress();

  return (
    <div className="min-h-screen bg-gray-950 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                Your Learning Path
              </h1>
              <p className="text-gray-400">
                {selectedRole} • {getTotalWeeks()} weeks • {getTotalTasks()} tasks
              </p>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-800">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <BookOpen className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-gray-400 text-sm">Subjects</span>
            </div>
            <p className="text-2xl font-bold text-white">{subjects.length}</p>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-800">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Calendar className="w-5 h-5 text-purple-400" />
              </div>
              <span className="text-gray-400 text-sm">Duration</span>
            </div>
            <p className="text-2xl font-bold text-white">{getTotalWeeks()} weeks</p>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-800">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-green-500/20">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <span className="text-gray-400 text-sm">Tasks</span>
            </div>
            <p className="text-2xl font-bold text-white">{getTotalTasks()}</p>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-800">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-orange-500/20">
                <TrendingUp className="w-5 h-5 text-orange-400" />
              </div>
              <span className="text-gray-400 text-sm">Progress</span>
            </div>
            <p className="text-2xl font-bold text-white">{overallProgress}%</p>
          </div>
        </motion.div>

        {/* Profile Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/20 mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-white mb-1">
                Welcome, {DEMO_PROFILE.name.split(' ')[0]}! 👋
              </h2>
              <p className="text-gray-400 text-sm">
                {DEMO_PROFILE.summary.slice(0, 120)}...
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {DEMO_PROFILE.strongestSkills.slice(0, 4).map((skill, i) => (
                  <span key={i} className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded-lg">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{DEMO_PROFILE.skills.length}</p>
                <p className="text-xs text-gray-400">Skills</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{DEMO_PROFILE.projects.length}</p>
                <p className="text-xs text-gray-400">Projects</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{DEMO_PROFILE.totalYearsExperience}</p>
                <p className="text-xs text-gray-400">Years Exp</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Subjects Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-400" />
              Core Subjects
            </h2>
            <span className="text-sm text-gray-500">Click to view roadmap</span>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {subjects.map((subject, index) => {
              const Icon = getSubjectIcon(subject.icon);
              const priority = getPriorityBadge(subject.priority);
              const progress = subject.totalTasks > 0 
                ? Math.round((subject.completedTasks / subject.totalTasks) * 100) 
                : 0;
              
              return (
                <motion.div
                  key={subject.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  className="group bg-gray-900/60 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-800 cursor-pointer hover:border-blue-500/50 transition-all shadow-lg hover:shadow-blue-500/10"
                  onClick={() => navigate(`/subject/${subject.id}`)}
                >
                  {/* Gradient Header */}
                  <div className={`h-2 bg-gradient-to-r ${getGradientClass(subject.color)}`} />
                  
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${getGradientClass(subject.color)} shadow-lg`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                            {subject.name}
                          </h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${priority.bg} ${priority.text} ${priority.border}`}>
                            {priority.label}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                    </div>
                    
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{subject.description}</p>
                    
                    {/* Stats Row */}
                    <div className="flex items-center gap-6 text-sm text-gray-500 mb-4">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-purple-400" />
                        <span className="text-gray-300">{subject.totalWeeks}</span> weeks
                      </span>
                      <span className="flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-gray-300">{subject.completedTasks}/{subject.totalTasks}</span> tasks
                      </span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between text-xs mb-2">
                        <span className="text-gray-500">Progress</span>
                        <span className={`font-medium ${progress > 0 ? 'text-blue-400' : 'text-gray-500'}`}>
                          {progress}%
                        </span>
                      </div>
                      <div className="h-2.5 bg-gray-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.8, delay: 0.3 + index * 0.1 }}
                          className={`h-full bg-gradient-to-r ${getGradientClass(subject.color)} rounded-full`}
                        />
                      </div>
                    </div>

                    {/* Start Button */}
                    <button
                      className="mt-4 w-full py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl flex items-center justify-center gap-2 transition-colors group-hover:bg-blue-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/subject/${subject.id}`);
                      }}
                    >
                      <Play className="w-4 h-4" />
                      {progress > 0 ? 'Continue Learning' : 'Start Learning'}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid md:grid-cols-3 gap-4"
        >
          <button
            onClick={() => navigate('/dashboard')}
            className="p-4 bg-gray-900/50 border border-gray-800 rounded-xl hover:border-blue-500/50 transition-all flex items-center gap-3"
          >
            <div className="p-2 rounded-lg bg-blue-500/20">
              <Zap className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-left">
              <p className="text-white font-medium">Daily Practice</p>
              <p className="text-xs text-gray-500">Solve today's problem</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/interview')}
            className="p-4 bg-gray-900/50 border border-gray-800 rounded-xl hover:border-purple-500/50 transition-all flex items-center gap-3"
          >
            <div className="p-2 rounded-lg bg-purple-500/20">
              <Users className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-left">
              <p className="text-white font-medium">Mock Interview</p>
              <p className="text-xs text-gray-500">Practice with AI</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/roadmap')}
            className="p-4 bg-gray-900/50 border border-gray-800 rounded-xl hover:border-green-500/50 transition-all flex items-center gap-3"
          >
            <div className="p-2 rounded-lg bg-green-500/20">
              <Award className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-left">
              <p className="text-white font-medium">Full Roadmap</p>
              <p className="text-xs text-gray-500">View complete plan</p>
            </div>
          </button>
        </motion.div>
      </div>
    </div>
  );
}
