import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FiClock, FiAlertCircle, FiCheckCircle, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { toast } from 'react-toastify';

import Layout from '../../components/common/Layout';
import PageHeader from '../../components/common/PageHeader';
import { useQuiz } from '../../context/QuizContext';

const TakeQuizPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const passedQuiz = location.state?.quiz;
  
  const { 
    fetchQuizById, 
    submitQuiz: submitQuizToBackend, 
    loading, 
    error,
    currentQuiz
  } = useQuiz();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hasErrors, setHasErrors] = useState(false);
  
  // Format time remaining
  const formatTimeLeft = useCallback(() => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }, [timeLeft]);
  
  // Handle timer
  useEffect(() => {
    if (quizStarted && !quizSubmitted && timeLeft > 0) {
      const timerId = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      
      // Auto-submit when time is up
      if (timeLeft === 0) {
        handleSubmitQuiz();
      }
      
      return () => clearTimeout(timerId);
    }
  }, [quizStarted, quizSubmitted, timeLeft]);
  
  // Fetch quiz details
  useEffect(() => {
    const loadQuiz = async () => {
      try {
        // If we don't have the quiz data yet, fetch it
        if (!currentQuiz || currentQuiz.id !== Number(quizId)) {
          await fetchQuizById(quizId);
        }
      } catch (err) {
        // Error is already handled in the context
        setHasErrors(true);
      }
    };
    
    loadQuiz();
  }, [quizId, currentQuiz, fetchQuizById]);
  
  // Set timer when quiz is loaded
  useEffect(() => {
    if (currentQuiz && !quizStarted && !timeLeft) {
      setTimeLeft(currentQuiz.timeLimit * 60); // Convert minutes to seconds
      }
  }, [currentQuiz, quizStarted, timeLeft]);
  
  // Start the quiz
  const handleStartQuiz = () => {
    if (!currentQuiz) {
      toast.error('Quiz data not loaded. Please try again.');
      return;
    }
    
    setQuizStarted(true);
    
    // Initialize answers object
    const initialAnswers = {};
    currentQuiz.questions.forEach((question) => {
      initialAnswers[question.id] = '';
    });
    setAnswers(initialAnswers);
  };
  
  // Handle try again after error
  const handleTryAgain = () => {
    setHasErrors(false);
    fetchQuizById(quizId);
  };
  
  // Handle answer change for MCQ
  const handleOptionSelect = (questionId, optionId) => {
    setAnswers({
      ...answers,
      [questionId]: optionId.toString()
    });
  };
  
  // Handle answer change for essay/text
  const handleTextAnswerChange = (questionId, value) => {
    setAnswers({
      ...answers,
      [questionId]: value
    });
  };
  
  // Navigate to next question
  const handleNextQuestion = () => {
    if (currentQuiz && currentQuestionIndex < currentQuiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };
  
  // Navigate to previous question
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  // Submit the quiz
  const handleSubmitQuiz = async () => {
    if (!currentQuiz) return;
    
    // Check for unanswered questions
    const unansweredCount = Object.values(answers).filter(
      answer => answer === null || answer === ''
    ).length;
    
    if (unansweredCount > 0 && !quizSubmitted) {
      // Confirm before submitting with unanswered questions
      const confirmed = window.confirm(
        `You have ${unansweredCount} unanswered ${
          unansweredCount === 1 ? 'question' : 'questions'
        }. Do you want to submit anyway?`
      );
      
      if (!confirmed) return;
    }
    
    setSubmitting(true);
    
    try {
      // Format answers for the backend
      const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => {
        // Check if the current question has options (MCQ) or is text input
        const question = currentQuiz.questions.find(q => q.id == questionId);
        const hasOptions = question?.options && question.options.length > 0;
        
        // For MCQ questions, send selectedOptionId
        // For text questions, send the answer text
        return {
          questionId: Number(questionId),
          ...(hasOptions ? { selectedOptionId: answer } : { answer })
        };
      });
      
      console.log('Submitting answers:', formattedAnswers);
      await submitQuizToBackend(quizId, formattedAnswers);
      
      setQuizSubmitted(true);
      toast.success('Quiz submitted successfully');
      
      // Redirect to results page
      navigate('/user/past-history');
    } catch (error) {
      console.error('Failed to submit quiz:', error);
      toast.error('Failed to submit quiz. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Get current question
  const currentQuestion = currentQuiz?.questions?.[currentQuestionIndex];
  
  // Calculate progress
  const progress = currentQuiz?.questions?.length > 0
    ? ((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100
    : 0;
  
  // Handle quiz not found or error loading
  if (hasErrors || error.currentQuiz) {
    return (
      <Layout>
        <div className="animate-fade-in">
          <PageHeader
            title="Quiz Error"
            subtitle="There was a problem loading the quiz"
            backLink="/user/quizzes"
            backLabel="Back to Quizzes"
          />
          
          <div className="bg-white dark:bg-dark-bg-secondary shadow dark:shadow-dark-lg rounded-lg p-8 text-center">
            <FiAlertCircle className="h-12 w-12 mx-auto text-error-600 dark:text-error-400 mb-4" />
            <h2 className="text-xl font-semibold text-neutral-800 dark:text-white mb-2">
              Quiz Not Found
            </h2>
            <p className="text-neutral-600 dark:text-dark-text-secondary mb-6">
              The quiz you're looking for couldn't be loaded. It may have been removed or you don't have access to it.
            </p>
            <button
              onClick={handleTryAgain}
              className="btn-primary inline-flex items-center"
            >
              Try Again
            </button>
          </div>
        </div>
      </Layout>
    );
  }
  
  // If the quiz is loading, show a loading state
  if (loading.currentQuiz && !currentQuiz) {
    return (
      <Layout>
        <div className="animate-fade-in">
          <PageHeader
            title="Loading Quiz"
            subtitle="Please wait while we load your quiz"
            backLink="/user/quizzes"
            backLabel="Back to Quizzes"
          />
          
          <div className="bg-white dark:bg-dark-bg-secondary shadow dark:shadow-dark-lg rounded-lg p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent mb-4"></div>
            <p className="text-neutral-600 dark:text-dark-text-secondary">
              Loading quiz content...
            </p>
          </div>
        </div>
      </Layout>
    );
  }
  
  // If the quiz hasn't started yet, show the start screen
  if (!quizStarted) {
    return (
      <Layout>
        <div className="animate-fade-in">
          <PageHeader
            title={currentQuiz?.title || 'Start Quiz'}
            subtitle="Review the details and start when ready"
            backLink="/user/quizzes"
            backLabel="Back to Quizzes"
          />
          
          <div className="bg-white dark:bg-dark-bg-secondary shadow dark:shadow-dark-lg rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-neutral-800 dark:text-white mb-2">
                  Quiz Details
                </h2>
                <p className="text-neutral-600 dark:text-dark-text-secondary mb-4">
                  {currentQuiz?.description || 'No description available.'}
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                  <div className="bg-neutral-50 dark:bg-dark-bg-tertiary p-4 rounded-lg">
                    <div className="flex items-center">
                      <FiClock className="text-primary-600 dark:text-primary-400 mr-2" />
                      <div>
                        <p className="text-sm text-neutral-500 dark:text-dark-text-secondary">Time Limit</p>
                        <p className="text-lg font-medium text-neutral-800 dark:text-white">{currentQuiz?.timeLimit} Minutes</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-neutral-50 dark:bg-dark-bg-tertiary p-4 rounded-lg">
                    <div className="flex items-center">
                      <FiAlertCircle className="text-primary-600 dark:text-primary-400 mr-2" />
                      <div>
                        <p className="text-sm text-neutral-500 dark:text-dark-text-secondary">Questions</p>
                        <p className="text-lg font-medium text-neutral-800 dark:text-white">{currentQuiz?.questions?.length || 0} Questions</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-neutral-50 dark:bg-dark-bg-tertiary p-4 rounded-lg mb-6">
                <h3 className="font-medium text-neutral-800 dark:text-white mb-2">Important Instructions</h3>
                <ul className="list-disc pl-5 text-neutral-600 dark:text-dark-text-secondary space-y-1">
                  <li>Once started, the timer cannot be paused.</li>
                  <li>You can navigate between questions using the navigation buttons.</li>
                  <li>Click 'Submit Quiz' when you're done or when time runs out.</li>
                  <li>You will be graded based on the correctness of your answers.</li>
                </ul>
              </div>
              
              <div className="text-center">
                <button 
                  onClick={handleStartQuiz}
                  className="btn-primary inline-flex items-center"
                >
                  Start Quiz
                </button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  // Main quiz view - this is shown when the quiz is active
  return (
    <Layout>
      <div className="animate-fade-in">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-white sm:text-3xl">{currentQuiz?.title}</h1>
              <p className="mt-2 text-sm text-neutral-600 dark:text-dark-text-secondary">
                Question {currentQuestionIndex + 1} of {currentQuiz?.questions?.length}
              </p>
            </div>
            
            <div className="mt-4 sm:mt-0 flex items-center space-x-4">
              {!quizSubmitted && (
                <div className={`flex items-center px-4 py-2 rounded-full ${
                  timeLeft < 60 ? 'bg-error-100 text-error-700 dark:bg-error-900/30 dark:text-error-300' : 
                  timeLeft < 180 ? 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-300' : 
                  'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                }`}>
                  <FiClock className="mr-2" />
                  <span className="font-medium">{formatTimeLeft()}</span>
                </div>
              )}
              
              <button
                onClick={() => navigate('/user/quizzes')}
                className="inline-flex items-center px-4 py-2 border border-neutral-300 dark:border-dark-border-primary rounded-md shadow-sm dark:shadow-dark-sm text-sm font-medium text-neutral-700 dark:text-dark-text-primary bg-white dark:bg-dark-bg-secondary hover:bg-neutral-50 dark:hover:bg-dark-bg-tertiary focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-dark-bg-primary focus:ring-primary-500"
              >
                Exit Quiz
              </button>
            </div>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-neutral-200 dark:bg-dark-bg-tertiary rounded-full h-2.5 mb-6">
          <div 
            className="bg-primary-600 dark:bg-primary-700 h-2.5 rounded-full" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        {/* Quiz container */}
        <div className="bg-white dark:bg-dark-bg-secondary shadow dark:shadow-dark-lg rounded-lg overflow-hidden mb-8">
          {currentQuestion ? (
            <div className="p-6">
              {/* Question */}
              <div className="mb-8">
                <h2 className="text-xl font-medium text-neutral-800 dark:text-white mb-4">
                  {currentQuestion.questionText}
                </h2>
                
                {/* Multiple choice question */}
                {currentQuestion.options && currentQuestion.options.length > 0 ? (
                  <div className="space-y-3">
                    {currentQuestion.options.map((option) => (
                      <label 
                        key={option.id} 
                        className={`flex items-center p-4 border dark:border-dark-border-primary rounded-lg cursor-pointer transition-colors ${
                          answers[currentQuestion.id] === option.id.toString()
                            ? 'border-primary-500 dark:border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                            : 'hover:bg-neutral-50 dark:hover:bg-dark-bg-tertiary'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${currentQuestion.id}`}
                          value={option.id}
                          checked={answers[currentQuestion.id] === option.id.toString()}
                          onChange={() => handleOptionSelect(currentQuestion.id, option.id)}
                          className="h-4 w-4 text-primary-600 dark:text-primary-700 focus:ring-primary-500 dark:focus:ring-primary-600 border-neutral-300 dark:border-dark-border-primary"
                        />
                        <span className="ml-3 text-neutral-800 dark:text-white">
                          {option.optionText}
                        </span>
                      </label>
                    ))}
                  </div>
                ) : (
                  /* Essay/text question */
                  <textarea
                    value={answers[currentQuestion.id] || ''}
                    onChange={(e) => handleTextAnswerChange(currentQuestion.id, e.target.value)}
                    placeholder="Type your answer here..."
                    rows={6}
                    className="form-input w-full"
                  ></textarea>
                )}
              </div>
              
              {/* Navigation buttons */}
              <div className="flex justify-between">
                <button
                  onClick={handlePrevQuestion}
                  disabled={currentQuestionIndex === 0}
                  className={`inline-flex items-center px-4 py-2 border border-neutral-300 dark:border-dark-border-primary rounded-md shadow-sm dark:shadow-dark-sm text-sm font-medium ${
                    currentQuestionIndex === 0
                      ? 'bg-neutral-100 dark:bg-dark-bg-tertiary text-neutral-400 dark:text-dark-text-tertiary cursor-not-allowed'
                      : 'text-neutral-700 dark:text-dark-text-primary bg-white dark:bg-dark-bg-secondary hover:bg-neutral-50 dark:hover:bg-dark-bg-tertiary focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-dark-bg-primary focus:ring-primary-500'
                  }`}
                >
                  <FiChevronLeft className="mr-2" />
                  Previous
                </button>
                
                {currentQuestionIndex < currentQuiz.questions.length - 1 ? (
                  <button
                    onClick={handleNextQuestion}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm dark:shadow-dark-sm text-sm font-medium text-white bg-primary-600 dark:bg-primary-700 hover:bg-primary-700 dark:hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-dark-bg-primary focus:ring-primary-500"
                  >
                    Next
                    <FiChevronRight className="ml-2" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={submitting}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm dark:shadow-dark-sm text-sm font-medium text-white bg-success-600 dark:bg-success-700 hover:bg-success-700 dark:hover:bg-success-800 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-dark-bg-primary focus:ring-success-500"
                  >
                    {submitting ? (
                      <>
                        <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <FiCheckCircle className="mr-2" />
                        Submit Quiz
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-6 text-center">
              <p className="text-neutral-600 dark:text-dark-text-secondary">No questions available</p>
            </div>
          )}
        </div>
        
        {/* Question navigation */}
        <div className="bg-white dark:bg-dark-bg-secondary shadow dark:shadow-dark-lg rounded-lg overflow-hidden mb-8">
          <div className="p-6">
            <h3 className="text-sm font-medium text-neutral-500 dark:text-dark-text-secondary mb-4">Question Navigator</h3>
            <div className="flex flex-wrap gap-2">
              {currentQuiz?.questions?.map((question, index) => (
                <button
                  key={question.id}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                    index === currentQuestionIndex
                      ? 'bg-primary-600 dark:bg-primary-700 text-white' 
                      : answers[question.id] 
                        ? 'bg-success-100 dark:bg-success-900/30 text-success-800 dark:text-success-300 border border-success-300 dark:border-success-700' 
                        : 'bg-neutral-100 dark:bg-dark-bg-tertiary text-neutral-700 dark:text-dark-text-primary hover:bg-neutral-200 dark:hover:bg-neutral-700'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TakeQuizPage;