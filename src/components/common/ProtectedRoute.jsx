import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Component for protecting routes based on authentication and roles
const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, hasAnyRole } = useAuth();
  
  // If no specific roles are required, just check authentication
  if (!allowedRoles) {
    return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
  }
  
  // Check if user has any of the allowed roles
  const hasAllowedRole = hasAnyRole(allowedRoles);
  
  // If user is authenticated and has an allowed role, render the route
  if (isAuthenticated && hasAllowedRole) {
    return <Outlet />;
  }
  
  // If user is authenticated but doesn't have the required role, redirect to home
  if (isAuthenticated) {
    return <Navigate to="/" />;
  }
  
  // Otherwise, redirect to login
  return <Navigate to="/login" />;
};

export default ProtectedRoute;