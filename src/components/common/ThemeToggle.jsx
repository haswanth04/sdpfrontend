import { useState, useEffect } from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // After mounting, we can safely show the toggle
  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent SSR issues with theme
  if (!mounted) return null;

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      className={`p-2 rounded-full transition-colors ${
        theme === 'light'
          ? 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
          : 'bg-dark-bg-tertiary text-dark-text-primary hover:bg-neutral-700'
      } ${className}`}
    >
      {theme === 'light' ? (
        <FiMoon className="w-5 h-5" />
      ) : (
        <FiSun className="w-5 h-5" />
      )}
    </button>
  );
};

export default ThemeToggle; 