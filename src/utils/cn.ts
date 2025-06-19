import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Helper function for conditional class names
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
