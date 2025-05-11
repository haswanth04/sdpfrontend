import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiClock, FiFileText, FiSearch, FiUser, FiAlertCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';

import Layout from '../../components/common/Layout';
import PageHeader from '../../components/common/PageHeader';
import { useQuiz } from '../../context/QuizContext';

const QuizzesPage = () => {
  const { 
    availableQuizzes, 
    loading, 
    error, 
    fetchAvailableQuizzes 
  } = useQuiz();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExaminer, setSelectedExaminer] = useState('all');
  const [examiners, setExaminers] = useState([]);
  
  useEffect(() => {
    // Only fetch if we don't already have quizzes in context/session storage
    if (availableQuizzes.length === 0) {
      fetchAvailableQuizzes();
    }
  }, [availableQuizzes.length, fetchAvailableQuizzes]);
  
  useEffect(() => {
    // Extract unique examiners whenever availableQuizzes changes
    if (availableQuizzes.length > 0) {
      const uniqueExaminers = [...new Set(availableQuizzes.map(quiz => quiz.examiner))];
      setExaminers(uniqueExaminers);
    }
  }, [availableQuizzes]);
  
  // Handle refresh button click
  const handleRefresh = () => {
    fetchAvailableQuizzes();
    toast.info('Refreshing available quizzes...');
  };
  
  // Filter quizzes by search term and selected examiner
  const filteredQuizzes = availableQuizzes.filter((quiz) => {
    const matchesSearch = 
      quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (quiz.description && quiz.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesExaminer = 
      selectedExaminer === 'all' || quiz.examiner === selectedExaminer;
    
    return matchesSearch && matchesExaminer;
  });
  
  return (
    <Layout>
      <div className="animate-fade-in">
        <PageHeader
          title="Available Quizzes"
          subtitle="Browse and take quizzes created by examiners"
          backLink="/user/dashboard"
          backLabel="Back to Dashboard"
        />
        
        <div className="bg-white dark:bg-dark-bg-secondary shadow dark:shadow-dark-lg rounded-lg overflow-hidden mb-8">
          <div className="p-6">
            <div className="mb-6 flex flex-col md:flex-row gap-4 justify-between">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className="h-5 w-5 text-neutral-400 dark:text-dark-text-tertiary" />
                  </div>
                  <input
                    type="text"
                    className="form-input pl-10 w-full"
                    placeholder="Search quizzes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="h-5 w-5 text-neutral-400 dark:text-dark-text-tertiary" />
                  </div>
                  <select
                    className="form-input pl-10"
                    value={selectedExaminer}
                    onChange={(e) => setSelectedExaminer(e.target.value)}
                  >
                    <option value="all">All Examiners</option>
                    {examiners.map((examiner, index) => (
                      <option key={index} value={examiner}>
                        {examiner}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <button
                onClick={handleRefresh}
                className="btn-secondary flex items-center justify-center px-4 py-2"
                disabled={loading.quizzes}
              >
                {loading.quizzes ? (
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-neutral-300 dark:border-neutral-600 border-t-transparent mr-2"></div>
                ) : (
                  <svg 
                    className="w-4 h-4 mr-2" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                    />
                  </svg>
                )}
                {loading.quizzes ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
            
            {loading.quizzes && availableQuizzes.length === 0 ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent"></div>
                <p className="mt-2 text-neutral-600 dark:text-dark-text-secondary">Loading quizzes...</p>
              </div>
            ) : error.quizzes ? (
              <div className="text-center py-8 text-error-600 dark:text-error-400">
                <FiAlertCircle className="h-8 w-8 mx-auto mb-2" />
                <p>{error.quizzes}</p>
                <button 
                  onClick={handleRefresh}
                  className="mt-4 px-4 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded hover:bg-primary-700 dark:hover:bg-primary-800"
                >
                  Try Again
                </button>
              </div>
            ) : filteredQuizzes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-neutral-600 dark:text-dark-text-secondary">No quizzes found</p>
                {selectedExaminer !== 'all' && (
                  <button
                    className="mt-2 text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
                    onClick={() => setSelectedExaminer('all')}
                  >
                    Show all examiners' quizzes
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {filteredQuizzes.map((quiz) => (
                  <div
                    key={quiz.id}
                    className="border dark:border-dark-border-primary rounded-lg overflow-hidden hover:shadow-md dark:hover:shadow-dark-lg transition-shadow duration-200"
                  >
                    <div className="p-6">
                      <div className="sm:flex sm:items-start sm:justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-1">{quiz.title}</h3>
                          <p className="text-sm text-neutral-600 dark:text-dark-text-secondary mb-4">{quiz.description}</p>
                          
                          <div className="flex flex-wrap gap-4 text-sm text-neutral-500 dark:text-dark-text-secondary">
                            <div className="flex items-center">
                              <FiFileText className="mr-1 text-neutral-400 dark:text-dark-text-tertiary" />
                              <span>{quiz.questionCount} Questions</span>
                            </div>
                            
                            <div className="flex items-center">
                              <FiClock className="mr-1 text-neutral-400 dark:text-dark-text-tertiary" />
                              <span>{quiz.timeLimit} Minutes</span>
                            </div>
                            
                            <div className="flex items-center">
                              <FiUser className="mr-1 text-neutral-400 dark:text-dark-text-tertiary" />
                              <span>By {quiz.examiner}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-4 sm:mt-0">
                          <Link
                            to={`/user/take-quiz/${quiz.id}`}
                            className="btn-primary inline-block whitespace-nowrap"
                            state={{ quiz }}
                          >
                            Take Quiz
                          </Link>
                        </div>
                      </div>
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

export default QuizzesPage;