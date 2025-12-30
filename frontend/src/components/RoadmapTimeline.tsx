import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Progress } from './ui/Progress';
import { Check, Clock, BookOpen, Code, Video, Briefcase, ExternalLink, Sparkles, Youtube, Play } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  type: 'problem' | 'course' | 'project' | 'interview';
  duration: string;
  reason: string;
  completed?: boolean;
  link?: string;
  provider?: string;
  isBonus?: boolean;
  youtubeAlternative?: {
    title: string;
    link: string;
  };
}

interface Week {
  id: string;
  number: number;
  title: string;
  description: string;
  focus: string;
  tasks: Task[];
  completed?: boolean;
}

interface RoadmapTimelineProps {
  weeks: Week[];
  currentWeek: number;
  onTaskComplete?: (weekId: string, taskId: string, completed: boolean) => void;
  overallProgress?: { completed: number; total: number; percentage: number };
}

const taskIcons: Record<string, React.ReactNode> = {
  problem: <Code className="w-4 h-4" />,
  course: <BookOpen className="w-4 h-4" />,
  project: <Briefcase className="w-4 h-4" />,
  interview: <Video className="w-4 h-4" />,
};

const taskColors: Record<string, string> = {
  problem: 'text-blue-400 bg-blue-400/10',
  course: 'text-green-400 bg-green-400/10',
  project: 'text-purple-400 bg-purple-400/10',
  interview: 'text-orange-400 bg-orange-400/10',
};

const providerColors: Record<string, string> = {
  'Udemy': 'bg-purple-500/20 text-purple-400',
  'LeetCode': 'bg-yellow-500/20 text-yellow-400',
  'YouTube': 'bg-red-500/20 text-red-400',
  'Coursera': 'bg-blue-500/20 text-blue-400',
  'freeCodeCamp': 'bg-green-500/20 text-green-400',
};

export function RoadmapTimeline({ weeks, currentWeek, onTaskComplete, overallProgress }: RoadmapTimelineProps) {
  const completedWeeks = weeks.filter(w => w.completed).length;
  const progress = overallProgress?.percentage ?? (completedWeeks / weeks.length) * 100;

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Your Learning Journey</h3>
              <p className="text-sm text-gray-400">
                Week {currentWeek} of {weeks.length}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-500">{Math.round(progress)}%</p>
              <p className="text-xs text-gray-400">Complete</p>
            </div>
          </div>
          <Progress value={progress} className="h-3" />
        </CardContent>
      </Card>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-800" />

        {weeks.map((week, index) => {
          const isActive = week.number === currentWeek;
          const isPast = week.number < currentWeek;
          const completedTasks = week.tasks.filter(t => t.completed).length;

          return (
            <motion.div
              key={week.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative pl-16 pb-8"
            >
              {/* Timeline Node */}
              <div
                className={`absolute left-4 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  isPast || week.completed
                    ? 'bg-green-500 border-green-500'
                    : isActive
                    ? 'bg-blue-500 border-blue-500 animate-pulse'
                    : 'bg-gray-900 border-gray-700'
                }`}
              >
                {(isPast || week.completed) && <Check className="w-3 h-3 text-white" />}
              </div>

              <Card className={isActive ? 'border-blue-500/50 shadow-lg shadow-blue-500/10' : ''}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-blue-400 font-medium mb-1">WEEK {week.number}</p>
                      <CardTitle className="text-lg">{week.title}</CardTitle>
                      <p className="text-sm text-gray-400 mt-1">{week.description}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-800 text-gray-400">
                        {week.focus}
                      </span>
                      <p className="text-xs text-gray-500 mt-2">
                        {completedTasks}/{week.tasks.length} tasks
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {week.tasks.map((task) => (
                      <div
                        key={task.id}
                        className={`p-3 rounded-lg border transition-all ${
                          task.completed
                            ? 'bg-green-500/10 border-green-500/30'
                            : task.isBonus
                            ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30'
                            : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-lg ${
                              task.completed 
                                ? 'bg-green-500/20 text-green-400' 
                                : task.isBonus
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : taskColors[task.type]
                            }`}
                          >
                            {task.completed ? <Check className="w-4 h-4" /> : task.isBonus ? <Sparkles className="w-4 h-4" /> : taskIcons[task.type]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className={`font-medium ${task.completed ? 'text-gray-400 line-through' : 'text-white'}`}>
                                {task.title}
                              </p>
                              {task.isBonus && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400 font-medium">
                                  BONUS
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">{task.reason}</p>
                            
                            {/* Links Section */}
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              {task.provider && (
                                <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                                  providerColors[task.provider] || 'bg-gray-500/20 text-gray-400'
                                }`}>
                                  {task.provider}
                                </span>
                              )}
                              
                              {task.link && (
                                <a
                                  href={task.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                                >
                                  <Play className="w-3 h-3" />
                                  Start Learning
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              )}
                              
                              {task.youtubeAlternative && (
                                <a
                                  href={task.youtubeAlternative.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                                >
                                  <Youtube className="w-3 h-3" />
                                  Free Alternative
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end gap-2 flex-shrink-0">
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              {task.duration}
                            </div>
                            
                            {/* Mark Complete Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onTaskComplete?.(week.id, task.id, !task.completed);
                              }}
                              className={`text-[10px] px-2 py-1 rounded transition-all ${
                                task.completed
                                  ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                                  : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                              }`}
                            >
                              {task.completed ? 'Undo' : 'Mark Done'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
