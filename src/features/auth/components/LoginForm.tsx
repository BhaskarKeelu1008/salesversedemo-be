import { zodResolver } from '@hookform/resolvers/zod';
import { LockKeyhole, LogIn, Mail } from 'lucide-react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../hooks/useAuth';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const { getColorClasses } = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);

    try {
      await login(data.email, data.password);
      toast.success('Login successful');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Login failed';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
      <div>
        <Input
          label='Email'
          type='email'
          placeholder='Enter your email'
          leftIcon={<Mail className='h-4 w-4 text-gray-400' />}
          error={errors.email?.message}
          fullWidth
          className={`bg-gray-50 focus:ring-${getColorClasses('primary')} focus:border-${getColorClasses('primary')}`}
          {...register('email')}
        />
      </div>

      <div>
        <Input
          label='Password'
          type='password'
          placeholder='Enter your password'
          leftIcon={<LockKeyhole className='h-4 w-4 text-gray-400' />}
          error={errors.password?.message}
          fullWidth
          className={`bg-gray-50 focus:ring-${getColorClasses('primary')} focus:border-${getColorClasses('primary')}`}
          {...register('password')}
        />
      </div>

      <div className='flex items-center justify-between'>
        <div className='flex items-center'>
          <input
            id='remember-me'
            name='remember-me'
            type='checkbox'
            className={`h-4 w-4 text-${getColorClasses('primary')} focus:ring-${getColorClasses('primary')} border-gray-300 rounded`}
          />
          <label
            htmlFor='remember-me'
            className='ml-2 block text-sm text-gray-900'
          >
            Remember me
          </label>
        </div>

        <div className='text-sm'>
          <a
            href='#'
            className={`text-sm text-${getColorClasses('primary')} hover:text-${getColorClasses('hover')}`}
          >
            Forgot your password?
          </a>
        </div>
      </div>

      <Button
        type='submit'
        fullWidth
        disabled={isLoading}
        leftIcon={!isLoading && <LogIn className='h-4 w-4' />}
        className={`bg-${getColorClasses('primary')} hover:bg-${getColorClasses('hover')} text-white`}
      >
        {isLoading ? 'Signing in...' : 'Sign in'}
      </Button>
    </form>
  );
};

export default LoginForm;
