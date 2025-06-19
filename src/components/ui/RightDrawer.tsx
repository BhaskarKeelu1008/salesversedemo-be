import React from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';
import { useTheme } from '../../context/ThemeContext';

interface RightDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
  stepper?: React.ReactNode;
}

const RightDrawer: React.FC<RightDrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'lg',
  showCloseButton = true,
  stepper,
}) => {
  const { getColorClasses } = useTheme();
  const sizeClasses = {
    sm: 'w-96',
    md: 'w-[500px]',
    lg: 'w-[600px]',
    xl: 'w-[800px]',
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 overflow-hidden'>
      {/* Backdrop */}
      <div
        className='absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300'
        onClick={onClose}
      />

      {/* Drawer */}
      <div className='absolute inset-y-0 right-0 flex max-w-full'>
        <div
          className={`relative ${sizeClasses[size]} flex flex-col bg-white shadow-xl`}
        >
          {/* Header */}
          <div
            className={`flex flex-col border-b border-gray-200 bg-gradient-to-r from-${getColorClasses('bg')} to-white`}
          >
            {/* Title and close button */}
            <div className='flex items-center justify-between px-6 py-4'>
              <h2 className='text-lg font-semibold text-gray-900'>{title}</h2>
              {showCloseButton && (
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={onClose}
                  className='h-8 w-8 p-0'
                >
                  <X className='h-4 w-4' />
                </Button>
              )}
            </div>

            {/* Stepper */}
            {stepper && <div className='px-6 pb-4'>{stepper}</div>}
          </div>

          {/* Content */}
          <div className='flex-1 overflow-y-auto'>
            <div className='p-6'>{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightDrawer;
