import { MockInterview } from '../components/MockInterview';
import { useApp } from '../context/AppContext';
import { interviewApi } from '../services/api';

export function Interview() {
  const { selectedRole, userId } = useApp();

  const handleStartInterview = async (interviewType: string = 'behavioral') => {
    try {
      const response = await interviewApi.start(
        userId, 
        selectedRole?.title || 'Software Engineer',
        interviewType
      );
      return {
        conversationUrl: response.interview?.conversationUrl || null,
        conversationId: response.interview?.id || 'demo-id',
        demo: response.interview?.demo || false,
        message: response.interview?.message || null,
      };
    } catch (error) {
      console.error('Error starting interview:', error);
      return {
        conversationUrl: null,
        conversationId: 'demo-id',
        demo: true,
        message: 'Unable to connect to interview service.',
      };
    }
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">AI Mock Interview</h1>
          <p className="text-gray-400">
            Practice with an AI interviewer and get instant feedback
          </p>
        </div>

        <MockInterview
          targetRole={selectedRole?.title || 'Software Engineer'}
          onStart={handleStartInterview}
        />
      </div>
    </div>
  );
}
