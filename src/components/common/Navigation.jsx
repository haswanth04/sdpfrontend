import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiX, FiMenu } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from './ThemeToggle';

// Import UseAnimations and the needed animations
import UseAnimations from 'react-useanimations';
import homeIcon from 'react-useanimations/lib/activity';
import dashboardIcon from 'react-useanimations/lib/infinity';
import quizIcon from 'react-useanimations/lib/archive';
import quizHistoryIcon from 'react-useanimations/lib/menu4';
import logoutIcon from 'react-useanimations/lib/trash2';
import settingsIcon from 'react-useanimations/lib/settings';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { currentUser, userRole, logout, ROLES } = useAuth();
  const location = useLocation();
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const closeMenu = () => {
    setIsMenuOpen(false);
  };
  
  const handleLogout = () => {
    logout();
    closeMenu();
  };
  
  // Define navigation links based on user role
  const getNavLinks = () => {
    const commonLinks = [
      {
        to: '/',
        icon: <UseAnimations animation={homeIcon} size={24} />,
        label: 'Home',
      },
    ];
    
    // Admin-specific links
    if (userRole === ROLES.ADMIN) {
      return [
        ...commonLinks,
        {
          to: '/admin/dashboard',
          icon: <UseAnimations animation={settingsIcon} size={24} />,
          label: 'Admin Dashboard',
        },
      ];
    }
    
    // Examiner-specific links
    if (userRole === ROLES.EXAMINER) {
      return [
        ...commonLinks,
        {
          to: '/examiner/dashboard',
          icon: <UseAnimations animation={dashboardIcon} size={24} />,
          label: 'Dashboard',
        },
        {
          to: '/examiner/create-quiz',
          icon: <UseAnimations animation={quizIcon} size={24} />,
          label: 'Create Quiz',
        },
        {
          to: '/examiner/view-results',
          icon: <UseAnimations animation={quizHistoryIcon} size={24} />,
          label: 'View Results',
        },
      ];
    }
    
    // User/student links (default)
    return [
      ...commonLinks,
      {
        to: '/user/dashboard',
        icon: <UseAnimations animation={dashboardIcon} size={24} />,
        label: 'Dashboard',
      },
      {
        to: '/user/quizzes',
        icon: <UseAnimations animation={quizIcon} size={24} />,
        label: 'Available Quizzes',
      },
      {
        to: '/user/past-history',
        icon: <UseAnimations animation={quizHistoryIcon} size={24} />,
        label: 'Quiz History',
      },
    ];
  };
  
  const navLinks = getNavLinks();
  
  return (
    <nav className="bg-white dark:bg-dark-bg-secondary shadow dark:shadow-dark-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-primary-600 dark:text-primary-400">
                ExamPro
              </Link>
            </div>
          </div>
          
          {/* Desktop navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                  location.pathname === link.to
                    ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                    : 'text-neutral-600 dark:text-dark-text-secondary hover:bg-neutral-100 dark:hover:bg-dark-bg-tertiary'
                }`}
              >
                {link.icon}
                <span className="ml-2">{link.label}</span>
              </Link>
            ))}
            
            {currentUser && (
              <button
                onClick={handleLogout}
                className="px-3 py-2 rounded-md text-sm font-medium text-error-600 dark:text-error-400 hover:bg-error-100 dark:hover:bg-error-900/20 flex items-center"
              >
                <UseAnimations animation={logoutIcon} size={24} />
                <span className="ml-2">Logout</span>
              </button>
            )}
            
            <div className="ml-4">
              <ThemeToggle />
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <ThemeToggle />
            <button
              onClick={toggleMenu}
              className="ml-2 inline-flex items-center justify-center p-2 rounded-md text-neutral-500 dark:text-dark-text-secondary hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-dark-bg-tertiary focus:outline-none"
            >
              {isMenuOpen ? (
                <FiX className="block h-6 w-6" />
              ) : (
                <FiMenu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden animate-fade-in">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={closeMenu}
                className={`block px-3 py-2 rounded-md text-base font-medium flex items-center ${
                  location.pathname === link.to
                    ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                    : 'text-neutral-600 dark:text-dark-text-secondary hover:bg-neutral-100 dark:hover:bg-dark-bg-tertiary'
                }`}
              >
                {link.icon}
                <span className="ml-2">{link.label}</span>
              </Link>
            ))}
            
            {currentUser && (
              <button
                onClick={handleLogout}
                className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-error-600 dark:text-error-400 hover:bg-error-100 dark:hover:bg-error-900/20 flex items-center"
              >
                <UseAnimations animation={logoutIcon} size={24} />
                <span className="ml-2">Logout</span>
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation; 