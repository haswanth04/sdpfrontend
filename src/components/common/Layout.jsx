import Navigation from './Navigation';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTheme } from '../../context/ThemeContext';

const Layout = ({ children }) => {
  const { theme } = useTheme();
  
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-dark-bg-primary">
      <Navigation />
      <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
        {children}
      </main>
      <footer className="bg-neutral-100 py-6 dark:bg-dark-bg-secondary">
        <div className="container mx-auto px-4 text-center text-neutral-600 dark:text-dark-text-secondary">
          <p>© {new Date().getFullYear()} ExamPro Online Examination System</p>
        </div>
      </footer>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={theme}
      />
    </div>
  );
};

export default Layout;