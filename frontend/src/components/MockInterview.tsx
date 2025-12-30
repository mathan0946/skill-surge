import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Video, Loader2, CheckCircle, XCircle, MessageSquare, AlertTriangle } from 'lucide-react';

interface MockInterviewProps {
  targetRole: string;
  onStart: (interviewType?: string) => Promise<{ conversationUrl: string | null; conversationId: string; demo?: boolean; message?: string }>;
}

export function MockInterview({ targetRole, onStart }: MockInterviewProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'active' | 'demo' | 'completed'>('idle');
  const [conversationUrl, setConversationUrl] = useState<string | null>(null);
  const [demoMessage, setDemoMessage] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    overallScore: number;
    communication: number;
    technicalAccuracy: number;
    problemSolving: number;
    suggestions: string[];
  } | null>(null);

  const handleStartInterview = async () => {
    setStatus('loading');
    try {
      const result = await onStart('behavioral');
      if (result.demo || !result.conversationUrl) {
        setDemoMessage(result.message || 'Demo mode - Configure Tavus API key for live video interviews');
        setStatus('demo');
      } else {
        setConversationUrl(result.conversationUrl);
        setStatus('active');
      }
    } catch (error) {
      console.error('Failed to start interview:', error);
      setDemoMessage('Unable to connect to interview service. Please try again later.');
      setStatus('demo');
    }
  };

  const handleEndInterview = () => {
    setStatus('completed');
    // Mock feedback for demo
    setFeedback({
      overallScore: 78,
      communication: 82,
      technicalAccuracy: 75,
      problemSolving: 80,
      suggestions: [
        'Practice explaining your thought process more clearly',
        'Consider edge cases before jumping into the solution',
        'Good job with time complexity analysis',
      ],
    });
  };

  if (status === 'idle') {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-blue-500/20 flex items-center justify-center">
            <Video className="w-10 h-10 text-blue-500" />
          </div>
          <CardTitle className="text-2xl">AI Mock Interview</CardTitle>
          <p className="text-gray-400 mt-2">
            Practice with an AI interviewer tailored to your target role
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
            <p className="text-sm text-gray-400 mb-1">Target Role</p>
            <p className="text-lg font-medium text-white">{targetRole}</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-gray-300">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Role-specific technical questions</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-300">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Real-time video conversation</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-300">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Instant feedback and scoring</span>
            </div>
          </div>

          <Button className="w-full h-12" onClick={handleStartInterview}>
            <Video className="w-5 h-5 mr-2" />
            Start 30-Minute Interview
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (status === 'loading') {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="py-16 text-center">
          <Loader2 className="w-12 h-12 mx-auto text-blue-500 animate-spin mb-4" />
          <p className="text-lg text-white">Preparing your AI interviewer...</p>
          <p className="text-sm text-gray-400 mt-2">This may take a few seconds</p>
        </CardContent>
      </Card>
    );
  }

  if (status === 'demo') {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-yellow-500/20 flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-yellow-500" />
          </div>
          <CardTitle className="text-2xl">Demo Mode</CardTitle>
          <p className="text-gray-400 mt-2">{demoMessage}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
            <p className="text-sm text-yellow-200">
              <strong>Note:</strong> To enable live AI video interviews, you need to configure a valid Tavus API key.
              The free tier includes limited conversation minutes.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-white">What you can still do:</p>
            <div className="flex items-center gap-3 text-sm text-gray-300">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Practice with the dashboard and roadmap</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-300">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Complete daily LeetCode problems</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-300">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Track your learning progress</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setStatus('idle')}>
              Back
            </Button>
            <Button className="flex-1" onClick={handleEndInterview}>
              View Sample Feedback
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (status === 'active' && conversationUrl) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-0">
            <div className="aspect-video w-full bg-gray-900 rounded-lg overflow-hidden">
              <iframe
                src={conversationUrl}
                className="w-full h-full"
                allow="camera; microphone; autoplay"
                title="AI Interview"
              />
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-center">
          <Button variant="destructive" onClick={handleEndInterview}>
            <XCircle className="w-5 h-5 mr-2" />
            End Interview
          </Button>
        </div>
      </div>
    );
  }

  if (status === 'completed' && feedback) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <span className="text-3xl font-bold text-white">{feedback.overallScore}</span>
            </div>
            <CardTitle className="text-2xl">Interview Complete!</CardTitle>
            <p className="text-gray-400 mt-2">Here's your performance breakdown</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Scores */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-gray-800/50">
                <p className="text-2xl font-bold text-blue-400">{feedback.communication}</p>
                <p className="text-xs text-gray-400 mt-1">Communication</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-gray-800/50">
                <p className="text-2xl font-bold text-green-400">{feedback.technicalAccuracy}</p>
                <p className="text-xs text-gray-400 mt-1">Technical</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-gray-800/50">
                <p className="text-2xl font-bold text-purple-400">{feedback.problemSolving}</p>
                <p className="text-xs text-gray-400 mt-1">Problem Solving</p>
              </div>
            </div>

            {/* Suggestions */}
            <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-5 h-5 text-blue-400" />
                <p className="font-medium text-white">AI Feedback</p>
              </div>
              <ul className="space-y-2">
                {feedback.suggestions.map((suggestion, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="text-blue-400">•</span>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>

            <Button className="w-full" onClick={() => setStatus('idle')}>
              Try Another Interview
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return null;
}
