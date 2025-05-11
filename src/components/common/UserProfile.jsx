import { useState } from 'react';
import { FiUser, FiMail, FiKey, FiClock } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const UserProfile = () => {
  const { currentUser, userRole, ROLES } = useAuth();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  
  if (!currentUser) {
    return null;
  }
  
  // Format role for display
  const formatRole = (role) => {
    switch (role) {
      case ROLES.ADMIN:
        return 'Administrator';
      case ROLES.EXAMINER:
        return 'Examiner';
      case ROLES.USER:
        return 'Student';
      default:
        return role;
    }
  };
  
  return (
    <div className="bg-white dark:bg-dark-bg-secondary rounded-lg shadow dark:shadow-dark-lg p-6">
      <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-6">User Profile</h2>
      
      <div className="space-y-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 mt-1">
            <FiUser className="h-5 w-5 text-primary-500 dark:text-primary-400" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-neutral-500 dark:text-dark-text-secondary">Full Name</p>
            <p className="text-base text-neutral-900 dark:text-white">{currentUser.name}</p>
          </div>
        </div>
        
        <div className="flex items-start">
          <div className="flex-shrink-0 mt-1">
            <FiMail className="h-5 w-5 text-primary-500 dark:text-primary-400" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-neutral-500 dark:text-dark-text-secondary">Email Address</p>
            <p className="text-base text-neutral-900 dark:text-white">{currentUser.email}</p>
          </div>
        </div>
        
        <div className="flex items-start">
          <div className="flex-shrink-0 mt-1">
            <FiKey className="h-5 w-5 text-primary-500 dark:text-primary-400" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-neutral-500 dark:text-dark-text-secondary">Role</p>
            <p className="text-base text-neutral-900 dark:text-white">{formatRole(userRole)}</p>
          </div>
        </div>
        
        {currentUser.createdAt && (
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-1">
              <FiClock className="h-5 w-5 text-primary-500 dark:text-primary-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-500 dark:text-dark-text-secondary">Member Since</p>
              <p className="text-base text-neutral-900 dark:text-white">
                {new Date(currentUser.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-6 pt-6 border-t dark:border-dark-border-primary">
        <p className="text-sm text-neutral-500 dark:text-dark-text-tertiary">
          Your account is{' '}
          <span className="text-success-600 dark:text-success-400 font-medium">active</span>.
          If you need assistance with your account, please contact support.
        </p>
      </div>
    </div>
  );
};

export default UserProfile; 