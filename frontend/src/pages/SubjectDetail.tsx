import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
  BookOpen,
  Clock,
  Target,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Play,
  Code,
  FileText,
  Brain,
  Server,
  Users,
  Zap,
  ArrowLeft,
} from 'lucide-react';
import { DEMO_SUBJECTS } from '../data/mockDemoData';
import type { Subject, Week } from '../data/mockDemoData';

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

const getTaskIcon = (type: string) => {
  switch (type) {
    case 'problem':
      return Code;
    case 'video':
      return Play;
    case 'reading':
      return FileText;
    case 'project':
      return Target;
    default:
      return BookOpen;
  }
};

const getDifficultyColor = (difficulty?: string) => {
  switch (difficulty) {
    case 'easy':
      return 'text-green-400 bg-green-500/20 border-green-500/30';
    case 'medium':
      return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
    case 'hard':
      return 'text-red-400 bg-red-500/20 border-red-500/30';
    default:
      return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'problem':
      return 'text-orange-400 bg-orange-500/20';
    case 'video':
      return 'text-red-400 bg-red-500/20';
    case 'reading':
      return 'text-blue-400 bg-blue-500/20';
    case 'project':
      return 'text-purple-400 bg-purple-500/20';
    default:
      return 'text-gray-400 bg-gray-500/20';
  }
};

export default function SubjectDetail() {
  const navigate = useNavigate();
  const { subjectId } = useParams<{ subjectId: string }>();
  
  const [subject, setSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(new Set());
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Simulate loading and use mock data
    const timer = setTimeout(() => {
      const foundSubject = DEMO_SUBJECTS.find(s => s.id === subjectId);
      if (foundSubject) {
        setSubject(foundSubject);
        // Expand first week by default
        if (foundSubject.weeks.length > 0) {
          setExpandedWeeks(new Set([foundSubject.weeks[0].id]));
        }
        // Load some completed tasks for demo
        const initialCompleted = new Set<string>();
        foundSubject.weeks.forEach((week, wIndex) => {
          if (wIndex === 0) {
            // Mark first 2 tasks as completed for demo
            week.tasks.slice(0, 2).forEach(t => initialCompleted.add(t.id));
          }
        });
        setCompletedTasks(initialCompleted);
      }
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [subjectId]);

  const toggleWeek = (weekId: string) => {
    setExpandedWeeks(prev => {
      const next = new Set(prev);
      if (next.has(weekId)) {
        next.delete(weekId);
      } else {
        next.add(weekId);
      }
      return next;
    });
  };

  const toggleTask = (taskId: string) => {
    setCompletedTasks(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  const getWeekProgress = (week: Week) => {
    const completed = week.tasks.filter(t => completedTasks.has(t.id)).length;
    return {
      completed,
      total: week.tasks.length,
      percentage: week.tasks.length > 0 ? Math.round((completed / week.tasks.length) * 100) : 0
    };
  };

  const getOverallProgress = () => {
    if (!subject) return { completed: 0, total: 0, percentage: 0 };
    let completed = 0;
    let total = 0;
    subject.weeks.forEach(week => {
      week.tasks.forEach(task => {
        total++;
        if (completedTasks.has(task.id)) completed++;
      });
    });
    return {
      completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0
    };
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

  if (!subject) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Subject Not Found</h1>
          <p className="text-gray-400 mb-4">The requested subject doesn't exist.</p>
          <button
            onClick={() => navigate('/subjects')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Subjects
          </button>
        </div>
      </div>
    );
  }

  const Icon = getSubjectIcon(subject.icon);
  const progress = getOverallProgress();

  return (
    <div className="min-h-screen bg-gray-950 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/subjects')}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Subjects
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-gradient-to-r ${getGradientClass(subject.color)} p-1 rounded-2xl mb-8`}
        >
          <div className="bg-gray-900 rounded-xl p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-xl bg-gradient-to-br ${getGradientClass(subject.color)} shadow-lg`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">{subject.name}</h1>
                  <p className="text-gray-400">{subject.description}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{subject.totalWeeks}</p>
                  <p className="text-xs text-gray-400">Weeks</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{progress.total}</p>
                  <p className="text-xs text-gray-400">Tasks</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-400">{progress.percentage}%</p>
                  <p className="text-xs text-gray-400">Complete</p>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Overall Progress</span>
                <span className="text-white font-medium">{progress.completed}/{progress.total} tasks</span>
              </div>
              <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress.percentage}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className={`h-full bg-gradient-to-r ${getGradientClass(subject.color)} rounded-full`}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Weeks Accordion */}
        <div className="space-y-4">
          {subject.weeks.map((week, index) => {
            const weekProgress = getWeekProgress(week);
            const isExpanded = expandedWeeks.has(week.id);
            
            return (
              <motion.div
                key={week.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-900/60 backdrop-blur-sm rounded-2xl border border-gray-800 overflow-hidden"
              >
                {/* Week Header */}
                <button
                  onClick={() => toggleWeek(week.id)}
                  className="w-full p-5 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                      weekProgress.percentage === 100 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                        : weekProgress.percentage > 0
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'bg-gray-800 text-gray-400 border border-gray-700'
                    }`}>
                      {weekProgress.percentage === 100 ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        `W${week.number}`
                      )}
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-semibold text-white">{week.title}</h3>
                      <p className="text-sm text-gray-400">{week.focus}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden md:block">
                      <p className="text-sm text-gray-400">
                        {weekProgress.completed}/{weekProgress.total} tasks
                      </p>
                      <div className="w-24 h-1.5 bg-gray-800 rounded-full mt-1">
                        <div 
                          className={`h-full bg-gradient-to-r ${getGradientClass(subject.color)} rounded-full transition-all`}
                          style={{ width: `${weekProgress.percentage}%` }}
                        />
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Week Content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 border-t border-gray-800 pt-4">
                        {/* Tasks List */}
                        <div className="space-y-3">
                          {week.tasks.map((task, taskIndex) => {
                            const TaskIcon = getTaskIcon(task.type);
                            const isCompleted = completedTasks.has(task.id);
                            
                            return (
                              <motion.div
                                key={task.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: taskIndex * 0.05 }}
                                className={`p-4 rounded-xl border transition-all ${
                                  isCompleted 
                                    ? 'bg-green-500/10 border-green-500/30' 
                                    : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  {/* Checkbox */}
                                  <button
                                    onClick={() => toggleTask(task.id)}
                                    className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                      isCompleted 
                                        ? 'bg-green-500 border-green-500' 
                                        : 'border-gray-500 hover:border-blue-400'
                                    }`}
                                  >
                                    {isCompleted && <CheckCircle className="w-3 h-3 text-white" />}
                                  </button>

                                  {/* Task Content */}
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className={`p-1.5 rounded-lg ${getTypeColor(task.type)}`}>
                                        <TaskIcon className="w-3.5 h-3.5" />
                                      </span>
                                      <span className={`text-sm font-medium ${isCompleted ? 'line-through text-gray-500' : 'text-white'}`}>
                                        {task.title}
                                      </span>
                                      {task.difficulty && (
                                        <span className={`text-xs px-2 py-0.5 rounded-full border ${getDifficultyColor(task.difficulty)}`}>
                                          {task.difficulty}
                                        </span>
                                      )}
                                    </div>
                                    
                                    <p className={`text-xs ${isCompleted ? 'text-gray-600' : 'text-gray-500'}`}>
                                      {task.reason}
                                    </p>

                                    {/* Task Meta */}
                                    <div className="flex items-center gap-4 mt-2">
                                      <span className="text-xs text-gray-500 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {task.duration}
                                      </span>
                                      {task.platform && (
                                        <span className="text-xs text-gray-500">
                                          {task.platform}
                                        </span>
                                      )}
                                      {task.link && (
                                        <a
                                          href={task.link}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <ExternalLink className="w-3 h-3" />
                                          Open
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex gap-4"
        >
          <button
            onClick={() => navigate('/subjects')}
            className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Subjects
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className={`flex-1 py-3 bg-gradient-to-r ${getGradientClass(subject.color)} text-white rounded-xl transition-opacity hover:opacity-90 flex items-center justify-center gap-2`}
          >
            <Zap className="w-4 h-4" />
            Practice Now
          </button>
        </motion.div>
      </div>
    </div>
  );
}
