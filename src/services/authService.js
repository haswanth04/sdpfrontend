// Auth service to manage JWT token and user info

// User roles - updated to match Spring Boot backend role names
export const ROLES = {
  ADMIN: 'ADMIN',
  EXAMINER: 'EXAMINER',
  USER: 'USER'
};

// Store token in localStorage
export const setToken = (token) => {
  localStorage.setItem('token', token);
};

// Get token from localStorage
export const getToken = () => {
  return localStorage.getItem('token');
};

// Store user info in localStorage
export const setUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

// Get user info from localStorage
export const getUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// Get user role
export const getUserRole = () => {
  const user = getUser();
  return user ? user.role : null;
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return getToken() !== null && getUser() !== null;
};

// Check if user has specific role
export const hasRole = (role) => {
  const userRole = getUserRole();
  return userRole === role;
};

// Check if user is Admin
export const isAdmin = () => {
  return hasRole(ROLES.ADMIN);
};

// Check if user is Examiner
export const isExaminer = () => {
  return hasRole(ROLES.EXAMINER);
};

// Check if user is regular User
export const isUser = () => {
  return hasRole(ROLES.USER);
};

// Login user
export const login = (token, user) => {
  setToken(token);
  setUser(user);
};

// Logout user
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Get home route based on user role
export const getHomeRoute = () => {
  const role = getUserRole();
  
  switch (role) {
    case ROLES.ADMIN:
      return '/admin/dashboard';
    case ROLES.EXAMINER:
      return '/examiner/dashboard';
    case ROLES.USER:
      return '/user/dashboard';
    default:
      return '/login';
  }
};