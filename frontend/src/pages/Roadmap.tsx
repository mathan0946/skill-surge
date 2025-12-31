import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RoadmapTimeline } from '../components/RoadmapTimeline';
import { Card, CardContent } from '../components/ui/Card';
import { Progress } from '../components/ui/Progress';
import { useApp } from '../context/AppContext';
import { roadmapApi } from '../services/api';
import { Target, Loader2, Sparkles, TrendingUp, Calendar, Clock } from 'lucide-react';

export function Roadmap() {
  const { selectedRole, userId } = useApp();
  const [roadmap, setRoadmap] = useState<{ weeks: any[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [overallProgress, setOverallProgress] = useState({ completed: 0, total: 0, percentage: 0 });
  const [bonusMessage, setBonusMessage] = useState<string | null>(null);
  const [noRoadmap, setNoRoadmap] = useState(false);
  const currentWeek = 1;

  // Calculate progress from roadmap
  const calculateProgress = (weeks: any[]) => {
    let completed = 0;
    let total = 0;
    weeks.forEach(week => {
      week.tasks?.forEach((task: any) => {
        total++;
        if (task.completed) completed++;
      });
    });
    return {
      completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  };

  useEffect(() => {
    const fetchRoadmap = async () => {
      setIsLoading(true);
      setNoRoadmap(false);
      try {
        // Fetch the saved roadmap from database instead of regenerating
        const response = await roadmapApi.get(userId);
        if (response.roadmap?.weeks) {
          setRoadmap(response.roadmap);
          setOverallProgress(calculateProgress(response.roadmap.weeks));
        } else if (response.weeks) {
          setRoadmap(response);
          setOverallProgress(calculateProgress(response.weeks));
        } else {
          // No roadmap found
          setNoRoadmap(true);
        }
      } catch (error: any) {
        console.error('Error fetching roadmap:', error);
        // Check if it's a 404 (no roadmap found)
        if (error?.response?.status === 404) {
          setNoRoadmap(true);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoadmap();
  }, [userId]);

  const handleTaskComplete = async (weekId: string, taskId: string, currentCompleted: boolean) => {
    if (!roadmap) return;
    
    const newCompleted = !currentCompleted;
    
    // Optimistic update
    setRoadmap((prev) => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        weeks: prev.weeks.map((week: any) =>
          week.id === weekId
            ? {
                ...week,
                tasks: week.tasks.map((task: any) =>
                  task.id === taskId ? { ...task, completed: newCompleted } : task
                ),
              }
            : week
        ),
      };
      setOverallProgress(calculateProgress(updated.weeks));
      return updated;
    });

    // Call API to persist and check for bonus topics
    try {
      const result = await roadmapApi.updateTask(userId, taskId, newCompleted, weekId);
      
      // Update progress from API response
      if (result.overallProgress) {
        setOverallProgress(result.overallProgress);
      }
      
      // Show bonus message if fast learner
      if (result.isFastLearner && result.bonusTopicsAdded) {
        setBonusMessage(result.bonusTopics?.message || "🎉 You're crushing it! Bonus challenges added!");
        
        // Add bonus tasks to the roadmap
        if (result.bonusTopics?.tasks) {
          setRoadmap((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              weeks: prev.weeks.map((week: any) =>
                week.id === weekId
                  ? {
                      ...week,
                      tasks: [
                        ...week.tasks,
                        ...result.bonusTopics.tasks.map((t: any, idx: number) => ({
                          ...t,
                          id: `${weekId}_bonus_${idx}`,
                          isBonus: true,
                        })),
                      ],
                    }
                  : week
              ),
            };
          });
        }
        
        // Clear message after 5 seconds
        setTimeout(() => setBonusMessage(null), 5000);
      }
    } catch (error) {
      console.error('Error updating task:', error);
      // Revert on error
      setRoadmap((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          weeks: prev.weeks.map((week: any) =>
            week.id === weekId
              ? {
                  ...week,
                  tasks: week.tasks.map((task: any) =>
                    task.id === taskId ? { ...task, completed: currentCompleted } : task
                  ),
                }
              : week
          ),
        };
      });
      if (roadmap) {
        setOverallProgress(calculateProgress(roadmap.weeks));
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-lg text-white">Loading your roadmap...</p>
        </div>
      </div>
    );
  }

  if (noRoadmap || !roadmap) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <Sparkles className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">No Roadmap Yet</h2>
          <p className="text-gray-400 mb-6">
            Complete the onboarding process to generate your personalized learning roadmap.
          </p>
          <a 
            href="/onboarding" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Target className="w-5 h-5" />
            Start Onboarding
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Your Learning Roadmap</h1>
          <p className="text-gray-400">
            Personalized 10-week plan for{' '}
            <span className="text-blue-400">{selectedRole?.title || 'Senior Frontend Engineer'}</span>
          </p>
        </motion.div>

        {/* Overall Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  <span className="font-medium text-white">Overall Progress</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-blue-400">{overallProgress.percentage}%</span>
                  <span className="text-sm text-gray-400 ml-2">
                    ({overallProgress.completed}/{overallProgress.total} tasks)
                  </span>
                </div>
              </div>
              <Progress value={overallProgress.percentage} className="h-3" />
            </CardContent>
          </Card>
        </motion.div>

        {/* Bonus Message */}
        <AnimatePresence>
          {bonusMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="mb-6"
            >
              <Card className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30">
                <CardContent className="py-4">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-6 h-6 text-yellow-400" />
                    <p className="text-yellow-200 font-medium">{bonusMessage}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <Calendar className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{roadmap.weeks.length}</p>
              <p className="text-xs text-gray-400">Weeks</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Target className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">
                {overallProgress.completed}/{overallProgress.total}
              </p>
              <p className="text-xs text-gray-400">Tasks Done</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Clock className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">8-10 hrs</p>
              <p className="text-xs text-gray-400">Per Week</p>
            </CardContent>
          </Card>
        </div>

        {/* Timeline */}
        <RoadmapTimeline
          weeks={roadmap.weeks}
          currentWeek={currentWeek}
          onTaskComplete={handleTaskComplete}
          overallProgress={overallProgress}
        />
      </div>
    </div>
  );
}
