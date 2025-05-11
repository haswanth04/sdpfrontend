import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import Lottie from 'react-lottie-player';

import FormField from '../../components/common/FormField';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../../components/common/ThemeToggle';
import registerAnimation from '../../assets/animations/register-animation.json';

const RegisterPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { register: registerUser, ROLES } = useAuth();
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: ROLES.USER,
    },
  });
  
  const watchPassword = watch('password');
  
  const onSubmit = async (data) => {
    setIsLoading(true);
    // Remove confirmPassword before sending to API
    const { confirmPassword, ...userData } = data;
    
    try {
      const result = await registerUser({
        ...userData
      });
      if (result.success) {
        navigate('/login');
      }
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex relative overflow-hidden bg-neutral-50 dark:bg-dark-bg-primary">
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>
      
      {/* Lottie Animation as background/immersive element */}
      <div className="hidden md:block absolute right-0 top-0 w-2/3 h-full">
        <Lottie
          loop
          animationData={registerAnimation}
          play
          style={{ width: '100%', height: '100%' }}
        />
      </div>
      
      {/* Registration Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-6xl font-extrabold text-primary-600 dark:text-primary-400 mb-6">ExamPro</h1>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Create a new account</h2>
          </div>
          
          <div className="mt-8 bg-white dark:bg-dark-bg-secondary py-8 px-6 shadow dark:shadow-dark-lg sm:rounded-lg animate-fade-in">
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <FormField
                label="Full Name"
                name="name"
                type="text"
                placeholder="Enter your full name"
                error={errors.name?.message}
                {...register('name', {
                  required: 'Name is required',
                  minLength: {
                    value: 2,
                    message: 'Name must be at least 2 characters',
                  },
                })}
              />
              
              <FormField
                label="Email Address"
                name="email"
                type="email"
                placeholder="Enter your email"
                error={errors.email?.message}
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
              />
              
              <FormField
                label="Password"
                name="password"
                type="password"
                placeholder="Create a password"
                error={errors.password?.message}
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
              />
              
              <FormField
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (value) =>
                    value === watchPassword || 'Passwords do not match',
                })}
              />
              
              <FormField
                label="Role"
                name="role"
                type="select"
                error={errors.role?.message}
                options={[
                  { value: ROLES.USER, label: 'Student' },
                  { value: ROLES.EXAMINER, label: 'Examiner' },
                ]}
                {...register('role', {
                  required: 'Role is required',
                })}
              />
              
              <div className="mt-6">
                <button
                  type="submit"
                  className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-primary-500 dark:hover:bg-primary-600"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing up...' : 'Sign up'}
                </button>
              </div>
            </form>
            
            <div className="mt-6">
              <div className="text-center">
                <p className="text-sm text-neutral-600 dark:text-dark-text-secondary">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;