import axios from 'axios';
import { toast } from 'react-toastify';
import { getToken, logout } from './authService';

// Create axios instance with default config
const api = axios.create({
  baseURL: 'https://springbootsdpexaminationsystem.up.railway.app/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response } = error;
    
    // Handle specific HTTP status codes
    if (response) {
      switch (response.status) {
        case 401: // Unauthorized
          toast.error('Session expired. Please login again.');
          logout();
          window.location.href = '/login';
          break;
        case 403: // Forbidden
          toast.error('You do not have permission to perform this action.');
          break;
        case 404: // Not Found
          toast.error('Resource not found.');
          break;
        case 500: // Server Error
          toast.error('Server error. Please try again later.');
          break;
        default:
          if (response.data && response.data.message) {
            toast.error(response.data.message);
          } else {
            toast.error('Something went wrong. Please try again.');
          }
      }
    } else {
      // Network error or server not responding
      toast.error('Network error. Please check your connection.');
    }
    
    return Promise.reject(error);
  }
);

// API service methods
const apiService = {
  // Auth endpoints
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  
  // Admin endpoints
  getUsers: () => api.get('/admin/users'),
  updateUserStatus: (userId, active) => api.put(`/admin/users/${userId}/status`, { active }),
  getExaminers: () => api.get('/admin/examiners'),
  assignExaminer: (userId, examinerId) => api.post(`/admin/users/${userId}/assign-examiner`, { examinerId }),
  getPendingExaminers: () => api.get('/admin/pending-examiners'),
  approveExaminer: (examinerId) => api.post(`/admin/examiners/${examinerId}/approve`),
  rejectExaminer: (examinerId) => api.post(`/admin/examiners/${examinerId}/reject`),
  
  // Examiner endpoints
  getExaminerQuizzes: () => api.get('/examiner/quizzes'),
  createQuiz: (quizData) => api.post('/examiner/create-quiz', quizData),
  getQuizResults: (quizId) => api.get(`/examiner/quizzes/${quizId}/results`),
  exportQuizResults: (quizId) => api.get(`/examiner/quizzes/${quizId}/export-csv`, { responseType: 'blob' }),
  
  // User endpoints
  getAvailableQuizzes: () => api.get('/user/quizzes'),
  getQuizDetails: (quizId) => api.get(`/user/quizzes/${quizId}`),
  submitQuiz: (quizId, answers) => api.post(`/user/submit-quiz/${quizId}`, { answers }),
  getUserHistory: () => api.get('/user/history')
};

export default apiService;