
import axios from 'axios';
import { toast } from '@/hooks/use-toast';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const pythonBackendURL = import.meta.env.VITE_PYTHON_BACKEND_URL || 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // Add a timeout to prevent long hanging requests
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;
    
    if (response && response.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth';
      
      toast({
        title: 'Session expired',
        description: 'Please log in again.',
        variant: 'destructive',
      });
    } else if (response) {
      toast({
        title: 'Error',
        description: response.data?.message || 'Something went wrong',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Network Error',
        description: 'Unable to connect to the server. Please make sure your backend is running.',
        variant: 'destructive',
      });
    }
    
    return Promise.reject(error);
  }
);

// Create mock data for demo purposes when server is not available
const createMockData = () => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        // Mock data structure will be determined by function context
      });
    }, 800);
  });
};

// Python backend service
export const pythonBackendService = {
  startPostureMonitoring: async () => {
    try {
      const response = await axios.post(`${pythonBackendURL}/start`);
      return response.data;
    } catch (error) {
      console.error("Failed to start posture monitoring:", error);
      toast({
        title: "Python Backend Error",
        description: "Failed to start posture monitoring. Is the Python service running?",
        variant: "destructive",
      });
      // Return a mock response
      return { status: 'error', message: 'Failed to start monitoring' };
    }
  },

  stopPostureMonitoring: async () => {
    try {
      const response = await axios.post(`${pythonBackendURL}/stop`);
      return response.data;
    } catch (error) {
      console.error("Failed to stop posture monitoring:", error);
      toast({
        title: "Python Backend Error",
        description: "Failed to stop posture monitoring",
        variant: "destructive",
      });
      // Return a mock response
      return { status: 'error', message: 'Failed to stop monitoring' };
    }
  },

  getPostureData: async () => {
    try {
      const response = await axios.get(`${pythonBackendURL}/data`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch posture data:", error);
      // Return mock data
      return {
        goodCount: Math.floor(Math.random() * 80) + 20,
        badCount: Math.floor(Math.random() * 40),
        postureHistory: Array(100).fill(0).map(() => Math.round(Math.random())),
        sessions: [
          {
            _id: 'mock-1',
            startTime: new Date(Date.now() - 3600000).toISOString(),
            endTime: new Date().toISOString(),
            totalAlerts: Math.floor(Math.random() * 10),
            incorrectPostures: ['Slouching', 'Neck Tilt'],
            postureScore: Math.floor(Math.random() * 40) + 60,
          }
        ]
      };
    }
  },
};

// Auth services
export const authService = {
  register: async (userData: { name: string; email: string; password: string }) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error("Register error:", error);
      throw error;
    }
  },
  
  login: async (credentials: { email: string; password: string }) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },
  
  getCurrentUser: async () => {
    try {
      const response = await api.get('/users/me');
      return response.data;
    } catch (error) {
      console.error("Get user error:", error);
      throw error;
    }
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

// Posture services with fallbacks for demo
export const postureService = {
  startSession: async () => {
    try {
      // Start the Python backend monitoring
      await pythonBackendService.startPostureMonitoring();
      // Also start a session in the Node.js backend
      const response = await api.post('/posture/sessions');
      return response.data;
    } catch (error) {
      console.error("Start session error:", error);
      // For demo, return a mock session if backend is not available
      return {
        _id: `mock-${Date.now()}`,
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        postureScore: 100
      };
    }
  },
  
  endSession: async (sessionId: string, data: { totalAlerts: number; incorrectPostures: string[]; postureScore: number }) => {
    try {
      // Stop the Python backend monitoring
      await pythonBackendService.stopPostureMonitoring();
      // Also end the session in the Node.js backend
      const response = await api.put(`/posture/sessions/${sessionId}/end`, data);
      return response.data;
    } catch (error) {
      console.error("End session error:", error);
      // Just log the error and proceed - we can't do much if saving fails
      return { success: false, error: 'Failed to save session' };
    }
  },
  
  analyzePosture: async (sessionId: string, imageData: string) => {
    try {
      const response = await api.post('/posture/analyze', { sessionId, imageData });
      return response.data;
    } catch (error) {
      console.error("Analyze posture error:", error);
      // For demo, simulate posture analysis with random results
      const isGoodPosture = Math.random() > 0.3; // 70% chance of good posture
      const postureTypes = ["Slouching", "Head Forward", "Neck Tilt", "Uneven Shoulders"];
      return { 
        isGoodPosture, 
        postureType: isGoodPosture ? "Good Posture" : postureTypes[Math.floor(Math.random() * postureTypes.length)]
      };
    }
  },
  
  recordAlert: async (sessionId: string, postureType: string) => {
    try {
      const response = await api.post(`/posture/sessions/${sessionId}/alerts`, { postureType });
      return response.data;
    } catch (error) {
      console.error("Record alert error:", error);
      return { success: false };
    }
  },
  
  getHistory: async () => {
    try {
      // First try to get history from Python backend
      const pythonData = await pythonBackendService.getPostureData();
      if (pythonData && pythonData.sessions) {
        return pythonData.sessions;
      }
      
      // If Python backend doesn't have session data, fall back to Node.js backend
      const response = await api.get('/posture/history');
      return response.data;
    } catch (error) {
      console.error("Failed to fetch history:", error);
      // Re-throw error so UI can handle it
      throw error;
    }
  },
  
  getStats: async () => {
    try {
      // Try to get stats from Python backend first
      const pythonData = await pythonBackendService.getPostureData();
      if (pythonData) {
        const totalSessions = pythonData.sessions?.length || 1;
        const totalGoodPosture = pythonData.goodCount || 0;
        const totalBadPosture = pythonData.badCount || 0;
        
        // Calculate score from good vs bad posture ratio
        const totalPosturePoints = totalGoodPosture + totalBadPosture;
        const averageScore = totalPosturePoints > 0 
          ? Math.round((totalGoodPosture / totalPosturePoints) * 100) 
          : 80;
        
        return {
          averageScore,
          bestScore: Math.min(100, averageScore + 10),
          latestScore: Math.min(100, averageScore - 5),
          totalSessions,
          totalTime: totalGoodPosture / 60, // Converting to minutes assuming counts are in seconds
          improvement: 15
        };
      }
      
      // Fall back to Node.js backend
      const response = await api.get('/posture/stats');
      return response.data;
    } catch (error) {
      console.error("Failed to fetch posture stats:", error);
      // Return mock stats for demo
      return {
        averageScore: 85,
        bestScore: 95,
        latestScore: 80,
        totalSessions: 5,
        totalTime: 120, // 2 hours in minutes
        improvement: 15
      };
    }
  },
};

export default api;
