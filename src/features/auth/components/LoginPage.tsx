import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import backgroundImage from '../../../assets/images/download.jpg';
import Logo from '../../../components/ui/Logo';
import { useTheme } from '../../../context/ThemeContext';
import LoginForm from './LoginForm';

const LoginPage: React.FC = () => {
  const [isSignup, setIsSignup] = useState(false);
  const { getColorClasses } = useTheme();

  // Set title
  useEffect(() => {
    document.title = isSignup
      ? 'Sign Up - Salesverse Admin'
      : 'Login - Salesverse Admin';
    return () => {
      document.title = 'Salesverse - Admin Portal';
    };
  }, [isSignup]);

  return (
    <div className='min-h-screen flex flex-col md:flex-row'>
      {/* Left Side - Image Background with Logo */}
      <div className='hidden md:flex md:w-1/2 relative overflow-hidden'>
        {/* Background Image */}
        <div
          className='absolute inset-0 bg-cover bg-center'
          style={{ backgroundImage: `url(${backgroundImage})` }}
        >
          {/* Theme Overlay */}
          <div
            className={`absolute inset-0 bg-${getColorClasses('primary')} opacity-70`}
          ></div>
        </div>

        {/* Logo centered on the left side */}
        <div className='z-10 absolute inset-0 flex justify-center items-center'>
          <Logo size='xl' variant='light' />
        </div>
      </div>

      {/* Right Side - Login/Signup Form */}
      <div className='flex-1 flex flex-col justify-center items-center p-8 md:p-12 bg-white'>
        <div className='w-full max-w-md'>
          <div className='md:hidden mb-8 flex justify-center'>
            <Logo size='lg' />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className='mb-8'>
              <h2 className='text-3xl font-bold text-gray-900'>
                {isSignup ? 'Sign Up' : 'Sign In'}
              </h2>
              {!isSignup && (
                <p className='text-gray-600 mt-2'>
                  Welcome back! Please enter your details.
                </p>
              )}
            </div>

            {isSignup ? <SignupForm /> : <LoginForm />}

            <div className='mt-6 text-center'>
              <p className='text-gray-600'>
                {isSignup
                  ? 'Already have an account?'
                  : "Don't have an account?"}
                <button
                  onClick={() => setIsSignup(!isSignup)}
                  className={`ml-2 text-${getColorClasses('primary')} hover:text-${getColorClasses('hover')} font-medium`}
                >
                  {isSignup ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

// SignupForm component
const SignupForm: React.FC = () => {
  const { getColorClasses } = useTheme();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    username: '',
    password: '',
    repeatPassword: '',
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.repeatPassword) {
      alert("Passwords don't match");
      return;
    }

    if (!agreedToTerms) {
      alert('Please agree to the Terms of Use');
      return;
    }

    setIsLoading(true);
    // Here you would typically call an API to register the user
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Account created successfully! Please sign in.');
    } catch {
      // Handle registration error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div>
        <label
          htmlFor='fullName'
          className='block text-sm font-medium text-gray-600'
        >
          Full Name
        </label>
        <input
          type='text'
          id='fullName'
          name='fullName'
          value={formData.fullName}
          onChange={handleChange}
          placeholder='Name...'
          className={`mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-${getColorClasses('primary')} focus:ring-${getColorClasses('primary')}`}
          required
        />
      </div>

      <div>
        <label
          htmlFor='email'
          className='block text-sm font-medium text-gray-600'
        >
          Email
        </label>
        <input
          type='email'
          id='email'
          name='email'
          value={formData.email}
          onChange={handleChange}
          placeholder='Email address...'
          className={`mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-${getColorClasses('primary')} focus:ring-${getColorClasses('primary')}`}
          required
        />
      </div>

      <div>
        <label
          htmlFor='username'
          className='block text-sm font-medium text-gray-600'
        >
          Username
        </label>
        <input
          type='text'
          id='username'
          name='username'
          value={formData.username}
          onChange={handleChange}
          placeholder='Username...'
          className={`mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-${getColorClasses('primary')} focus:ring-${getColorClasses('primary')}`}
          required
        />
      </div>

      <div>
        <label
          htmlFor='password'
          className='block text-sm font-medium text-gray-600'
        >
          Password
        </label>
        <input
          type='password'
          id='password'
          name='password'
          value={formData.password}
          onChange={handleChange}
          placeholder='••••••••••'
          className={`mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-${getColorClasses('primary')} focus:ring-${getColorClasses('primary')}`}
          required
        />
      </div>

      <div>
        <label
          htmlFor='repeatPassword'
          className='block text-sm font-medium text-gray-600'
        >
          Repeat Password
        </label>
        <input
          type='password'
          id='repeatPassword'
          name='repeatPassword'
          value={formData.repeatPassword}
          onChange={handleChange}
          placeholder='••••••••••'
          className={`mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-${getColorClasses('primary')} focus:ring-${getColorClasses('primary')}`}
          required
        />
      </div>

      <div className='flex items-center'>
        <input
          type='checkbox'
          id='agree'
          checked={agreedToTerms}
          onChange={e => setAgreedToTerms(e.target.checked)}
          className={`h-4 w-4 text-${getColorClasses('primary')} focus:ring-${getColorClasses('primary')} border-gray-300 rounded`}
        />
        <label htmlFor='agree' className='ml-2 block text-sm text-gray-600'>
          I agree to the{' '}
          <a
            href='#'
            className={`text-${getColorClasses('primary')} hover:text-${getColorClasses('hover')}`}
          >
            Terms of Use
          </a>
        </label>
      </div>

      <button
        type='submit'
        disabled={isLoading}
        className={`w-full bg-${getColorClasses('primary')} text-white py-2 px-4 rounded-lg hover:bg-${getColorClasses('hover')} focus:outline-none focus:ring-2 focus:ring-${getColorClasses('primary')} focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isLoading ? 'Creating Account...' : 'Create Account'}
      </button>
    </form>
  );
};

export default LoginPage;
