
import axios from 'axios';
import { toast } from '@/hooks/use-toast';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
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
        description: response.data.message || 'Something went wrong',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Network Error',
        description: 'Unable to connect to the server',
        variant: 'destructive',
      });
    }
    
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  register: async (userData: { name: string; email: string; password: string }) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  
  getCurrentUser: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

// Posture services
export const postureService = {
  startSession: async () => {
    const response = await api.post('/posture/sessions');
    return response.data;
  },
  
  endSession: async (sessionId: string, data: { totalAlerts: number; incorrectPostures: string[]; postureScore: number }) => {
    const response = await api.put(`/posture/sessions/${sessionId}/end`, data);
    return response.data;
  },
  
  analyzePosture: async (sessionId: string, imageData: string) => {
    const response = await api.post('/posture/analyze', { sessionId, imageData });
    return response.data;
  },
  
  recordAlert: async (sessionId: string, postureType: string) => {
    const response = await api.post(`/posture/sessions/${sessionId}/alerts`, { postureType });
    return response.data;
  },
  
  getHistory: async () => {
    const response = await api.get('/posture/history');
    return response.data;
  },
  
  getStats: async () => {
    const response = await api.get('/posture/stats');
    return response.data;
  },
};

export default api;
