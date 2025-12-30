import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Progress } from '../components/ui/Progress';
import { DailyProblemCard } from '../components/DailyProblemCard';
import { SkillGraph } from '../components/SkillGraph';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { dashboardApi } from '../services/api';
import {
  Flame,
  Target,
  TrendingUp,
  Calendar,
  Video,
  ChevronRight,
  Zap,
  Award,
  Brain,
  Loader2,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export function Dashboard() {
  const { selectedRole, profile } = useApp();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [dailyProblem, setDailyProblem] = useState<any>(null);
  const [streak, setStreak] = useState(0);
  const [jobReadiness, setJobReadiness] = useState<any>(null);
  const [progressData, setProgressData] = useState([
    { week: 'W1', score: 0 },
    { week: 'W2', score: 0 },
    { week: 'W3', score: 0 },
    { week: 'W4', score: 0 },
    { week: 'W5', score: 0 },
    { week: 'W6', score: 0 },
  ]);

  const userId = user?.id || localStorage.getItem('user_id') || 'demo-user';

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Fetch dashboard data and daily problem in parallel
        const [dashboard, daily] = await Promise.all([
          dashboardApi.get(userId),
          dashboardApi.getDaily(userId),
        ]);
        
        setDashboardData(dashboard);
        setDailyProblem(daily.dailyTask);
        setStreak(dashboard.stats?.streak || daily.streak || 0);
        setJobReadiness(dashboard.jobReadiness || null);
        
        if (dashboard.progressData) {
          setProgressData(dashboard.progressData.map((d: any) => ({
            week: d.week,
            score: d.skills || d.score,
          })));
        }
      } catch (error) {
        console.error('Error fetching dashboard:', error);
        // Use fallback data
        setDailyProblem({
          id: 'daily-1',
          title: 'Two Sum',
          difficulty: 'Easy',
          link: 'https://leetcode.com/problems/two-sum/',
          description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
          reason: 'This is the most commonly asked problem at FAANG companies.',
          companies: ['Google', 'Amazon', 'Meta'],
          topics: ['Array', 'Hash Table'],
          frequency: 95,
          estimatedTime: '30 min',
          type: 'problem',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [userId]);

  const handleCompleteProblem = async () => {
    if (dailyProblem) {
      try {
        const result = await dashboardApi.completeProblem(userId, dailyProblem.id, dailyProblem.title);
        // Update streak from response
        if (result.streak) {
          setStreak(result.streak);
        }
        // Refresh dashboard data to get updated stats
        const dashboard = await dashboardApi.get(userId);
        setDashboardData(dashboard);
        setJobReadiness(dashboard.jobReadiness || null);
      } catch (error) {
        console.error('Error completing problem:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = dashboardData?.stats || {
    streak: 7,
    problemsSolved: 0,
    skillMatch: 68,
    daysUntilReady: 28,
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}! 👋
          </h1>
          <p className="text-gray-400">
            Let's continue your journey to{' '}
            <span className="text-blue-400">
              {dashboardData?.targetRole || selectedRole?.title || 'Senior Frontend Engineer'}
            </span>
          </p>
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-500/20">
                    <Flame className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.streak}</p>
                    <p className="text-xs text-gray-400">Day Streak</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <Target className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.skillMatch}%</p>
                    <p className="text-xs text-gray-400">Match Score</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.problemsSolved}</p>
                    <p className="text-xs text-gray-400">Problems Solved</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/20">
                    <Calendar className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{Math.ceil(stats.daysUntilReady / 7)} wks</p>
                    <p className="text-xs text-gray-400">Until Ready</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Daily Problem */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              {dailyProblem && (
                <DailyProblemCard 
                  problem={dailyProblem} 
                  streak={streak} 
                  onComplete={handleCompleteProblem}
                />
              )}
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link to="/interview">
                    <Button variant="outline" className="w-full justify-between">
                      <span className="flex items-center gap-2">
                        <Video className="w-4 h-4 text-pink-400" />
                        Start AI Mock Interview
                      </span>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link to="/roadmap">
                    <Button variant="outline" className="w-full justify-between">
                      <span className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-blue-400" />
                        View Full Roadmap
                      </span>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Progress Chart */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Skill Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={progressData}>
                        <XAxis dataKey="week" stroke="#6B7280" fontSize={12} />
                        <YAxis stroke="#6B7280" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1F2937',
                            border: '1px solid #374151',
                            borderRadius: '8px',
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="score"
                          stroke="#3B82F6"
                          strokeWidth={3}
                          dot={{ fill: '#3B82F6', strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-gray-400">Current Match: {jobReadiness?.readinessScore || stats.skillMatch}%</span>
                    <span className="text-green-400">+{Math.max(0, (jobReadiness?.readinessScore || stats.skillMatch) - 35)}% from start</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Job Ready Prediction */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-blue-500/20">
                      <Award className="w-8 h-8 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">Job-Ready Prediction</h3>
                      <p className="text-sm text-gray-400 mb-4">
                        Based on your skills, progress, and consistency
                      </p>
                      <div className="p-4 rounded-lg bg-gray-900/50">
                        <div className="flex items-baseline gap-2 mb-2">
                          <span className="text-3xl font-bold text-blue-400">
                            {jobReadiness?.weeksUntilReady || stats.weeksUntilReady || '?'} weeks
                          </span>
                          <span className="text-gray-400">remaining</span>
                        </div>
                        <Progress value={jobReadiness?.readinessScore || 0} className="h-2" />
                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                          <span>Readiness: {jobReadiness?.readinessScore || 0}%</span>
                          {jobReadiness?.estimatedDate && (
                            <span>Target: {new Date(jobReadiness.estimatedDate).toLocaleDateString()}</span>
                          )}
                        </div>
                        
                        {/* Readiness factors breakdown */}
                        {jobReadiness?.factors && (
                          <div className="mt-4 space-y-2">
                            {Object.entries(jobReadiness.factors).map(([key, factor]: [string, any]) => (
                              <div key={key} className="flex items-center justify-between text-xs">
                                <span className="text-gray-400">{factor.label}</span>
                                <div className="flex items-center gap-2">
                                  <div className="w-20 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-blue-500 rounded-full"
                                      style={{ width: `${(factor.score / factor.max) * 100}%` }}
                                    />
                                  </div>
                                  <span className="text-gray-300 w-8">{factor.score}/{factor.max}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Skill Knowledge Graph Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-500" />
                Your Skill Knowledge Graph
              </CardTitle>
              <p className="text-sm text-gray-400 mt-1">
                Interactive visualization of your skills and their connections
              </p>
            </CardHeader>
            <CardContent>
              {profile?.skillGraph && profile.skillGraph.length > 0 ? (
                <SkillGraph skills={profile.skillGraph} />
              ) : (
                <SkillGraph skills={[
                  { id: '1', name: 'JavaScript', level: 85, category: 'Frontend', connections: ['2', '3'] },
                  { id: '2', name: 'React', level: 80, category: 'Frontend', connections: ['1', '4'] },
                  { id: '3', name: 'TypeScript', level: 70, category: 'Frontend', connections: ['1', '2'] },
                  { id: '4', name: 'Node.js', level: 75, category: 'Backend', connections: ['2', '5'] },
                  { id: '5', name: 'Python', level: 65, category: 'Backend', connections: ['4', '6'] },
                  { id: '6', name: 'SQL', level: 70, category: 'Database', connections: ['5'] },
                  { id: '7', name: 'Git', level: 80, category: 'Tools', connections: ['1', '4'] },
                  { id: '8', name: 'AWS', level: 55, category: 'DevOps', connections: ['4', '5'] },
                ]} />
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
