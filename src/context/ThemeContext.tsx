import React, { createContext, useContext, useState, useEffect } from 'react';

export type ColorScheme =
  | 'purple'
  | 'blue'
  | 'green'
  | 'orange'
  | 'red'
  | 'indigo'
  | 'paleblue'
  | 'skyblue';

interface ThemeContextType {
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
  getColorClasses: (
    type:
      | 'primary'
      | 'secondary'
      | 'accent'
      | 'hover'
      | 'text'
      | 'bg'
      | 'light'
      | 'dark'
  ) => string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Color scheme configurations
const colorSchemes = {
  purple: {
    primary: 'purple-600',
    secondary: 'purple-700',
    accent: 'purple-500',
    hover: 'purple-700',
    text: 'purple-600',
    bg: 'purple-50',
    light: 'purple-100',
    dark: 'purple-800',
  },
  blue: {
    primary: 'blue-600',
    secondary: 'blue-700',
    accent: 'blue-500',
    hover: 'blue-700',
    text: 'blue-600',
    bg: 'blue-50',
    light: 'blue-100',
    dark: 'blue-800',
  },
  paleblue: {
    primary: 'sky-400',
    secondary: 'sky-500',
    accent: 'sky-300',
    hover: 'sky-500',
    text: 'sky-500',
    bg: 'sky-50',
    light: 'sky-100',
    dark: 'sky-600',
  },
  skyblue: {
    primary: 'blue-400',
    secondary: 'blue-500',
    accent: 'blue-300',
    hover: 'blue-500',
    text: 'blue-500',
    bg: 'blue-50',
    light: 'blue-100',
    dark: 'blue-600',
  },
  green: {
    primary: 'green-600',
    secondary: 'green-700',
    accent: 'green-500',
    hover: 'green-700',
    text: 'green-600',
    bg: 'green-50',
    light: 'green-100',
    dark: 'green-800',
  },
  orange: {
    primary: 'orange-600',
    secondary: 'orange-700',
    accent: 'orange-500',
    hover: 'orange-700',
    text: 'orange-600',
    bg: 'orange-50',
    light: 'orange-100',
    dark: 'orange-800',
  },
  red: {
    primary: 'red-600',
    secondary: 'red-700',
    accent: 'red-500',
    hover: 'red-700',
    text: 'red-600',
    bg: 'red-50',
    light: 'red-100',
    dark: 'red-800',
  },
  indigo: {
    primary: 'indigo-600',
    secondary: 'indigo-700',
    accent: 'indigo-500',
    hover: 'indigo-700',
    text: 'indigo-600',
    bg: 'indigo-50',
    light: 'indigo-100',
    dark: 'indigo-800',
  },
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [colorScheme, setColorScheme] = useState<ColorScheme>(() => {
    // Load from localStorage or default to purple
    const saved = localStorage.getItem('colorScheme');
    return (saved as ColorScheme) || 'purple';
  });

  useEffect(() => {
    // Save to localStorage whenever it changes
    localStorage.setItem('colorScheme', colorScheme);

    // Update CSS custom properties for global theme
    const root = document.documentElement;
    const scheme = colorSchemes[colorScheme];

    root.style.setProperty(
      '--color-primary',
      `rgb(var(--${scheme.primary.replace('-', '-')}))`
    );
    root.style.setProperty(
      '--color-secondary',
      `rgb(var(--${scheme.secondary.replace('-', '-')}))`
    );
    root.style.setProperty(
      '--color-accent',
      `rgb(var(--${scheme.accent.replace('-', '-')}))`
    );
  }, [colorScheme]);

  const getColorClasses = (
    type:
      | 'primary'
      | 'secondary'
      | 'accent'
      | 'hover'
      | 'text'
      | 'bg'
      | 'light'
      | 'dark'
  ) => {
    const scheme = colorSchemes[colorScheme];
    return scheme[type] || '';
  };

  const value = {
    colorScheme,
    setColorScheme,
    getColorClasses,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
