import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiAward, FiClock, FiCheckCircle, FiBook } from 'react-icons/fi';
import { toast } from 'react-toastify';

import Layout from '../../components/common/Layout';
import PageHeader from '../../components/common/PageHeader';
import UserProfile from '../../components/common/UserProfile';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api';

const UserDashboard = () => {
  const [statistics, setStatistics] = useState({
    totalQuizzes: 0,
    completedQuizzes: 0,
    averageScore: 0,
    bestScore: 0
  });
  const [recentQuizzes, setRecentQuizzes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { currentUser } = useAuth();
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch user's quiz history
        const historyResponse = await apiService.getUserHistory();
        const historyData = historyResponse.data;
        
        // Calculate statistics from history data
        if (historyData && historyData.length > 0) {
          const completedQuizzes = historyData.length;
          
          // Calculate scores
          const scores = historyData.map(item => item.score || 0);
          const averageScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
          const bestScore = Math.max(...scores);
          
          // Fetch available quizzes to get total count
          const quizzesResponse = await apiService.getAvailableQuizzes();
          const totalQuizzes = quizzesResponse.data.length;
          
          setStatistics({
            totalQuizzes,
            completedQuizzes,
            averageScore,
            bestScore
          });
          
          // Get most recent quizzes (sort by completion date)
          const sortedQuizzes = [...historyData].sort((a, b) => {
            return new Date(b.completedAt) - new Date(a.completedAt);
          });
          
          setRecentQuizzes(sortedQuizzes.slice(0, 3).map(item => ({
            id: item.id,
            title: item.quiz.title,
            completedAt: item.completedAt,
            score: item.score,
            totalQuestions: item.quiz.questionCount || 0
          })));
        } else {
          // If no history, just get the total available quizzes
          const quizzesResponse = await apiService.getAvailableQuizzes();
          setStatistics({
            ...statistics,
            totalQuizzes: quizzesResponse.data.length
          });
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  return (
    <Layout>
      <div className="animate-fade-in">
        <PageHeader
          title={`Welcome, ${currentUser?.name || 'Student'}`}
          subtitle="View your progress and available quizzes"
        />
        
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent"></div>
            <p className="mt-2 text-neutral-600 dark:text-dark-text-secondary">Loading your dashboard...</p>
          </div>
        ) : (
          <>
            {/* User profile and statistics in grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* User profile */}
              <div className="lg:col-span-1">
                <UserProfile />
              </div>
              
              {/* Statistics */}
              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 h-full">
                  <div className="bg-white dark:bg-dark-bg-secondary shadow dark:shadow-dark-lg rounded-lg p-6 flex items-center">
                    <div className="rounded-full bg-primary-100 dark:bg-primary-900/30 p-3 mr-4">
                      <FiBook className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                      <p className="text-sm font-medium text-neutral-600 dark:text-dark-text-secondary">Total Quizzes</p>
                      <p className="text-2xl font-bold text-neutral-900 dark:text-white">{statistics.totalQuizzes}</p>
                </div>
              </div>
              
                  <div className="bg-white dark:bg-dark-bg-secondary shadow dark:shadow-dark-lg rounded-lg p-6 flex items-center">
                    <div className="rounded-full bg-success-100 dark:bg-success-900/30 p-3 mr-4">
                      <FiCheckCircle className="h-6 w-6 text-success-600 dark:text-success-400" />
                </div>
                <div>
                      <p className="text-sm font-medium text-neutral-600 dark:text-dark-text-secondary">Completed</p>
                      <p className="text-2xl font-bold text-neutral-900 dark:text-white">{statistics.completedQuizzes}</p>
                </div>
              </div>
              
                  <div className="bg-white dark:bg-dark-bg-secondary shadow dark:shadow-dark-lg rounded-lg p-6 flex items-center">
                    <div className="rounded-full bg-primary-100 dark:bg-primary-900/30 p-3 mr-4">
                      <FiClock className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                      <p className="text-sm font-medium text-neutral-600 dark:text-dark-text-secondary">Average Score</p>
                      <p className="text-2xl font-bold text-neutral-900 dark:text-white">{statistics.averageScore}%</p>
                </div>
              </div>
              
                  <div className="bg-white dark:bg-dark-bg-secondary shadow dark:shadow-dark-lg rounded-lg p-6 flex items-center">
                    <div className="rounded-full bg-warning-100 dark:bg-warning-900/30 p-3 mr-4">
                      <FiAward className="h-6 w-6 text-warning-600 dark:text-warning-400" />
                </div>
                <div>
                      <p className="text-sm font-medium text-neutral-600 dark:text-dark-text-secondary">Best Score</p>
                      <p className="text-2xl font-bold text-neutral-900 dark:text-white">{statistics.bestScore}%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Link
                to="/user/quizzes"
                className="bg-white dark:bg-dark-bg-secondary shadow dark:shadow-dark-lg rounded-lg p-6 hover:shadow-md dark:hover:bg-dark-bg-tertiary transition-all duration-200"
              >
                <h2 className="text-xl font-semibold text-neutral-800 dark:text-white mb-2">Available Quizzes</h2>
                <p className="text-neutral-600 dark:text-dark-text-secondary mb-4">View and take available quizzes</p>
                <div className="mt-2 inline-flex items-center text-primary-600 dark:text-primary-400">
                  Explore quizzes <span className="ml-2">→</span>
                </div>
              </Link>
              
              <Link
                to="/user/past-history"
                className="bg-white dark:bg-dark-bg-secondary shadow dark:shadow-dark-lg rounded-lg p-6 hover:shadow-md dark:hover:bg-dark-bg-tertiary transition-all duration-200"
              >
                <h2 className="text-xl font-semibold text-neutral-800 dark:text-white mb-2">Past History</h2>
                <p className="text-neutral-600 dark:text-dark-text-secondary mb-4">View your quiz history and results</p>
                <div className="mt-2 inline-flex items-center text-primary-600 dark:text-primary-400">
                  View history <span className="ml-2">→</span>
                </div>
              </Link>
            </div>
            
            {/* Recent Quizzes */}
            <div className="bg-white dark:bg-dark-bg-secondary shadow dark:shadow-dark-lg rounded-lg overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-neutral-800 dark:text-white mb-6">Recent Activity</h2>
                
                {recentQuizzes.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-neutral-600 dark:text-dark-text-secondary mb-4">You haven't taken any quizzes yet</p>
                    <Link
                      to="/user/quizzes"
                      className="btn-primary inline-flex items-center"
                    >
                      Take Your First Quiz
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentQuizzes.map((quiz) => (
                      <div
                        key={quiz.id}
                        className="border dark:border-dark-border-primary rounded-lg p-4 hover:bg-neutral-50 dark:hover:bg-dark-bg-tertiary transition-colors duration-200"
                      >
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                          <div>
                            <h3 className="font-medium text-neutral-900 dark:text-white">{quiz.title}</h3>
                            <p className="text-sm text-neutral-500 dark:text-dark-text-secondary">
                              Completed on {formatDate(quiz.completedAt)}
                            </p>
                          </div>
                          <div className="mt-2 sm:mt-0 flex items-center">
                            <div
                              className={`h-2 rounded-full mr-2 ${
                                quiz.score >= 80
                                  ? 'bg-success-500'
                                  : quiz.score >= 60
                                  ? 'bg-warning-500'
                                  : 'bg-error-500'
                              }`}
                              style={{ width: `${quiz.score / 2}px` }}
                            ></div>
                            <span
                              className={`text-sm font-medium ${
                                quiz.score >= 80
                                  ? 'text-success-700 dark:text-success-400'
                                  : quiz.score >= 60
                                  ? 'text-warning-700 dark:text-warning-400'
                                  : 'text-error-700 dark:text-error-400'
                              }`}
                            >
                              {quiz.score}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <div className="text-center mt-4">
                      <Link
                        to="/user/past-history"
                        className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
                      >
                        View all history →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default UserDashboard;