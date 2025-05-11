import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { FiChevronDown, FiChevronRight, FiDownload } from 'react-icons/fi';
import { toast } from 'react-toastify';

import Layout from '../../components/common/Layout';
import PageHeader from '../../components/common/PageHeader';
import apiService from '../../services/api';
import { getToken } from '../../services/authService';

const ViewResultsPage = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [results, setResults] = useState([]);
  const [statistics, setStatistics] = useState({ 
    averageScore: 0, 
    highestScore: 0, 
    lowestScore: 0, 
    title: '' 
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [expandedUsers, setExpandedUsers] = useState({});
  
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const quizIdFromUrl = searchParams.get('quizId');
  
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await apiService.getExaminerQuizzes();
        setQuizzes(response.data);
        
        // If quiz ID is provided in URL, fetch its results
        if (quizIdFromUrl) {
          const quiz = response.data.find((q) => q.id.toString() === quizIdFromUrl);
          if (quiz) {
            setSelectedQuiz(quiz);
            fetchQuizResults(quiz.id);
          }
        }
      } catch (error) {
        console.error('Failed to fetch quizzes:', error);
        toast.error('Failed to load quizzes');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchQuizzes();
  }, [quizIdFromUrl]);
  
  const fetchQuizResults = async (quizId) => {
    setIsLoadingResults(true);
    
    try {
      const response = await apiService.getQuizResults(quizId);
      const data = response.data;
      
      // Set statistics
      setStatistics({
        averageScore: data.statistics.averageScore,
        highestScore: data.statistics.highestScore,
        lowestScore: data.statistics.lowestScore,
        title: data.statistics.title
      });
      
      // Set results
      setResults(data.attempts || []);
    } catch (error) {
      console.error('Failed to fetch quiz results:', error);
      toast.error('Failed to load quiz results');
    } finally {
      setIsLoadingResults(false);
    }
  };
  
  const handleQuizSelect = (quiz) => {
    setSelectedQuiz(quiz);
    fetchQuizResults(quiz.id);
    
    // Update URL with selected quiz ID
    const newUrl = `${window.location.pathname}?quizId=${quiz.id}`;
    window.history.pushState({ path: newUrl }, '', newUrl);
  };
  
  const toggleUserExpand = (userId) => {
    setExpandedUsers({
      ...expandedUsers,
      [userId]: !expandedUsers[userId],
    });
  };
  
  const exportResults = async () => {
    try {
      if (!selectedQuiz) return;
      
      // Show loading state
      setIsLoadingResults(true);
      
      // Use API service to get the CSV data
      const response = await apiService.exportQuizResults(selectedQuiz.id);
      
      // Create a Blob from the response data
      const blob = new Blob([response.data], { type: 'text/csv' });
      
      // Create a URL for the Blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary anchor element
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedQuiz.title}_results.csv`;
      
      // Append to body, click, and remove
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Clean up by revoking the URL
      window.URL.revokeObjectURL(url);
      
      toast.success('Results exported successfully');
    } catch (error) {
      console.error('Failed to export results:', error);
      toast.error('Failed to export results');
    } finally {
      setIsLoadingResults(false);
    }
  };
  
  // Format timestamp to readable date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  return (
    <Layout>
      <div className="animate-fade-in">
        <PageHeader
          title="View Quiz Results"
          subtitle="View detailed results for your quizzes"
          backLink="/examiner/dashboard"
          backLabel="Back to Dashboard"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <div className="bg-white dark:bg-dark-bg-secondary shadow dark:shadow-dark-lg rounded-lg overflow-hidden h-full">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-neutral-800 dark:text-white mb-6">Your Quizzes</h2>
                
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent"></div>
                    <p className="mt-2 text-neutral-600 dark:text-dark-text-secondary">Loading quizzes...</p>
                  </div>
                ) : quizzes.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-neutral-600 dark:text-dark-text-secondary mb-4">No quizzes found</p>
                    <Link
                      to="/examiner/create-quiz"
                      className="btn-primary inline-flex items-center"
                    >
                      Create New Quiz
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {quizzes.map((quiz) => (
                      <button
                        key={quiz.id}
                        onClick={() => handleQuizSelect(quiz)}
                        className={`w-full text-left px-4 py-3 rounded-md transition-colors ${
                          selectedQuiz?.id === quiz.id
                            ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300'
                            : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-800 dark:bg-dark-bg-tertiary dark:hover:bg-dark-bg-tertiary/80 dark:text-dark-text-primary'
                        }`}
                      >
                        {quiz.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="md:col-span-2">
            {selectedQuiz ? (
              <div className="bg-white dark:bg-dark-bg-secondary shadow dark:shadow-dark-lg rounded-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-neutral-800 dark:text-white">
                      Results: {statistics.title || selectedQuiz.title}
                    </h2>
                    
                    <button
                      onClick={exportResults}
                      className="btn-outline inline-flex items-center"
                    >
                      <FiDownload className="mr-2" />
                      Export CSV
                    </button>
                  </div>
                  
                  {isLoadingResults ? (
                    <div className="text-center py-8">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent"></div>
                      <p className="mt-2 text-neutral-600 dark:text-dark-text-secondary">Loading results...</p>
                    </div>
                  ) : results.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-neutral-600 dark:text-dark-text-secondary">No results found for this quiz</p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-primary-50 dark:bg-primary-900/30 p-4 rounded-lg">
                          <h3 className="text-sm font-medium text-neutral-500 dark:text-dark-text-secondary mb-1">Average Score</h3>
                          <p className="text-2xl font-bold text-primary-700 dark:text-primary-300">{statistics.averageScore.toFixed(1)}%</p>
                        </div>
                        <div className="bg-success-50 dark:bg-success-900/30 p-4 rounded-lg">
                          <h3 className="text-sm font-medium text-neutral-500 dark:text-dark-text-secondary mb-1">Highest Score</h3>
                          <p className="text-2xl font-bold text-success-700 dark:text-success-300">{statistics.highestScore}%</p>
                        </div>
                        <div className="bg-warning-50 dark:bg-warning-900/30 p-4 rounded-lg">
                          <h3 className="text-sm font-medium text-neutral-500 dark:text-dark-text-secondary mb-1">Lowest Score</h3>
                          <p className="text-2xl font-bold text-warning-700 dark:text-warning-300">{statistics.lowestScore}%</p>
                        </div>
                      </div>
                      
                      <div className="overflow-x-auto">
                        <table className="min-w-full bg-white dark:bg-dark-bg-secondary">
                          <thead>
                            <tr className="bg-neutral-50 dark:bg-dark-bg-tertiary border-b dark:border-dark-border-primary">
                              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-dark-text-secondary uppercase tracking-wider">Student</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-dark-text-secondary uppercase tracking-wider">Score</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-dark-text-secondary uppercase tracking-wider">Time</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-dark-text-secondary uppercase tracking-wider">Submitted</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-dark-text-secondary uppercase tracking-wider">Details</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-200 dark:divide-dark-border-primary">
                            {results.map((result) => (
                              <>
                                <tr key={result.id} className="hover:bg-neutral-50 dark:hover:bg-dark-bg-tertiary">
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900 dark:text-white">
                                    {result.user?.name || result.user?.email || 'Anonymous'}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        result.score >= 80
                                          ? 'bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-300'
                                          : result.score >= 60
                                          ? 'bg-warning-100 text-warning-800 dark:bg-warning-900/30 dark:text-warning-300'
                                          : 'bg-error-100 text-error-800 dark:bg-error-900/30 dark:text-error-300'
                                      }`}
                                    >
                                      {result.score}%
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-dark-text-secondary">
                                    {result.timeTaken} min
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-dark-text-secondary">
                                    {formatDate(result.completedAt)}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <button
                                      onClick={() => toggleUserExpand(result.id)}
                                      className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 inline-flex items-center"
                                    >
                                      {expandedUsers[result.id] ? <FiChevronDown className="mr-1" /> : <FiChevronRight className="mr-1" />}
                                      {expandedUsers[result.id] ? 'Hide' : 'View'}
                                    </button>
                                  </td>
                                </tr>
                                {expandedUsers[result.id] && (
                                  <tr className="bg-neutral-50 dark:bg-dark-bg-tertiary">
                                    <td colSpan="5" className="px-6 py-4">
                                      <div className="text-sm text-neutral-700 dark:text-dark-text-primary">
                                        <h4 className="font-medium mb-2">Question Responses</h4>
                                        <div className="space-y-3">
                                          {result.answers?.map((answer, index) => (
                                            <div 
                                              key={index} 
                                              className={`p-3 rounded-md ${
                                                answer.isCorrect 
                                                  ? 'bg-success-50 dark:bg-success-900/20' 
                                                  : 'bg-error-50 dark:bg-error-900/20'
                                              }`}
                                            >
                                              <p className="font-medium mb-1 text-neutral-800 dark:text-white">
                                                Q{index + 1}: {answer.question}
                                              </p>
                                              <p className="text-neutral-600 dark:text-dark-text-secondary">
                                                User Answer: <span className={answer.isCorrect ? 'text-success-700 dark:text-success-300' : 'text-error-700 dark:text-error-300'}>
                                                  {answer.userAnswer || 'No answer'}
                                                </span>
                                              </p>
                                              <p className="text-neutral-600 dark:text-dark-text-secondary">
                                                Correct Answer: <span className="text-success-700 dark:text-success-300">
                                                  {answer.correctAnswer}
                                                </span>
                                              </p>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-dark-bg-secondary shadow dark:shadow-dark-lg rounded-lg overflow-hidden">
                <div className="p-6 text-center">
                  <p className="text-neutral-600 dark:text-dark-text-secondary">Select a quiz to view results</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ViewResultsPage;