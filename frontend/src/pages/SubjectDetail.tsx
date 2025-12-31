import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  BookOpen,
  Clock,
  Calendar,
  Target,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Play,
  Youtube,
  Code,
  FileText,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { roadmapApi } from '../services/api';

interface Task {
  id: string;
  title: string;
  type: 'problem' | 'course' | 'reading' | 'practice';
  duration: string;
  reason: string;
  completed: boolean;
  link?: string;
  difficulty?: string;
  day?: number;
  platform?: string;
  youtubeAlternative?: {
    title: string;
    link: string;
    channel: string;
    duration: string;
  };
}

interface DailyPlan {
  focus: string;
  tasks: string[];
}

interface Week {
  id: string;
  number: number;
  title: string;
  description: string;
  focus: string;
  subjectId: string;
  estimatedHours: number;
  dailyPlan?: {
    day1?: DailyPlan;
    day2?: DailyPlan;
    day3?: DailyPlan;
    day4?: DailyPlan;
    day5?: DailyPlan;
    day6?: DailyPlan;
    day7?: DailyPlan;
  };
  tasks: Task[];
}

const getTaskIcon = (type: string) => {
  switch (type) {
    case 'problem':
      return Code;
    case 'course':
      return Play;
    case 'reading':
      return FileText;
    case 'practice':
      return Target;
    default:
      return BookOpen;
  }
};

const getDifficultyColor = (difficulty?: string) => {
  switch (difficulty?.toLowerCase()) {
    case 'easy':
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'medium':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'hard':
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    default:
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
};

export default function SubjectDetail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  
  const subjectId = searchParams.get('subject');
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [subjectName, setSubjectName] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState<number>(0);
  const [selectedDay, setSelectedDay] = useState<number>(1);

  useEffect(() => {
    if (user?.id && subjectId) {
      fetchSubjectDetails();
    }
  }, [user?.id, subjectId]);

  const fetchSubjectDetails = async () => {
    try {
      const roadmap = await roadmapApi.get(user!.id);
      
      // Filter weeks for this subject
      const subjectWeeks = (roadmap.weeks || []).filter(
        (w: Week) => w.subjectId === subjectId || w.focus?.toLowerCase().includes(subjectId?.toLowerCase() || '')
      );
      
      setWeeks(subjectWeeks);
      
      // Get subject name from overview
      const subject = roadmap.overview?.subjects?.find((s: any) => s.id === subjectId);
      setSubjectName(subject?.name || subjectId || 'Subject');
      
    } catch (error) {
      console.error('Failed to fetch subject details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskToggle = async (weekId: string, taskId: string, completed: boolean) => {
    try {
      await roadmapApi.updateTask(user!.id, taskId, !completed, weekId);
      
      // Update local state
      setWeeks(prev =>
        prev.map(week => {
          if (week.id === weekId) {
            return {
              ...week,
              tasks: week.tasks.map(task =>
                task.id === taskId ? { ...task, completed: !completed } : task
              ),
            };
          }
          return week;
        })
      );
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const calculateWeekProgress = (week: Week) => {
    const total = week.tasks.length;
    const completed = week.tasks.filter(t => t.completed).length;
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

  if (weeks.length === 0) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">No Content Found</h2>
          <p className="text-gray-400 mb-6">
            This subject doesn't have any weeks assigned yet.
          </p>
          <button
            onClick={() => navigate('/subject-overview')}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-colors"
          >
            Back to Overview
          </button>
        </div>
      </div>
    );
  }

  const currentWeek = weeks[selectedWeek];
  const currentDailyPlan = currentWeek?.dailyPlan?.[`day${selectedDay}` as keyof typeof currentWeek.dailyPlan];
  const dayTasks = currentWeek?.tasks.filter(t => t.day === selectedDay) || currentWeek?.tasks || [];

  return (
    <div className="min-h-screen bg-gray-950 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate('/subject-overview')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Overview
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{subjectName}</h1>
              <p className="text-gray-400">
                {weeks.length} weeks • {weeks.reduce((sum, w) => sum + (w.estimatedHours || 0), 0)} total hours
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Overall Progress</p>
                <p className="text-2xl font-bold text-blue-400">
                  {Math.round(weeks.reduce((sum, w) => sum + calculateWeekProgress(w), 0) / weeks.length)}%
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Week Navigator */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1 space-y-3"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Weeks</h3>
            {weeks.map((week, index) => {
              const progress = calculateWeekProgress(week);
              const isSelected = selectedWeek === index;
              
              return (
                <motion.button
                  key={week.id}
                  whileHover={{ x: 4 }}
                  onClick={() => {
                    setSelectedWeek(index);
                    setSelectedDay(1);
                  }}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-blue-600/20 border-blue-500/50'
                      : 'bg-gray-900/50 border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`font-medium ${isSelected ? 'text-blue-400' : 'text-white'}`}>
                      Week {week.number}
                    </span>
                    <span className={`text-sm ${progress === 100 ? 'text-green-400' : 'text-gray-500'}`}>
                      {progress}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 truncate">{week.title}</p>
                  <div className="mt-2 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        progress === 100 ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </motion.button>
              );
            })}
          </motion.div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Week Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">{currentWeek?.title}</h2>
                  <p className="text-gray-400 mt-1">{currentWeek?.description}</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  {currentWeek?.estimatedHours}h estimated
                </div>
              </div>

              {/* Day Selector */}
              {currentWeek?.dailyPlan && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-400 mb-3">Daily Plan</h3>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {[1, 2, 3, 4, 5, 6, 7].map(day => {
                      const dayPlan = currentWeek.dailyPlan?.[`day${day}` as keyof typeof currentWeek.dailyPlan];
                      const isSelected = selectedDay === day;
                      
                      return (
                        <button
                          key={day}
                          onClick={() => setSelectedDay(day)}
                          className={`flex-shrink-0 px-4 py-2 rounded-xl border transition-all ${
                            isSelected
                              ? 'bg-blue-600 border-blue-500 text-white'
                              : dayPlan
                              ? 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
                              : 'bg-gray-900 border-gray-800 text-gray-600'
                          }`}
                        >
                          Day {day}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Day Focus */}
              {currentDailyPlan && (
                <motion.div
                  key={`day-${selectedDay}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl border border-blue-500/20"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-blue-400" />
                    <span className="font-medium text-white">Day {selectedDay} Focus</span>
                  </div>
                  <p className="text-blue-300 font-medium">{currentDailyPlan.focus}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {currentDailyPlan.tasks.map((task, i) => (
                      <span key={i} className="text-xs px-3 py-1 bg-gray-800/50 text-gray-300 rounded-lg">
                        {task}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Tasks List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                Tasks {selectedDay && currentWeek?.dailyPlan ? `for Day ${selectedDay}` : ''}
              </h3>

              <AnimatePresence mode="popLayout">
                {dayTasks.map((task, index) => {
                  const Icon = getTaskIcon(task.type);
                  
                  return (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: 0.05 * index }}
                      className={`bg-gray-900/50 backdrop-blur-sm rounded-xl p-5 border transition-all ${
                        task.completed
                          ? 'border-green-500/30 bg-green-900/10'
                          : 'border-gray-800 hover:border-gray-700'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <button
                          onClick={() => handleTaskToggle(currentWeek.id, task.id, task.completed)}
                          className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                            task.completed
                              ? 'bg-green-500 border-green-500'
                              : 'border-gray-600 hover:border-blue-500'
                          }`}
                        >
                          {task.completed && <CheckCircle className="w-4 h-4 text-white" />}
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Icon className={`w-4 h-4 ${task.completed ? 'text-green-400' : 'text-blue-400'}`} />
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  task.type === 'problem'
                                    ? 'bg-purple-500/20 text-purple-400'
                                    : task.type === 'course'
                                    ? 'bg-blue-500/20 text-blue-400'
                                    : 'bg-gray-500/20 text-gray-400'
                                }`}>
                                  {task.type}
                                </span>
                                {task.difficulty && (
                                  <span className={`text-xs px-2 py-0.5 rounded-full border ${getDifficultyColor(task.difficulty)}`}>
                                    {task.difficulty}
                                  </span>
                                )}
                              </div>
                              <h4 className={`font-medium ${task.completed ? 'text-gray-500 line-through' : 'text-white'}`}>
                                {task.title}
                              </h4>
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Clock className="w-4 h-4" />
                              {task.duration}
                            </div>
                          </div>

                          <p className="text-sm text-gray-400 mt-2">{task.reason}</p>

                          {/* Links */}
                          <div className="flex flex-wrap items-center gap-3 mt-3">
                            {task.link && (
                              <a
                                href={task.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                              >
                                <ExternalLink className="w-4 h-4" />
                                {task.platform || 'Open Resource'}
                              </a>
                            )}
                            {task.youtubeAlternative && (
                              <a
                                href={task.youtubeAlternative.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300 transition-colors"
                              >
                                <Youtube className="w-4 h-4" />
                                Free: {task.youtubeAlternative.channel}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {dayTasks.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No tasks for this day</p>
                </div>
              )}
            </motion.div>

            {/* Week Navigation */}
            <div className="flex justify-between pt-4">
              <button
                onClick={() => {
                  if (selectedWeek > 0) {
                    setSelectedWeek(selectedWeek - 1);
                    setSelectedDay(1);
                  }
                }}
                disabled={selectedWeek === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
                  selectedWeek === 0
                    ? 'text-gray-600 cursor-not-allowed'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
                Previous Week
              </button>
              
              <button
                onClick={() => {
                  if (selectedWeek < weeks.length - 1) {
                    setSelectedWeek(selectedWeek + 1);
                    setSelectedDay(1);
                  }
                }}
                disabled={selectedWeek === weeks.length - 1}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
                  selectedWeek === weeks.length - 1
                    ? 'text-gray-600 cursor-not-allowed'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                Next Week
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
