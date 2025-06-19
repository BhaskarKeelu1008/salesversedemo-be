import React from 'react';
import { Check } from 'lucide-react';
import { useTheme, ColorScheme } from '../../context/ThemeContext';

const colorOptions: { value: ColorScheme; label: string; color: string }[] = [
  { value: 'purple', label: 'Purple', color: 'bg-purple-600' },
  { value: 'blue', label: 'Blue', color: 'bg-blue-600' },
  { value: 'paleblue', label: 'Pale Blue', color: 'bg-sky-400' },
  { value: 'skyblue', label: 'Sky Blue', color: 'bg-blue-400' },
  { value: 'green', label: 'Green', color: 'bg-green-600' },
  { value: 'orange', label: 'Orange', color: 'bg-orange-600' },
  { value: 'red', label: 'Red', color: 'bg-red-600' },
  { value: 'indigo', label: 'Indigo', color: 'bg-indigo-600' },
];

const ColorSchemeSelector: React.FC = () => {
  const { colorScheme, setColorScheme } = useTheme();

  return (
    <div className='flex flex-wrap gap-2'>
      {colorOptions.map(option => (
        <button
          key={option.value}
          onClick={() => setColorScheme(option.value)}
          className={`relative w-6 h-6 rounded-full ${option.color} border-2 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 ${
            colorScheme === option.value
              ? 'border-white shadow-lg'
              : 'border-gray-300'
          }`}
          title={option.label}
        >
          {colorScheme === option.value && (
            <div className='absolute inset-0 flex items-center justify-center'>
              <Check className='h-3 w-3 text-white' />
            </div>
          )}
        </button>
      ))}
    </div>
  );
};

export default ColorSchemeSelector;
