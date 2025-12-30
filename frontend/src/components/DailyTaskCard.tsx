import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Code, Clock, Target, TrendingUp, Flame, ChevronRight } from 'lucide-react';

interface DailyTask {
  id: string;
  title: string;
  type: 'problem' | 'course' | 'project' | 'interview';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  duration: string;
  reason: string;
  frequency?: string;
  company?: string;
  url?: string;
}

interface DailyTaskCardProps {
  task: DailyTask;
  streak: number;
  onStart: () => void;
}

const difficultyColors = {
  Easy: 'text-green-400 bg-green-400/10',
  Medium: 'text-yellow-400 bg-yellow-400/10',
  Hard: 'text-red-400 bg-red-400/10',
};

export function DailyTaskCard({ task, streak, onStart }: DailyTaskCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
        
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="text-lg font-bold text-orange-500">{streak}</span>
              <span className="text-sm text-gray-400">day streak</span>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${difficultyColors[task.difficulty]}`}>
              {task.difficulty}
            </span>
          </div>
          
          <div className="mt-4">
            <p className="text-sm text-blue-400 font-medium mb-1">TODAY'S FOCUS</p>
            <CardTitle className="text-2xl">{task.title}</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Why this task */}
          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <div className="flex items-start gap-3">
              <Target className="w-5 h-5 text-blue-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-400">Why this problem?</p>
                <p className="text-sm text-gray-300 mt-1">{task.reason}</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-lg bg-gray-800/50">
              <Clock className="w-5 h-5 text-gray-400 mx-auto mb-1" />
              <p className="text-xs text-gray-400">Duration</p>
              <p className="text-sm font-medium text-white">{task.duration}</p>
            </div>
            
            {task.frequency && (
              <div className="text-center p-3 rounded-lg bg-gray-800/50">
                <TrendingUp className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                <p className="text-xs text-gray-400">Interview Freq</p>
                <p className="text-sm font-medium text-white">{task.frequency}</p>
              </div>
            )}
            
            {task.company && (
              <div className="text-center p-3 rounded-lg bg-gray-800/50">
                <Code className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                <p className="text-xs text-gray-400">Asked by</p>
                <p className="text-sm font-medium text-white">{task.company}</p>
              </div>
            )}
          </div>

          {/* CTA */}
          <Button className="w-full h-12 text-lg" onClick={onStart}>
            Start Problem
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
