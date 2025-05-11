import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiEdit, FiEye, FiPlusCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';

import Layout from '../../components/common/Layout';
import PageHeader from '../../components/common/PageHeader';
import apiService from '../../services/api';

const ExaminerDashboard = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchQuizzes = async () => {
      setIsLoading(true);
      try {
        const response = await apiService.getExaminerQuizzes();
        setQuizzes(response.data);
      } catch (error) {
        console.error('Failed to fetch quizzes:', error);
        toast.error('Failed to load quizzes');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchQuizzes();
  }, []);
  
  return (
    <Layout>
      <div className="animate-fade-in">
        <PageHeader
          title="Examiner Dashboard"
          subtitle="Manage your quizzes and view results"
        />
        
        <div className="mb-6 flex justify-end">
          <Link
            to="/examiner/create-quiz"
            className="btn-primary inline-flex items-center"
          >
            <FiPlusCircle className="mr-2" />
            Create New Quiz
          </Link>
        </div>
        
        <div className="bg-white dark:bg-dark-bg-secondary shadow dark:shadow-dark-lg rounded-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-neutral-800 dark:text-white mb-6">Your Quizzes</h2>
            
            {isLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent"></div>
                <p className="mt-2 text-neutral-600 dark:text-dark-text-secondary">Loading quizzes...</p>
              </div>
            ) : quizzes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-neutral-600 dark:text-dark-text-secondary mb-4">You haven't created any quizzes yet</p>
                <Link
                  to="/examiner/create-quiz"
                  className="btn-primary inline-flex items-center"
                >
                  <FiPlusCircle className="mr-2" />
                  Create Your First Quiz
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {quizzes.map((quiz) => (
                  <div key={quiz.id} className="border dark:border-dark-border-primary rounded-lg overflow-hidden hover:shadow-md dark:hover:shadow-dark-lg transition-shadow duration-200">
                    <div className="bg-primary-50 dark:bg-primary-900/20 px-4 py-3 border-b dark:border-dark-border-primary">
                      <h3 className="font-medium text-primary-800 dark:text-primary-300 truncate">{quiz.title}</h3>
                    </div>
                    <div className="p-4 bg-white dark:bg-dark-bg-secondary">
                      <p className="text-sm text-neutral-600 dark:text-dark-text-secondary mb-4 line-clamp-2">{quiz.description}</p>
                      
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="text-sm">
                          <span className="text-neutral-500 dark:text-dark-text-tertiary">Questions:</span>
                          <span className="ml-1 font-medium text-neutral-700 dark:text-dark-text-primary">{quiz.questionCount}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-neutral-500 dark:text-dark-text-tertiary">Duration:</span>
                          <span className="ml-1 font-medium text-neutral-700 dark:text-dark-text-primary">{quiz.timeLimit} min</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-neutral-500 dark:text-dark-text-tertiary">Created:</span>
                          <span className="ml-1 font-medium text-neutral-700 dark:text-dark-text-primary">
                            {new Date(quiz.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="text-neutral-500 dark:text-dark-text-tertiary">Active:</span>
                          <span className="ml-1 font-medium text-neutral-700 dark:text-dark-text-primary">{quiz.active ? 'Yes' : 'No'}</span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Link
                          to={`/examiner/view-results/${quiz.id}`}
                          className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 dark:text-primary-300 dark:bg-primary-900/30 dark:hover:bg-primary-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-dark-bg-primary focus:ring-primary-500"
                        >
                          <FiEye className="mr-1" />
                          View Results
                        </Link>
                        <Link
                          to={`/examiner/edit-quiz/${quiz.id}`}
                          className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-secondary-700 bg-secondary-100 hover:bg-secondary-200 dark:text-secondary-300 dark:bg-secondary-900/30 dark:hover:bg-secondary-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-dark-bg-primary focus:ring-secondary-500"
                        >
                          <FiEdit className="mr-1" />
                          Edit
                        </Link>
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

export default ExaminerDashboard;