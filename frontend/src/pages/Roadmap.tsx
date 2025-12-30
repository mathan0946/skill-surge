import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RoadmapTimeline } from '../components/RoadmapTimeline';
import { Card, CardContent } from '../components/ui/Card';
import { Progress } from '../components/ui/Progress';
import { useApp } from '../context/AppContext';
import { roadmapApi } from '../services/api';
import { Calendar, Clock, Target, Loader2, Sparkles, TrendingUp } from 'lucide-react';

// Mock roadmap data
const mockRoadmap = {
  weeks: [
    {
      id: 'w1',
      number: 1,
      title: 'Fundamentals & Assessment',
      description: 'Review core concepts and establish baseline',
      focus: 'Data Structures',
      tasks: [
        { id: 't1', title: 'Two Sum', type: 'problem' as const, duration: '30 min', reason: '95% interview frequency at Google', completed: true },
        { id: 't2', title: 'Valid Parentheses', type: 'problem' as const, duration: '25 min', reason: 'Stack fundamentals', completed: true },
        { id: 't3', title: 'Big O Notation Course', type: 'course' as const, duration: '2 hrs', reason: 'Foundation for optimization', completed: false },
      ],
      completed: false,
    },
    {
      id: 'w2',
      number: 2,
      title: 'Arrays & Strings',
      description: 'Master array manipulation techniques',
      focus: 'Arrays',
      tasks: [
        { id: 't4', title: 'Best Time to Buy Stock', type: 'problem' as const, duration: '30 min', reason: 'Sliding window intro' },
        { id: 't5', title: 'Container With Most Water', type: 'problem' as const, duration: '35 min', reason: 'Two pointer technique' },
        { id: 't6', title: 'Product of Array Except Self', type: 'problem' as const, duration: '40 min', reason: 'Prefix/suffix pattern' },
      ],
    },
    {
      id: 'w3',
      number: 3,
      title: 'Linked Lists & Trees',
      description: 'Pointer manipulation and tree traversal',
      focus: 'Trees',
      tasks: [
        { id: 't7', title: 'Reverse Linked List', type: 'problem' as const, duration: '25 min', reason: 'Core linked list skill' },
        { id: 't8', title: 'Binary Tree Inorder Traversal', type: 'problem' as const, duration: '30 min', reason: 'Tree fundamentals' },
        { id: 't9', title: 'Validate BST', type: 'problem' as const, duration: '35 min', reason: 'BST properties' },
      ],
    },
    {
      id: 'w4',
      number: 4,
      title: 'Dynamic Programming',
      description: 'Breaking down complex problems',
      focus: 'DP',
      tasks: [
        { id: 't10', title: 'Climbing Stairs', type: 'problem' as const, duration: '25 min', reason: 'DP introduction' },
        { id: 't11', title: 'Coin Change', type: 'problem' as const, duration: '40 min', reason: 'Classic DP pattern' },
        { id: 't12', title: 'Dynamic Programming Course', type: 'course' as const, duration: '3 hrs', reason: 'Master DP patterns' },
      ],
    },
    {
      id: 'w5',
      number: 5,
      title: 'Graph Algorithms',
      description: 'BFS, DFS, and graph traversal',
      focus: 'Graphs',
      tasks: [
        { id: 't13', title: 'Number of Islands', type: 'problem' as const, duration: '35 min', reason: 'BFS/DFS classic' },
        { id: 't14', title: 'Course Schedule', type: 'problem' as const, duration: '40 min', reason: 'Topological sort' },
        { id: 't15', title: 'Clone Graph', type: 'problem' as const, duration: '35 min', reason: 'Graph traversal' },
      ],
    },
    {
      id: 'w6',
      number: 6,
      title: 'System Design Basics',
      description: 'Introduction to system design concepts',
      focus: 'System Design',
      tasks: [
        { id: 't16', title: 'System Design Primer', type: 'course' as const, duration: '4 hrs', reason: 'Foundation for senior roles' },
        { id: 't17', title: 'Design URL Shortener', type: 'project' as const, duration: '2 hrs', reason: 'Entry-level system design' },
      ],
    },
    {
      id: 'w7',
      number: 7,
      title: 'Advanced System Design',
      description: 'Scalability and distributed systems',
      focus: 'System Design',
      tasks: [
        { id: 't18', title: 'Design Twitter Feed', type: 'project' as const, duration: '3 hrs', reason: 'Real-world complexity' },
        { id: 't19', title: 'Design Rate Limiter', type: 'project' as const, duration: '2 hrs', reason: 'Common interview question' },
      ],
    },
    {
      id: 'w8',
      number: 8,
      title: 'Behavioral Preparation',
      description: 'STAR method and communication skills',
      focus: 'Behavioral',
      tasks: [
        { id: 't20', title: 'Behavioral Interview Course', type: 'course' as const, duration: '2 hrs', reason: 'STAR method mastery' },
        { id: 't21', title: 'AI Mock Interview #1', type: 'interview' as const, duration: '45 min', reason: 'Practice with feedback' },
      ],
    },
    {
      id: 'w9',
      number: 9,
      title: 'Interview Simulation',
      description: 'Full interview practice rounds',
      focus: 'Mock Interviews',
      tasks: [
        { id: 't22', title: 'Technical Mock Interview', type: 'interview' as const, duration: '60 min', reason: 'Simulate real conditions' },
        { id: 't23', title: 'System Design Mock', type: 'interview' as const, duration: '45 min', reason: 'Senior role preparation' },
      ],
    },
    {
      id: 'w10',
      number: 10,
      title: 'Final Preparation',
      description: 'Review, polish, and apply',
      focus: 'Review',
      tasks: [
        { id: 't24', title: 'Review All Hard Problems', type: 'problem' as const, duration: '3 hrs', reason: 'Reinforce patterns' },
        { id: 't25', title: 'Final Mock Interview', type: 'interview' as const, duration: '60 min', reason: 'Final assessment' },
        { id: 't26', title: 'Apply to Target Companies', type: 'project' as const, duration: '2 hrs', reason: "You're ready!" },
      ],
    },
  ],
};

export function Roadmap() {
  const { selectedRole, userId } = useApp();
  const [roadmap, setRoadmap] = useState<{ weeks: any[] }>(mockRoadmap);
  const [isLoading, setIsLoading] = useState(false);
  const [overallProgress, setOverallProgress] = useState({ completed: 0, total: 0, percentage: 0 });
  const [bonusMessage, setBonusMessage] = useState<string | null>(null);
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
      if (selectedRole) {
        setIsLoading(true);
        try {
          const response = await roadmapApi.generate(userId, selectedRole.title);
          if (response.roadmap?.weeks) {
            setRoadmap(response.roadmap);
            setOverallProgress(calculateProgress(response.roadmap.weeks));
          } else if (response.weeks) {
            setRoadmap(response);
            setOverallProgress(calculateProgress(response.weeks));
          }
        } catch (error) {
          console.error('Error fetching roadmap:', error);
          setOverallProgress(calculateProgress(mockRoadmap.weeks));
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchRoadmap();
  }, [selectedRole, userId]);

  const handleTaskComplete = async (weekId: string, taskId: string, currentCompleted: boolean) => {
    const newCompleted = !currentCompleted;
    
    // Optimistic update
    setRoadmap((prev) => {
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
          setRoadmap((prev) => ({
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
          }));
        }
        
        // Clear message after 5 seconds
        setTimeout(() => setBonusMessage(null), 5000);
      }
    } catch (error) {
      console.error('Error updating task:', error);
      // Revert on error
      setRoadmap((prev) => ({
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
      }));
      setOverallProgress(calculateProgress(roadmap.weeks));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-lg text-white">Generating your personalized roadmap...</p>
          <p className="text-sm text-gray-400 mt-2">This may take a few seconds</p>
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
