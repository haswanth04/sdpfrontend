import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiMenu, FiX, FiLogOut, FiUser } from 'react-icons/fi';
import { logout, getUser, isAdmin, isExaminer, isUser, getHomeRoute } from '../../services/authService';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();
  
  // Toggle mobile menu
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  
  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  // Check if link is active
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  // Get navigation links based on user role
  const getNavLinks = () => {
    if (isAdmin()) {
      return [
        { to: '/admin/dashboard', label: 'Dashboard' }
      ];
    }
    
    if (isExaminer()) {
      return [
        { to: '/examiner/dashboard', label: 'Dashboard' },
        { to: '/examiner/create-quiz', label: 'Create Quiz' },
        { to: '/examiner/view-results', label: 'View Results' }
      ];
    }
    
    if (isUser()) {
      return [
        { to: '/user/dashboard', label: 'Dashboard' },
        { to: '/user/quizzes', label: 'Available Quizzes' },
        { to: '/user/past-history', label: 'Past History' }
      ];
    }
    
    return [];
  };
  
  // If user is not logged in, don't show navbar
  if (!user) {
    return null;
  }
  
  return (
    <nav className="bg-white dark:bg-dark-bg-secondary shadow-md border-b border-neutral-200 dark:border-dark-border-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and desktop navigation */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to={getHomeRoute()}>
                <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400">ExamPro</h1>
              </Link>
            </div>
            
            {/* Desktop navigation */}
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              {getNavLinks().map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={isActive(link.to) ? 'nav-link-active' : 'nav-link'}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          
          {/* User info, theme toggle, and logout */}
          <div className="hidden sm:flex sm:items-center sm:space-x-4">
            <div className="flex items-center text-sm">
              <FiUser className="mr-2 text-neutral-600 dark:text-dark-text-secondary" />
              <span className="font-medium text-neutral-700 dark:text-dark-text-primary mr-4">{user.name || user.email}</span>
            </div>
            
            <ThemeToggle />
            
            <button
              onClick={handleLogout}
              className="flex items-center text-neutral-700 dark:text-dark-text-secondary hover:text-primary-600 dark:hover:text-primary-400"
            >
              <FiLogOut className="mr-1" />
              <span>Logout</span>
            </button>
          </div>
          
          {/* Mobile menu button and theme toggle */}
          <div className="flex items-center space-x-2 sm:hidden">
            <ThemeToggle />
            
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-neutral-500 dark:text-dark-text-secondary hover:text-primary-600 dark:hover:text-primary-400 hover:bg-neutral-100 dark:hover:bg-dark-bg-tertiary focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            >
              <span className="sr-only">{isOpen ? 'Close menu' : 'Open menu'}</span>
              {isOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isOpen && (
        <div className="sm:hidden animate-fade-in">
          <div className="pt-2 pb-3 space-y-1">
            {getNavLinks().map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`block px-3 py-2 text-base font-medium ${
                  isActive(link.to)
                    ? 'text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-dark-bg-tertiary'
                    : 'text-neutral-700 dark:text-dark-text-secondary hover:bg-neutral-100 dark:hover:bg-dark-bg-tertiary hover:text-primary-700 dark:hover:text-primary-400'
                }`}
                onClick={toggleMenu}
              >
                {link.label}
              </Link>
            ))}
          </div>
          
          {/* User info and logout for mobile */}
          <div className="pt-4 pb-3 border-t border-neutral-200 dark:border-dark-border-primary">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <FiUser className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-neutral-800 dark:text-dark-text-primary">{user.name || user.email}</div>
                <div className="text-sm font-medium text-neutral-500 dark:text-dark-text-secondary">{user.role}</div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-base font-medium text-neutral-700 dark:text-dark-text-secondary hover:bg-neutral-100 dark:hover:bg-dark-bg-tertiary hover:text-primary-700 dark:hover:text-primary-400"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;