import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired, try to refresh
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE}/auth/refresh`, {
            refresh_token: refreshToken,
          });
          if (response.data.success) {
            localStorage.setItem('access_token', response.data.access_token);
            localStorage.setItem('refresh_token', response.data.refresh_token);
            // Retry the original request
            error.config.headers.Authorization = `Bearer ${response.data.access_token}`;
            return api.request(error.config);
          }
        } catch (refreshError) {
          // Refresh failed, redirect to login
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: async (email: string, password: string, fullName?: string) => {
    const response = await api.post('/auth/register', {
      email,
      password,
      full_name: fullName,
    });
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  refresh: async (refreshToken: string) => {
    const response = await api.post('/auth/refresh', { refresh_token: refreshToken });
    return response.data;
  },

  resetPassword: async (email: string) => {
    const response = await api.post('/auth/reset-password', { email });
    return response.data;
  },
};

// Profile API
export const profileApi = {
  upload: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/profile/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  
  analyzeText: async (text: string) => {
    const response = await api.post('/profile/analyze', { resume_text: text });
    return response.data;
  },
  
  get: async (id: string) => {
    const response = await api.get(`/profile/${id}`);
    return response.data;
  },
  
  getSkillGraph: async (id: string) => {
    const response = await api.get(`/profile/${id}/skills`);
    return response.data;
  },
};

// Roles API
export const rolesApi = {
  match: async (profileId: string) => {
    const response = await api.post('/roles/match', { profile_id: profileId });
    return response.data;
  },
  
  getRecommendations: async (skills: string[]) => {
    const response = await api.post('/roles/recommendations', { skills });
    return response.data;
  },
};

// Roadmap API
export const roadmapApi = {
  generate: async (userId: string, targetRole: string) => {
    const response = await api.post('/roadmap/generate', {
      userId: userId,
      targetRole: targetRole,
    });
    return response.data;
  },
  
  get: async (userId: string) => {
    const response = await api.get(`/roadmap/${userId}`);
    return response.data;
  },
  
  update: async (userId: string, data: object) => {
    const response = await api.put(`/roadmap/${userId}`, data);
    return response.data;
  },

  updateTask: async (userId: string, taskId: string, completed: boolean, weekId?: string) => {
    const response = await api.put(`/roadmap/${userId}/task/${taskId}`, {
      completed,
      weekId,
    });
    return response.data;
  },

  getProgress: async (userId: string) => {
    const response = await api.get(`/roadmap/${userId}/progress`);
    return response.data;
  },
};

// Interview API
export const interviewApi = {
  start: async (userId: string, targetRole: string, interviewType: string = 'behavioral') => {
    const response = await api.post('/interview/start', {
      userId: userId,
      targetRole: targetRole,
      type: interviewType,
    });
    return response.data;
  },
  
  get: async (id: string) => {
    const response = await api.get(`/interview/${id}`);
    return response.data;
  },
  
  getFeedback: async (id: string) => {
    const response = await api.get(`/interview/${id}/feedback`);
    return response.data;
  },
};

// Dashboard API
export const dashboardApi = {
  get: async (userId: string) => {
    const response = await api.get(`/dashboard/${userId}`);
    return response.data;
  },
  
  getDaily: async (userId: string) => {
    const response = await api.get(`/dashboard/${userId}/daily`);
    return response.data;
  },
  
  getProgress: async (userId: string) => {
    const response = await api.get(`/dashboard/${userId}/progress`);
    return response.data;
  },

  completeProblem: async (userId: string, problemId: string, problemTitle: string) => {
    const response = await api.post(`/dashboard/${userId}/complete-problem`, {
      problem_id: problemId,
      problem_title: problemTitle,
    });
    return response.data;
  },
};

export default api;
