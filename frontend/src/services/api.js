import axios from 'axios';

const API_BASE_URL = typeof window !== 'undefined' 
  ? window.location.origin 
  : 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Attach JWT token automatically if available
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('phishguard_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
}, (error) => Promise.reject(error));

export const checkHealth = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    return { status: 'offline' };
  }
};

export const loginUser = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const signupUser = async (name, email, password, preferred_language = 'en') => {
  const response = await api.post('/auth/signup', { name, email, password, preferred_language });
  return response.data;
};

export const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const analyzeUrl = async (url) => {
  const response = await api.post('/analyze/url', { url });
  return response.data;
};

export const analyzeMessage = async (message) => {
  const response = await api.post('/analyze/message', { message });
  return response.data;
};

export const analyzeEmailHeader = async (header_text) => {
  const response = await api.post('/analyze/email-header', { header_text });
  return response.data;
};

export const getHistory = async () => {
  const response = await api.get('/history');
  return response.data;
};

export const clearHistory = async () => {
  const response = await api.delete('/history');
  return response.data;
};

export const getAnalytics = async () => {
  const response = await api.get('/analytics');
  return response.data;
};

export const getDemoExamples = async () => {
  const response = await api.get('/demo-examples');
  return response.data;
};

export default api;
