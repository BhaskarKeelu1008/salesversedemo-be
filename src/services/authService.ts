import { getApiUrl } from '../config';
import { User } from '../types';

// Mock delay to simulate API calls
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock user data
const mockUser: User = {
  id: '1',
  name: 'Admin User',
  email: 'admin@salesverse.com',
  role: 'admin',
  avatar: 'https://avatars.githubusercontent.com/u/1?v=4',
};

// Mock logout function
export const logoutUser = async (): Promise<void> => {
  await delay(500); // Simulate API delay
  // Clear user data and access token from localStorage
  localStorage.removeItem('user');
  localStorage.removeItem('accessToken');
  return;
};

// Mock function to get current user
export const getCurrentUser = async (): Promise<User> => {
  const userData = localStorage.getItem('user');
  if (userData) {
    return JSON.parse(userData);
  }
  return mockUser;
};

// Function to get user data from localStorage
export const getUserFromStorage = (): User | null => {
  const userData = localStorage.getItem('user');
  return userData ? JSON.parse(userData) : null;
};

export const login = async (email: string, password: string) => {
  const response = await fetch(getApiUrl('api/auth/login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Login failed');
  }

  const data = await response.json();

  // Store user data and access token in localStorage
  localStorage.setItem('user', JSON.stringify(data.data.user));
  localStorage.setItem('accessToken', data.data.accessToken);

  return data;
};
