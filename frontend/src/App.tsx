import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Onboarding } from './pages/Onboarding';
import { Dashboard } from './pages/Dashboard';
import { Roadmap } from './pages/Roadmap';
import { Interview } from './pages/Interview';
import SubjectOverview from './pages/SubjectOverview';
import SubjectDetail from './pages/SubjectDetail';
import './index.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppProvider>
          <BrowserRouter>
            <Layout>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Protected routes */}
                <Route path="/onboarding" element={
                  <ProtectedRoute>
                    <Onboarding />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/roadmap" element={
                  <ProtectedRoute>
                    <Roadmap />
                  </ProtectedRoute>
                } />
                <Route path="/subject-overview" element={
                  <ProtectedRoute>
                    <SubjectOverview />
                  </ProtectedRoute>
                } />
                <Route path="/subjects" element={
                  <ProtectedRoute>
                    <SubjectOverview />
                  </ProtectedRoute>
                } />
                <Route path="/subject-detail" element={
                  <ProtectedRoute>
                    <SubjectDetail />
                  </ProtectedRoute>
                } />
                <Route path="/subject/:subjectId" element={
                  <ProtectedRoute>
                    <SubjectDetail />
                  </ProtectedRoute>
                } />
                <Route path="/interview" element={
                  <ProtectedRoute>
                    <Interview />
                  </ProtectedRoute>
                } />
              </Routes>
            </Layout>
          </BrowserRouter>
        </AppProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
