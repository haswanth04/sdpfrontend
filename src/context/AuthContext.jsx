import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import apiService from '../services/api';
import * as authService from '../services/authService';

// Create the context
const AuthContext = createContext();

// Context provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load user data from localStorage on initial load
  useEffect(() => {
    const loadUserFromStorage = () => {
      const user = authService.getUser();
      const authenticated = authService.isAuthenticated();
      
      setCurrentUser(user);
      setUserRole(user?.role || null);
      setIsAuthenticated(authenticated);
      setIsLoading(false);
    };

    loadUserFromStorage();
  }, []);

  // Login function
  const login = async (credentials) => {
    setIsLoading(true);
    try {
      // Pass the credentials to the API (without captchaToken)
      const response = await apiService.login(credentials);
      const { token, user } = response.data;
      
      // Save in localStorage via authService
      authService.login(token, user);
      
      // Update state
      setCurrentUser(user);
      setUserRole(user.role);
      setIsAuthenticated(true);
      
      toast.success('Login successful!');
      return { success: true, role: user.role };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(errorMessage);
      console.error('Login error:', error);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    setIsLoading(true);
    try {
      const response = await apiService.register(userData);
      toast.success('Registration successful! Please log in.');
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(errorMessage);
      console.error('Registration error:', error);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    authService.logout();
    setCurrentUser(null);
    setUserRole(null);
    setIsAuthenticated(false);
    toast.info('You have been logged out');
  };

  // Check if user has a specific role
  const hasRole = (role) => {
    return userRole === role;
  };

  // Check if user has any of the provided roles
  const hasAnyRole = (roles) => {
    return roles.some(role => userRole === role);
  };

  // Get home route based on user role
  const getHomeRoute = () => {
    return authService.getHomeRoute();
  };

  const value = {
    currentUser,
    userRole,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    hasRole,
    hasAnyRole,
    getHomeRoute,
    ROLES: authService.ROLES // Export roles from the context
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 