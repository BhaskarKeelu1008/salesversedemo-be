import React from 'react';
import { cn } from '../../utils/cn';
import { useTheme } from '../../context/ThemeContext';
import logoImage from '../../assets/images/logo.png';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'light';
  withText?: boolean;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({
  size = 'md',
  variant = 'default',
  withText = true,
  className,
}) => {
  const { getColorClasses } = useTheme();
  const iconSizes = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
    xl: 'h-16 w-16',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  const colors = {
    default: `text-${getColorClasses('primary')}`,
    light: 'text-white',
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <img
        src={logoImage}
        alt='IORTA TechNXT Logo'
        className={cn(iconSizes[size])}
      />
      {withText && (
        <span
          className={cn(
            'font-bold tracking-tight',
            textSizes[size],
            colors[variant]
          )}
        >
          Sales verse
        </span>
      )}
    </div>
  );
};

export default Logo;
