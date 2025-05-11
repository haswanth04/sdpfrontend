import { Routes, Route, Navigate } from 'react-router-dom';
import { ROLES } from './services/authService';
import { QuizProvider } from './context/QuizContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';

// Common Components
import ProtectedRoute from './components/common/ProtectedRoute';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';

// Examiner Pages
import ExaminerDashboard from './pages/examiner/ExaminerDashboard';
import CreateQuizPage from './pages/examiner/CreateQuizPage';
import ViewResultsPage from './pages/examiner/ViewResultsPage';

// User Pages
import UserDashboard from './pages/user/UserDashboard';
import QuizzesPage from './pages/user/QuizzesPage';
import TakeQuizPage from './pages/user/TakeQuizPage';
import PastHistoryPage from './pages/user/PastHistoryPage';

// App routes with conditional redirects
const AppRoutes = () => {
  const { isAuthenticated, getHomeRoute } = useAuth();
  
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* Protected Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Route>
      
      {/* Protected Examiner Routes */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.EXAMINER]} />}>
        <Route path="/examiner/dashboard" element={<ExaminerDashboard />} />
        <Route path="/examiner/create-quiz" element={<CreateQuizPage />} />
        <Route path="/examiner/view-results" element={<ViewResultsPage />} />
      </Route>
      
      {/* Protected User Routes */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.USER]} />}>
        <Route path="/user/dashboard" element={<UserDashboard />} />
        <Route path="/user/quizzes" element={<QuizzesPage />} />
        <Route path="/user/take-quiz/:quizId" element={<TakeQuizPage />} />
        <Route path="/user/past-history" element={<PastHistoryPage />} />
      </Route>
      
      {/* Redirect to role-specific dashboard if authenticated */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to={getHomeRoute()} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      
      {/* Fallback route - redirect to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <QuizProvider>
          <AppRoutes />
        </QuizProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;