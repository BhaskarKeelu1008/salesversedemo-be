import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import Logo from './Logo';

const LoadingScreen: React.FC = () => {
  const { getColorClasses } = useTheme();

  return (
    <div className='fixed inset-0 flex items-center justify-center bg-white'>
      <div className='flex flex-col items-center'>
        <div className='relative'>
          {/* Spinning border */}
          <div
            className={`absolute inset-0 rounded-full border-4 border-transparent border-t-${getColorClasses('primary')} animate-spin`}
          ></div>
          {/* Static logo */}
          <div className='relative z-10 bg-white rounded-full p-2'>
            <Logo size='lg' withText={false} />
          </div>
        </div>
        <p className='mt-4 text-lg font-medium text-gray-700'>
          Loading Salesverse...
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
