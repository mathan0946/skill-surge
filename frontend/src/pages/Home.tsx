import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Rocket, Brain, Target, Video, TrendingUp, Zap } from 'lucide-react';

export function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10" />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-8">
              <Zap className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-blue-400">13 AI Agents Working For You</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              From Confused to{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                Job-Ready
              </span>
              <br />in 10 Weeks
            </h1>
            
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
              SkillSurge is your AI career co-pilot. Upload your resume, get a personalized roadmap,
              practice with AI interviews, and land your dream job.
            </p>
            
            <div className="flex gap-4 justify-center">
              <Link to="/onboarding">
                <Button className="h-14 px-8 text-lg">
                  <Rocket className="w-5 h-5 mr-2" />
                  Get Started Free
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="outline" className="h-14 px-8 text-lg">
                  View Demo Dashboard
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20"
          >
            {[
              { value: '93%', label: 'Skill Improvement' },
              { value: '125%', label: 'Higher Interview Rate' },
              { value: '12 hrs', label: 'Saved Per Week' },
              { value: '10 wks', label: 'To Job-Ready' },
            ].map((stat, i) => (
              <div key={i} className="text-center p-6 rounded-xl bg-gray-900/50 border border-gray-800">
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-gray-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">How SkillSurge Works</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Our 13 AI agents work autonomously to guide you from resume to job offer
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: 'Smart Resume Analysis',
                description: 'Upload your resume and our AI builds your skill graph instantly',
                color: 'blue',
              },
              {
                icon: Target,
                title: 'Role Matching',
                description: 'Get matched to roles based on your skills with gap analysis',
                color: 'green',
              },
              {
                icon: TrendingUp,
                title: 'Personalized Roadmap',
                description: '8-12 week plan tailored to your target role and current skills',
                color: 'purple',
              },
              {
                icon: Zap,
                title: 'Daily Assignments',
                description: '"Today: Two Sum. Why: 95% Google interview frequency"',
                color: 'yellow',
              },
              {
                icon: Video,
                title: 'AI Mock Interviews',
                description: 'Practice with a video AI interviewer and get instant feedback',
                color: 'pink',
              },
              {
                icon: Rocket,
                title: 'Job-Ready Prediction',
                description: '"You\'ll be ready in 10 weeks" - 85% accurate predictions',
                color: 'orange',
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-xl bg-gray-900/50 border border-gray-800 hover:border-gray-700 transition-colors"
              >
                <div className={`w-12 h-12 rounded-lg bg-${feature.color}-500/20 flex items-center justify-center mb-4`}>
                  <feature.icon className={`w-6 h-6 text-${feature.color}-400`} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-12 rounded-2xl bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 border border-gray-800">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Transform Your Career?</h2>
            <p className="text-gray-400 mb-8">
              Join thousands of candidates who went from confused to job-ready with SkillSurge
            </p>
            <Link to="/onboarding">
              <Button className="h-14 px-10 text-lg">
                Start Your Journey
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
