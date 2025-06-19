import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';
import { Eye, EyeOff } from 'lucide-react';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      label,
      error,
      leftIcon,
      rightIcon,
      fullWidth = false,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const isPassword = type === 'password';

    const togglePasswordVisibility = () => {
      setShowPassword(prev => !prev);
    };

    return (
      <div className={cn('space-y-1', fullWidth ? 'w-full' : '')}>
        {label && (
          <label
            htmlFor={props.id}
            className='block text-sm font-medium text-gray-700'
          >
            {label}
          </label>
        )}
        <div className='relative'>
          {leftIcon && (
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              {leftIcon}
            </div>
          )}
          <input
            type={isPassword ? (showPassword ? 'text' : 'password') : type}
            className={cn(
              'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50',
              error ? 'border-error-500 focus:ring-error-500' : '',
              leftIcon ? 'pl-10' : '',
              rightIcon || isPassword ? 'pr-10' : '',
              fullWidth ? 'w-full' : '',
              className
            )}
            ref={ref}
            {...props}
          />
          {(rightIcon || isPassword) && (
            <div className='absolute inset-y-0 right-0 pr-3 flex items-center'>
              {isPassword ? (
                <button
                  type='button'
                  onClick={togglePasswordVisibility}
                  className='text-gray-400 hover:text-gray-500 focus:outline-none'
                >
                  {showPassword ? (
                    <EyeOff className='h-5 w-5' />
                  ) : (
                    <Eye className='h-5 w-5' />
                  )}
                </button>
              ) : (
                rightIcon
              )}
            </div>
          )}
        </div>
        {error && <p className='text-sm text-error-500'>{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
