import { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';

// Create context
const QuizContext = createContext();

// Context provider component
export const QuizProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [availableQuizzes, setAvailableQuizzes] = useState([]);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [userHistory, setUserHistory] = useState([]);
  const [loading, setLoading] = useState({
    quizzes: false,
    history: false,
    currentQuiz: false
  });
  const [error, setError] = useState({
    quizzes: null,
    history: null,
    currentQuiz: null
  });

  // Load quizzes from session storage on initial load
  useEffect(() => {
    if (isAuthenticated) {
      const storedQuizzes = sessionStorage.getItem('availableQuizzes');
      if (storedQuizzes) {
        setAvailableQuizzes(JSON.parse(storedQuizzes));
      }
      
      const storedHistory = sessionStorage.getItem('userHistory');
      if (storedHistory) {
        setUserHistory(JSON.parse(storedHistory));
      }
    } else {
      // Clear data if not authenticated
      clearQuizData();
    }
  }, [isAuthenticated]);

  // Fetch available quizzes
  const fetchAvailableQuizzes = async () => {
    if (!isAuthenticated) return [];
    
    setLoading(prev => ({ ...prev, quizzes: true }));
    setError(prev => ({ ...prev, quizzes: null }));
    
    try {
      const response = await apiService.getAvailableQuizzes();
      console.log('Fetched quizzes:', response.data);
      setAvailableQuizzes(response.data);
      
      // Store in session storage
      sessionStorage.setItem('availableQuizzes', JSON.stringify(response.data));
      return response.data;
    } catch (err) {
      console.error('Error fetching quizzes:', err);
      setError(prev => ({ ...prev, quizzes: 'Failed to load quizzes' }));
      toast.error('Failed to load available quizzes');
      return [];
    } finally {
      setLoading(prev => ({ ...prev, quizzes: false }));
    }
  };

  // Fetch quiz details by ID
  const fetchQuizById = async (quizId) => {
    if (!isAuthenticated) return null;
    
    setLoading(prev => ({ ...prev, currentQuiz: true }));
    setError(prev => ({ ...prev, currentQuiz: null }));
    
    try {
      // Check if the quiz exists in our available quizzes first
      const quizExists = availableQuizzes.some(quiz => quiz.id === Number(quizId));
      
      if (!quizExists) {
        console.warn(`Quiz ID ${quizId} not found in available quizzes. Refreshing quiz list.`);
        await fetchAvailableQuizzes();
      }
      
      const response = await apiService.getQuizDetails(quizId);
      console.log('Fetched quiz details:', response.data);
      setCurrentQuiz(response.data);
      return response.data;
    } catch (err) {
      console.error(`Error fetching quiz details for ID ${quizId}:`, err);
      
      // Get the error message from the response if available
      const errorMessage = err.response?.data?.message || 'Failed to load quiz details';
      setError(prev => ({ ...prev, currentQuiz: errorMessage }));
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(prev => ({ ...prev, currentQuiz: false }));
    }
  };

  // Fetch user quiz history
  const fetchUserHistory = async () => {
    if (!isAuthenticated) return [];
    
    setLoading(prev => ({ ...prev, history: true }));
    setError(prev => ({ ...prev, history: null }));
    
    try {
      const response = await apiService.getUserHistory();
      console.log('Fetched user history:', response.data);
      setUserHistory(response.data);
      
      // Store in session storage
      sessionStorage.setItem('userHistory', JSON.stringify(response.data));
      return response.data;
    } catch (err) {
      console.error('Error fetching user history:', err);
      setError(prev => ({ ...prev, history: 'Failed to load quiz history' }));
      toast.error('Failed to load quiz history');
      return [];
    } finally {
      setLoading(prev => ({ ...prev, history: false }));
    }
  };

  // Submit quiz answers
  const submitQuiz = async (quizId, answers) => {
    if (!isAuthenticated) {
      toast.error('You must be logged in to submit a quiz');
      throw new Error('Not authenticated');
    }
    
    try {
      // Make sure we're sending the answers array directly as expected by the backend
      // The backend expects answers to be a list of objects with questionId and answer fields
      const payload = { answers: Array.isArray(answers) ? answers : answers.answers };
      const response = await apiService.submitQuiz(quizId, payload);
      console.log('Quiz submission result:', response.data);
      
      // Refresh history after submission
      await fetchUserHistory();
      
      return response.data;
    } catch (err) {
      console.error('Error submitting quiz:', err);
      toast.error('Failed to submit quiz');
      throw err;
    }
  };

  // Clear quiz data (e.g., when logging out)
  const clearQuizData = () => {
    setAvailableQuizzes([]);
    setCurrentQuiz(null);
    setUserHistory([]);
    sessionStorage.removeItem('availableQuizzes');
    sessionStorage.removeItem('userHistory');
  };

  const value = {
    availableQuizzes,
    currentQuiz,
    userHistory,
    loading,
    error,
    fetchAvailableQuizzes,
    fetchQuizById,
    fetchUserHistory,
    submitQuiz,
    clearQuizData
  };

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
};

// Custom hook to use the quiz context
export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
};

export default QuizContext; 