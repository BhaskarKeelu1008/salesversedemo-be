import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoadingScreen from '../../../components/ui/LoadingScreen';

// Import user management subpages
const SVAgentPage = React.lazy(() => import('../SVAgentPage'));

const UserManagementPage: React.FC = () => {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route index element={<Navigate to='sv-agent' replace />} />
        <Route
          path='sv-agent'
          element={
            <Suspense fallback={<LoadingScreen />}>
              <SVAgentPage />
            </Suspense>
          }
        />
      </Routes>
    </Suspense>
  );
};

export default UserManagementPage;
