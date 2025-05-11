import { useState, useEffect } from 'react';
import { FiSearch, FiCalendar, FiClock, FiFileText, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';
import { toast } from 'react-toastify';

import Layout from '../../components/common/Layout';
import PageHeader from '../../components/common/PageHeader';
import { useQuiz } from '../../context/QuizContext';

const PastHistoryPage = () => {
  const { userHistory, loading, error, fetchUserHistory } = useQuiz();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedQuiz, setExpandedQuiz] = useState(null);
  
  useEffect(() => {
    // Only fetch if we don't already have history in context
    if (userHistory.length === 0) {
      fetchUserHistory();
    }
  }, [userHistory.length, fetchUserHistory]);
  
  // Toggle expanded quiz details
  const toggleExpandQuiz = (quizId) => {
    setExpandedQuiz(expandedQuiz === quizId ? null : quizId);
  };
  
  // Calculate completion time in minutes (difference between started and completed)
  const calculateCompletionTime = (startedAt, completedAt) => {
    if (!startedAt || !completedAt) return 'N/A';
    const start = new Date(startedAt);
    const end = new Date(completedAt);
    const diffInMinutes = Math.round((end - start) / (1000 * 60));
    return diffInMinutes;
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Handle refresh button click
  const handleRefresh = () => {
    fetchUserHistory();
    toast.info('Refreshing quiz history...');
  };
  
  // Filter history based on search term
  const filteredHistory = userHistory.filter((item) =>
    item.quiz?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <Layout>
      <div className="animate-fade-in">
        <PageHeader
          title="Quiz History"
          subtitle="View your past quiz attempts and results"
          backLink="/user/dashboard"
          backLabel="Back to Dashboard"
        />
        
        <div className="bg-white dark:bg-dark-bg-secondary shadow dark:shadow-dark-lg rounded-lg overflow-hidden mb-8">
          <div className="p-6">
            <div className="mb-6 flex flex-col md:flex-row gap-4 justify-between">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-neutral-400 dark:text-dark-text-tertiary" />
                </div>
                <input
                  type="text"
                  className="form-input pl-10 w-full"
                  placeholder="Search history..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <button
                onClick={handleRefresh}
                className="btn-secondary flex items-center justify-center px-4 py-2"
                disabled={loading.history}
              >
                {loading.history ? (
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-neutral-300 dark:border-neutral-600 border-t-transparent mr-2"></div>
                ) : (
                  <FiRefreshCw className="mr-2" />
                )}
                {loading.history ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
            
            {loading.history && userHistory.length === 0 ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent"></div>
                <p className="mt-2 text-neutral-600 dark:text-dark-text-secondary">Loading history...</p>
              </div>
            ) : error.history ? (
              <div className="text-center py-8 text-error-600 dark:text-error-400">
                <FiAlertCircle className="h-8 w-8 mx-auto mb-2" />
                <p>{error.history}</p>
                <button 
                  onClick={handleRefresh}
                  className="mt-4 px-4 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded hover:bg-primary-700 dark:hover:bg-primary-800"
                >
                  Try Again
                </button>
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="text-center py-8">
                {searchTerm ? (
                  <p className="text-neutral-600 dark:text-dark-text-secondary">No quiz history found matching "{searchTerm}"</p>
                ) : (
                  <>
                    <p className="text-neutral-600 dark:text-dark-text-secondary mb-4">You haven't taken any quizzes yet</p>
                    <a
                      href="/user/quizzes"
                      className="btn-primary inline-flex items-center"
                    >
                      Take Your First Quiz
                    </a>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {filteredHistory.map((item) => (
                  <div
                    key={item.id}
                    className="border dark:border-dark-border-primary rounded-lg overflow-hidden hover:shadow-sm dark:hover:shadow-dark-sm transition-shadow duration-200"
                  >
                    <div className="p-6">
                      <div onClick={() => toggleExpandQuiz(item.id)} className="cursor-pointer">
                        <div className="sm:flex sm:items-center sm:justify-between">
                          <div>
                            <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-1">
                              {item.quiz?.title || 'Untitled Quiz'}
                            </h3>
                            <div className="flex flex-wrap gap-4 text-sm text-neutral-500 dark:text-dark-text-secondary">
                              <div className="flex items-center">
                                <FiCalendar className="mr-1 text-neutral-400 dark:text-dark-text-tertiary" />
                                <span>{formatDate(item.completedAt)}</span>
                              </div>
                              
                              <div className="flex items-center">
                                <FiClock className="mr-1 text-neutral-400 dark:text-dark-text-tertiary" />
                                <span>
                                  {calculateCompletionTime(item.startedAt, item.completedAt)} Minutes
                                </span>
                              </div>
                              
                              <div className="flex items-center">
                                <FiFileText className="mr-1 text-neutral-400 dark:text-dark-text-tertiary" />
                                <span>{item.quiz?.questionCount || '?'} Questions</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-4 sm:mt-0">
                            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                              item.score >= 80
                                ? 'bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-300'
                                : item.score >= 60
                                ? 'bg-warning-100 text-warning-800 dark:bg-warning-900/30 dark:text-warning-300'
                                : 'bg-error-100 text-error-800 dark:bg-error-900/30 dark:text-error-300'
                            }`}>
                              Score: {item.score}%
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {expandedQuiz === item.id && (
                        <div className="mt-6 pt-6 border-t dark:border-t-dark-border-primary animate-fade-in">
                          <div className="text-center text-sm text-neutral-600 dark:text-dark-text-secondary">
                            <p>Quiz completed on {formatDate(item.completedAt)}</p>
                            <p className="mt-2">Your final score: {item.score}%</p>
                            <p className="mt-2">
                              Created by: {item.quiz?.examiner || 'Unknown'}
                            </p>
                            <p className="mt-4 text-neutral-500 dark:text-dark-text-tertiary">
                              For detailed feedback, please contact your examiner.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PastHistoryPage;