import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { LogIn, Mail, LockKeyhole } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { LoginCredentials } from '../../types';

// Form validation schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginForm: React.FC = () => {
  const { login, error, clearError } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  // Clear any auth errors when form is interacted with
  React.useEffect(() => {
    if (error) {
      clearError();
    }
  }, [error, clearError]);

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);

    try {
      const credentials: LoginCredentials = {
        email: data.email,
        password: data.password,
      };

      await login(credentials);
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
    <form
      onSubmit={handleSubmit(onSubmit)}
      className='space-y-6 w-full max-w-sm'
    >
      <div className='space-y-4'>
        <Input
          id='email'
          type='email'
          label='Email Address'
          placeholder='admin@salesverse.com'
          fullWidth
          leftIcon={<Mail className='h-5 w-5 text-gray-400' />}
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          id='password'
          type='password'
          label='Password'
          placeholder='••••••••'
          fullWidth
          leftIcon={<LockKeyhole className='h-5 w-5 text-gray-400' />}
          error={errors.password?.message}
          {...register('password')}
        />

        <div className='flex items-center justify-between'>
          <div className='flex items-center'>
            <input
              id='rememberMe'
              type='checkbox'
              className='h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded'
              {...register('rememberMe')}
            />
            <label
              htmlFor='rememberMe'
              className='ml-2 block text-sm text-gray-700'
            >
              Remember me
            </label>
          </div>

          <div className='text-sm'>
            <a
              href='#'
              className='font-medium text-primary-600 hover:text-primary-500'
            >
              Forgot password?
            </a>
          </div>
        </div>
      </div>

      <Button
        type='submit'
        fullWidth
        isLoading={isLoading}
        leftIcon={!isLoading && <LogIn className='h-4 w-4' />}
      >
        Sign in
      </Button>

      <div className='text-center text-sm text-gray-500'>
        <p>Test credentials: admin@salesverse.com / admin123</p>
      </div>
    </form>
  );
};

export default LoginForm;
