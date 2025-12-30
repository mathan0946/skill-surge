import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { 
  Code, 
  Clock, 
  Target, 
  TrendingUp, 
  Flame, 
  ChevronDown,
  ExternalLink,
  Lightbulb,
  Building2,
  CheckCircle,
  BookOpen
} from 'lucide-react';

interface Example {
  input: string;
  output: string;
  explanation?: string;
}

interface RelatedProblem {
  title: string;
  link: string;
  difficulty: string;
}

interface DailyProblem {
  id: string;
  title: string;
  slug?: string;
  type: string;
  difficulty: string;
  companies?: string[];
  frequency?: number;
  estimatedTime?: string;
  link: string;
  description: string;
  examples?: Example[];
  constraints?: string[];
  topics?: string[];
  reason: string;
  hints?: string[];
  relatedProblems?: RelatedProblem[];
}

interface DailyProblemCardProps {
  problem: DailyProblem;
  streak: number;
  onComplete: () => void;
}

const difficultyColors: Record<string, string> = {
  Easy: 'text-green-400 bg-green-400/10 border-green-400/20',
  Medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  Hard: 'text-red-400 bg-red-400/10 border-red-400/20',
};

export function DailyProblemCard({ problem, streak, onComplete }: DailyProblemCardProps) {
  const [showDescription, setShowDescription] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleComplete = () => {
    setIsCompleted(true);
    onComplete();
  };

  const handleStartProblem = () => {
    window.open(problem.link, '_blank');
  };

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
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${difficultyColors[problem.difficulty] || difficultyColors.Easy}`}>
              {problem.difficulty}
            </span>
          </div>
          
          <div className="mt-4">
            <p className="text-sm text-blue-400 font-medium mb-1">TODAY'S LEETCODE CHALLENGE</p>
            <CardTitle className="text-2xl flex items-center gap-2">
              {problem.title}
              {isCompleted && <CheckCircle className="w-6 h-6 text-green-500" />}
            </CardTitle>
            <div className="flex flex-wrap gap-2 mt-2">
              {problem.topics?.map((topic) => (
                <span key={topic} className="px-2 py-0.5 rounded-md bg-gray-800 text-gray-400 text-xs">
                  {topic}
                </span>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Companies */}
          {problem.companies && problem.companies.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <Building2 className="w-4 h-4 text-gray-500" />
              <span className="text-xs text-gray-500">Asked at:</span>
              {problem.companies.slice(0, 5).map((company) => (
                <span key={company} className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 text-xs">
                  {company}
                </span>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-lg bg-gray-800/50">
              <Clock className="w-4 h-4 text-gray-400 mx-auto mb-1" />
              <p className="text-xs text-gray-400">Time</p>
              <p className="text-sm font-medium text-white">{problem.estimatedTime || '30 min'}</p>
            </div>
            
            <div className="text-center p-3 rounded-lg bg-gray-800/50">
              <TrendingUp className="w-4 h-4 text-gray-400 mx-auto mb-1" />
              <p className="text-xs text-gray-400">Frequency</p>
              <p className="text-sm font-medium text-white">{problem.frequency || 80}%</p>
            </div>
            
            <div className="text-center p-3 rounded-lg bg-gray-800/50">
              <Code className="w-4 h-4 text-gray-400 mx-auto mb-1" />
              <p className="text-xs text-gray-400">Type</p>
              <p className="text-sm font-medium text-white capitalize">{problem.type}</p>
            </div>
          </div>

          {/* Why this problem - Always visible */}
          <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20">
            <div className="flex items-start gap-3">
              <Target className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-blue-400 mb-2">Why this problem was chosen for you:</p>
                <p className="text-sm text-gray-300 whitespace-pre-line">{problem.reason}</p>
              </div>
            </div>
          </div>

          {/* Problem Description - Collapsible */}
          <div className="border border-gray-800 rounded-lg overflow-hidden">
            <button
              onClick={() => setShowDescription(!showDescription)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-white">Problem Description</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showDescription ? 'rotate-180' : ''}`} />
            </button>
            
            <AnimatePresence>
              {showDescription && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-t border-gray-800"
                >
                  <div className="p-4 space-y-4">
                    <p className="text-sm text-gray-300 whitespace-pre-line">{problem.description}</p>
                    
                    {/* Examples */}
                    {problem.examples && problem.examples.length > 0 && (
                      <div className="space-y-3">
                        <p className="text-sm font-medium text-white">Examples:</p>
                        {problem.examples.map((example, idx) => (
                          <div key={idx} className="p-3 rounded-lg bg-gray-900 font-mono text-sm">
                            <p className="text-gray-400">Input: <span className="text-white">{example.input}</span></p>
                            <p className="text-gray-400">Output: <span className="text-green-400">{example.output}</span></p>
                            {example.explanation && (
                              <p className="text-gray-500 mt-1">Explanation: {example.explanation}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Constraints */}
                    {problem.constraints && problem.constraints.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-white mb-2">Constraints:</p>
                        <ul className="list-disc list-inside space-y-1">
                          {problem.constraints.map((constraint, idx) => (
                            <li key={idx} className="text-sm text-gray-400 font-mono">{constraint}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Hints - Collapsible */}
          {problem.hints && problem.hints.length > 0 && (
            <div className="border border-gray-800 rounded-lg overflow-hidden">
              <button
                onClick={() => setShowHints(!showHints)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-medium text-white">Hints ({problem.hints.length})</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showHints ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {showHints && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-gray-800"
                  >
                    <div className="p-4 space-y-2">
                      {problem.hints.map((hint, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <span className="text-yellow-400 text-sm">{idx + 1}.</span>
                          <p className="text-sm text-gray-300">{hint}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Related Problems */}
          {problem.relatedProblems && problem.relatedProblems.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-400">Practice next:</p>
              <div className="flex flex-wrap gap-2">
                {problem.relatedProblems.map((related) => (
                  <a
                    key={related.title}
                    href={related.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`px-3 py-1 rounded-lg border text-sm hover:opacity-80 transition-opacity ${difficultyColors[related.difficulty] || difficultyColors.Easy}`}
                  >
                    {related.title}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* CTAs */}
          <div className="flex gap-3 pt-2">
            <Button 
              className="flex-1 h-12 text-lg" 
              onClick={handleStartProblem}
            >
              Open in LeetCode
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
            
            {!isCompleted ? (
              <Button 
                variant="outline"
                className="h-12 px-4 border-green-500/50 text-green-400 hover:bg-green-500/10 hover:border-green-500"
                onClick={handleComplete}
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Mark Solved
              </Button>
            ) : (
              <div className="h-12 px-4 flex items-center gap-2 rounded-lg bg-green-500/20 text-green-400">
                <CheckCircle className="w-5 h-5" />
                Solved!
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
