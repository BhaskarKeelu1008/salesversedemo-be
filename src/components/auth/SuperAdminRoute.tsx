import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import LoadingScreen from '../ui/LoadingScreen';

interface SuperAdminRouteProps {
  children: React.ReactNode;
}

const SuperAdminRoute: React.FC<SuperAdminRouteProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication and role directly from localStorage
    try {
      const token =
        localStorage.getItem('authToken') ||
        localStorage.getItem('accessToken');
      const userData = localStorage.getItem('user');

      if (!token || !userData) {
        setIsAuthenticated(false);
      } else {
        setIsAuthenticated(true);

        // Parse user data and check role
        const user = JSON.parse(userData);
        if (user && user.role === 'superadmin') {
          setIsSuperAdmin(true);
        }
      }
    } catch {
      // Error checking authentication - ignoring error details
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to='/login' replace />;
  }

  if (!isSuperAdmin) {
    return <Navigate to='/dashboard' replace />;
  }

  return <>{children}</>;
};

export default SuperAdminRoute;
