import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FiPlus, FiTrash2, FiX, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';

import Layout from '../../components/common/Layout';
import PageHeader from '../../components/common/PageHeader';
import FormField from '../../components/common/FormField';
import apiService from '../../services/api';

const CreateQuizPage = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    type: 'mcq',
    text: '',
    options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }],
    correctAnswer: '', // For essay questions
  });
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      duration: 30,
    },
  });
  
  // Validate the current question before adding it to the list
  const validateQuestion = () => {
    if (!currentQuestion.text.trim()) {
      toast.error('Question text is required');
      return false;
    }
    
    if (currentQuestion.type === 'mcq') {
      // Check if at least 2 options are provided
      const validOptions = currentQuestion.options.filter(
        (option) => option.text.trim() !== ''
      );
      
      if (validOptions.length < 2) {
        toast.error('At least 2 options are required');
        return false;
      }
      
      // Check if at least one option is marked as correct
      const hasCorrectOption = currentQuestion.options.some(
        (option) => option.isCorrect
      );
      
      if (!hasCorrectOption) {
        toast.error('Please mark at least one option as correct');
        return false;
      }
    } else if (currentQuestion.type === 'essay') {
      if (!currentQuestion.correctAnswer.trim()) {
        toast.error('Please provide a model answer for essay question');
        return false;
      }
    }
    
    return true;
  };
  
  // Add a new question to the list
  const handleAddQuestion = () => {
    if (!validateQuestion()) return;
    
    setQuestions([...questions, { ...currentQuestion, id: Date.now() }]);
    resetQuestionForm();
    setIsAddingQuestion(false);
    toast.success('Question added');
  };
  
  // Update an option text
  const handleOptionTextChange = (index, value) => {
    const updatedOptions = [...currentQuestion.options];
    updatedOptions[index] = { ...updatedOptions[index], text: value };
    setCurrentQuestion({ ...currentQuestion, options: updatedOptions });
  };
  
  // Toggle the correct status of an option
  const handleOptionCorrectToggle = (index) => {
    const updatedOptions = [...currentQuestion.options];
    
    // If single correct answer is required (radio button behavior)
    updatedOptions.forEach((option, i) => {
      updatedOptions[i] = {
        ...option,
        isCorrect: i === index,
      };
    });
    
    setCurrentQuestion({ ...currentQuestion, options: updatedOptions });
  };
  
  // Add a new option
  const handleAddOption = () => {
    if (currentQuestion.options.length >= 6) {
      toast.error('Maximum 6 options allowed');
      return;
    }
    
    setCurrentQuestion({
      ...currentQuestion,
      options: [...currentQuestion.options, { text: '', isCorrect: false }],
    });
  };
  
  // Remove an option
  const handleRemoveOption = (index) => {
    if (currentQuestion.options.length <= 2) {
      toast.error('Minimum 2 options required');
      return;
    }
    
    const updatedOptions = currentQuestion.options.filter((_, i) => i !== index);
    setCurrentQuestion({ ...currentQuestion, options: updatedOptions });
  };
  
  // Reset the question form
  const resetQuestionForm = () => {
    setCurrentQuestion({
      type: 'mcq',
      text: '',
      options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }],
      correctAnswer: '',
    });
  };
  
  // Remove a question from the list
  const handleRemoveQuestion = (questionId) => {
    setQuestions(questions.filter((q) => q.id !== questionId));
    toast.success('Question removed');
  };
  
  // Submit the quiz
  const onSubmit = async (data) => {
    if (questions.length === 0) {
      toast.error('Please add at least one question');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Format the data for the backend API
      const quizData = {
        title: data.title,
        description: data.description,
        timeLimit: parseInt(data.duration, 10),
        questions: questions.map(q => ({
          questionText: q.text,
          points: 1, // Default points per question
          options: q.options.map(opt => ({
            optionText: opt.text,
            isCorrect: opt.isCorrect
          }))
        }))
      };
      
      // Use the real API service
      const response = await apiService.createQuiz(quizData);
      
      toast.success('Quiz created successfully');
      navigate('/examiner/dashboard');
    } catch (error) {
      console.error('Failed to create quiz:', error);
      toast.error('Failed to create quiz');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Layout>
      <div className="animate-fade-in">
        <PageHeader
          title="Create New Quiz"
          subtitle="Create a new quiz with multiple-choice and essay questions"
          backLink="/examiner/dashboard"
          backLabel="Back to Dashboard"
        />
        
        <div className="bg-white dark:bg-dark-bg-secondary shadow dark:shadow-dark-lg rounded-lg overflow-hidden mb-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-neutral-800 dark:text-white mb-6">Quiz Details</h2>
            
            <form>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <FormField
                    label="Quiz Title"
                    name="title"
                    type="text"
                    placeholder="Enter the quiz title"
                    error={errors.title?.message}
                    {...register('title', {
                      required: 'Quiz title is required',
                      minLength: {
                        value: 3,
                        message: 'Title must be at least 3 characters',
                      },
                    })}
                  />
                </div>
                
                <div className="md:col-span-2">
                  <FormField
                    label="Description"
                    name="description"
                    type="textarea"
                    placeholder="Enter a brief description of the quiz"
                    error={errors.description?.message}
                    {...register('description', {
                      required: 'Description is required',
                    })}
                  />
                </div>
                
                <div>
                  <FormField
                    label="Duration (minutes)"
                    name="duration"
                    type="number"
                    min="1"
                    placeholder="Quiz duration in minutes"
                    error={errors.duration?.message}
                    {...register('duration', {
                      required: 'Duration is required',
                      min: {
                        value: 1,
                        message: 'Duration must be at least 1 minute',
                      },
                      max: {
                        value: 180,
                        message: 'Duration cannot exceed 180 minutes',
                      },
                    })}
                  />
                </div>
              </div>
            </form>
          </div>
        </div>
        
        <div className="bg-white dark:bg-dark-bg-secondary shadow dark:shadow-dark-lg rounded-lg overflow-hidden mb-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-neutral-800 dark:text-white mb-6">Questions</h2>
            
            {questions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-neutral-600 dark:text-dark-text-secondary mb-4">No questions added yet</p>
                <button
                  type="button"
                  onClick={() => setIsAddingQuestion(true)}
                  className="btn-primary inline-flex items-center"
                >
                  <FiPlus className="mr-2" />
                  Add Your First Question
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((question, index) => (
                  <div key={question.id} className="border dark:border-dark-border-primary rounded-lg p-4 hover:bg-neutral-50 dark:hover:bg-dark-bg-tertiary">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center">
                          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 text-sm font-medium mr-2">
                            {index + 1}
                          </span>
                          <h3 className="text-lg font-medium text-neutral-800 dark:text-white">{question.text}</h3>
                        </div>
                        
                        <div className="mt-2 ml-8">
                          {question.type === 'mcq' ? (
                            <div className="space-y-1">
                              {question.options.map((option, optIndex) => (
                                <div key={optIndex} className="flex items-center">
                                  <span className={`h-5 w-5 mr-2 rounded-full flex items-center justify-center ${
                                    option.isCorrect 
                                      ? 'bg-success-500 text-white dark:bg-success-600' 
                                      : 'bg-neutral-200 dark:bg-dark-bg-tertiary'
                                  }`}>
                                    {option.isCorrect && <FiCheckCircle className="h-4 w-4" />}
                                  </span>
                                  <span className={`text-sm ${
                                    option.isCorrect 
                                      ? 'font-medium text-success-700 dark:text-success-400' 
                                      : 'text-neutral-700 dark:text-dark-text-primary'
                                  }`}>
                                    {option.text}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-sm text-neutral-700 dark:text-dark-text-primary italic border-l-2 border-neutral-300 dark:border-dark-border-primary pl-2">
                              Model answer: {question.correctAnswer}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(question.id)}
                        className="text-error-600 dark:text-error-400 hover:text-error-800 dark:hover:text-error-300"
                      >
                        <FiTrash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
                
                <div className="flex justify-center mt-4">
                  <button
                    type="button"
                    onClick={() => setIsAddingQuestion(true)}
                    className="btn-outline inline-flex items-center"
                  >
                    <FiPlus className="mr-2" />
                    Add Another Question
                  </button>
                </div>
              </div>
            )}
            
            {isAddingQuestion && (
              <div className="mt-8 border-t border-neutral-200 dark:border-dark-border-primary pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-neutral-800 dark:text-white">Add New Question</h3>
                  <button
                    type="button"
                    onClick={() => setIsAddingQuestion(false)}
                    className="text-neutral-500 dark:text-dark-text-secondary hover:text-neutral-700 dark:hover:text-dark-text-primary"
                  >
                    <FiX className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="form-label">Question Type</label>
                    <div className="flex space-x-4 mt-1">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          className="form-input h-4 w-4"
                          checked={currentQuestion.type === 'mcq'}
                          onChange={() => setCurrentQuestion({ ...currentQuestion, type: 'mcq' })}
                        />
                        <span className="ml-2 text-neutral-700 dark:text-dark-text-primary">Multiple Choice</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          className="form-input h-4 w-4"
                          checked={currentQuestion.type === 'essay'}
                          onChange={() => setCurrentQuestion({ ...currentQuestion, type: 'essay' })}
                        />
                        <span className="ml-2 text-neutral-700 dark:text-dark-text-primary">Essay</span>
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <label className="form-label">Question Text</label>
                    <textarea
                      className="form-input"
                      rows="3"
                      placeholder="Enter your question here"
                      value={currentQuestion.text}
                      onChange={(e) => setCurrentQuestion({ ...currentQuestion, text: e.target.value })}
                    ></textarea>
                  </div>
                  
                  {currentQuestion.type === 'mcq' ? (
                    <div>
                      <label className="form-label">Options</label>
                      <div className="space-y-2">
                        {currentQuestion.options.map((option, index) => (
                          <div key={index} className="flex items-center">
                            <div className="flex-grow flex items-center space-x-2">
                              <button
                                type="button"
                                className={`h-6 w-6 rounded-full flex items-center justify-center border ${
                                  option.isCorrect
                                    ? 'bg-success-500 text-white border-success-500 dark:bg-success-600 dark:border-success-600'
                                    : 'bg-white dark:bg-dark-bg-tertiary border-neutral-300 dark:border-dark-border-primary'
                                }`}
                                onClick={() => handleOptionCorrectToggle(index)}
                              >
                                {option.isCorrect && <FiCheckCircle className="h-4 w-4" />}
                              </button>
                              <input
                                type="text"
                                className="form-input"
                                placeholder={`Option ${index + 1}`}
                                value={option.text}
                                onChange={(e) => handleOptionTextChange(index, e.target.value)}
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveOption(index)}
                              className="ml-2 text-error-600 dark:text-error-400 hover:text-error-800 dark:hover:text-error-300"
                              aria-label="Remove option"
                            >
                              <FiX className="h-5 w-5" />
                            </button>
                          </div>
                        ))}
                        
                        <button
                          type="button"
                          onClick={handleAddOption}
                          className="mt-2 text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 inline-flex items-center text-sm"
                        >
                          <FiPlus className="mr-1" />
                          Add Option
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="form-label">Model Answer</label>
                      <textarea
                        className="form-input"
                        rows="3"
                        placeholder="Enter a model/correct answer"
                        value={currentQuestion.correctAnswer}
                        onChange={(e) => setCurrentQuestion({ ...currentQuestion, correctAnswer: e.target.value })}
                      ></textarea>
                    </div>
                  )}
                  
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleAddQuestion}
                      className="btn-primary"
                    >
                      Add Question
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            className="btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating Quiz...' : 'Create Quiz'}
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default CreateQuizPage;