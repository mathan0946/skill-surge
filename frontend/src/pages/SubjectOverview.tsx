import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Clock,
  Calendar,
  Target,
  CheckCircle,
  ChevronRight,
  Sun,
  Coffee,
  Moon,
  Brain,
  Code,
  Users,
  Layers,
  Zap,
  TrendingUp,
  Award,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { roadmapApi } from '../services/api';

interface Subject {
  id: string;
  name: string;
  weeks: number;
  priority: 'high' | 'medium' | 'low';
  description: string;
  estimatedHours: number;
  topics: string[];
  progress?: number;
}

interface DailySchedule {
  morning?: string;
  afternoon?: string;
  evening?: string;
}

interface Milestone {
  week: number;
  goal: string;
  completed?: boolean;
}

interface RoadmapOverview {
  totalWeeks: number;
  hoursPerDay: number;
  totalHours: number;
  subjects: Subject[];
  dailySchedule: DailySchedule;
  milestones: Milestone[];
}

interface Roadmap {
  overview?: RoadmapOverview;
  weeks?: any[];
  targetRole?: string;
  timeConstraint?: {
    weeks: number;
    hoursPerDay: number;
    intensity: string;
  };
}

const getSubjectIcon = (subjectId: string) => {
  const icons: { [key: string]: any } = {
    dsa: Code,
    'data-structures': Code,
    algorithms: Brain,
    'system-design': Layers,
    behavioral: Users,
    frontend: Zap,
    backend: Target,
    database: BookOpen,
  };
  
  return icons[subjectId.toLowerCase()] || BookOpen;
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'medium':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'low':
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    default:
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
};

export default function SubjectOverview() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchRoadmap();
    }
  }, [user?.id]);

  const fetchRoadmap = async () => {
    try {
      const data = await roadmapApi.get(user!.id);
      setRoadmap(data);
    } catch (error) {
      console.error('Failed to fetch roadmap:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSubjectProgress = (subjectId: string) => {
    if (!roadmap?.weeks) return 0;
    
    const subjectWeeks = roadmap.weeks.filter((w: any) => w.subjectId === subjectId);
    if (subjectWeeks.length === 0) return 0;
    
    let completed = 0;
    let total = 0;
    
    subjectWeeks.forEach((week: any) => {
      week.tasks?.forEach((task: any) => {
        total++;
        if (task.completed) completed++;
      });
    });
    
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const getOverallProgress = () => {
    if (!roadmap?.weeks) return 0;
    
    let completed = 0;
    let total = 0;
    
    roadmap.weeks.forEach((week: any) => {
      week.tasks?.forEach((task: any) => {
        total++;
        if (task.completed) completed++;
      });
    });
    
    return total > 0 ? Math.round((completed / total) * 100) : 0;
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

  if (!roadmap || !roadmap.overview) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">No Roadmap Found</h2>
          <p className="text-gray-400 mb-6">
            Generate a roadmap first to see your learning overview.
          </p>
          <button
            onClick={() => navigate('/onboarding')}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-colors"
          >
            Create Your Roadmap
          </button>
        </div>
      </div>
    );
  }

  const { overview } = roadmap;
  const overallProgress = getOverallProgress();

  return (
    <div className="min-h-screen bg-gray-950 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            Your Learning Journey
          </h1>
          <p className="text-gray-400">
            {roadmap.targetRole} preparation • {overview.totalWeeks} weeks • {overview.hoursPerDay} hrs/day
          </p>
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
                <Calendar className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-gray-400 text-sm">Duration</span>
            </div>
            <p className="text-2xl font-bold text-white">{overview.totalWeeks} weeks</p>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-800">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Clock className="w-5 h-5 text-purple-400" />
              </div>
              <span className="text-gray-400 text-sm">Total Hours</span>
            </div>
            <p className="text-2xl font-bold text-white">{overview.totalHours}h</p>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-800">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-green-500/20">
                <BookOpen className="w-5 h-5 text-green-400" />
              </div>
              <span className="text-gray-400 text-sm">Subjects</span>
            </div>
            <p className="text-2xl font-bold text-white">{overview.subjects.length}</p>
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

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - Subjects */}
          <div className="lg:col-span-2 space-y-6">
            {/* Daily Schedule Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/20"
            >
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-400" />
                Your Daily Schedule
              </h2>
              <div className="grid md:grid-cols-3 gap-4">
                {overview.dailySchedule.morning && (
                  <div className="bg-gray-900/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-yellow-400 mb-2">
                      <Sun className="w-4 h-4" />
                      <span className="text-sm font-medium">Morning</span>
                    </div>
                    <p className="text-white text-sm">{overview.dailySchedule.morning}</p>
                  </div>
                )}
                {overview.dailySchedule.afternoon && (
                  <div className="bg-gray-900/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-orange-400 mb-2">
                      <Coffee className="w-4 h-4" />
                      <span className="text-sm font-medium">Afternoon</span>
                    </div>
                    <p className="text-white text-sm">{overview.dailySchedule.afternoon}</p>
                  </div>
                )}
                {overview.dailySchedule.evening && (
                  <div className="bg-gray-900/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-indigo-400 mb-2">
                      <Moon className="w-4 h-4" />
                      <span className="text-sm font-medium">Evening</span>
                    </div>
                    <p className="text-white text-sm">{overview.dailySchedule.evening}</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Subjects Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-green-400" />
                Learning Subjects
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {overview.subjects.map((subject, index) => {
                  const Icon = getSubjectIcon(subject.id);
                  const progress = calculateSubjectProgress(subject.id);
                  
                  return (
                    <motion.div
                      key={subject.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      whileHover={{ scale: 1.02 }}
                      className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-5 border border-gray-800 cursor-pointer hover:border-blue-500/50 transition-all"
                      onClick={() => navigate(`/roadmap?subject=${subject.id}`)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-blue-500/20">
                            <Icon className="w-5 h-5 text-blue-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-white">{subject.name}</h3>
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${getPriorityColor(subject.priority)}`}>
                              {subject.priority} priority
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-500" />
                      </div>
                      
                      <p className="text-gray-400 text-sm mb-3">{subject.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {subject.weeks} weeks
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {subject.estimatedHours}h
                        </span>
                      </div>
                      
                      {/* Topics */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {subject.topics.slice(0, 4).map((topic, i) => (
                          <span key={i} className="text-xs px-2 py-1 bg-gray-800 text-gray-400 rounded-lg">
                            {topic}
                          </span>
                        ))}
                        {subject.topics.length > 4 && (
                          <span className="text-xs px-2 py-1 bg-gray-800 text-gray-500 rounded-lg">
                            +{subject.topics.length - 4} more
                          </span>
                        )}
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="mt-auto">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-500">Progress</span>
                          <span className="text-blue-400">{progress}%</span>
                        </div>
                        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5, delay: 0.2 * index }}
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                          />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Overall Progress */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Overall Progress</h3>
              <div className="relative w-32 h-32 mx-auto mb-4">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-gray-800"
                  />
                  <motion.circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="url(#progressGradient)"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    initial={{ strokeDasharray: '0 352' }}
                    animate={{ strokeDasharray: `${(overallProgress / 100) * 352} 352` }}
                    transition={{ duration: 1 }}
                  />
                  <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="100%" stopColor="#8B5CF6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">{overallProgress}%</span>
                </div>
              </div>
              <p className="text-center text-gray-400 text-sm">
                Keep going! You're making great progress.
              </p>
            </motion.div>

            {/* Milestones */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800"
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-400" />
                Milestones
              </h3>
              <div className="space-y-4">
                {overview.milestones.map((milestone, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-3 ${
                      milestone.completed ? 'opacity-60' : ''
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        milestone.completed
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-gray-800 text-gray-500'
                      }`}
                    >
                      {milestone.completed ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <span className="text-xs font-medium">W{milestone.week}</span>
                      )}
                    </div>
                    <div>
                      <p className={`text-sm ${milestone.completed ? 'text-gray-500 line-through' : 'text-white'}`}>
                        {milestone.goal}
                      </p>
                      <p className="text-xs text-gray-600">Week {milestone.week}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/roadmap')}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-colors flex items-center justify-center gap-2"
                >
                  <Target className="w-4 h-4" />
                  View Full Roadmap
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full px-4 py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  Today's Tasks
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
