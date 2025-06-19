import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import SuperAdminRoute from './components/auth/SuperAdminRoute';
import LoadingScreen from './components/ui/LoadingScreen';
import LoginPage from './features/auth/components/LoginPage';
import { useAuth } from './hooks/useAuth';

// Lazy load dashboard pages
const DashboardLayout = lazy(
  () => import('./components/layout/DashboardLayout')
);
const Dashboard = lazy(
  () => import('./features/dashboard/components/Dashboard')
);
const AccessControl = lazy(
  () => import('./features/user-management/components/AccessControl')
);
const AdminActivityLogs = lazy(
  () => import('./features/activity-management/components/AdminActivityLogs')
);
const MastersPage = lazy(
  () => import('./features/masters/components/MastersPage')
);
const ReportPage = lazy(
  () => import('./features/reports/components/ReportPage')
);
const UserManagementPage = lazy(
  () => import('./features/user-management/components/UserManagementPage')
);
const AdminUserManagementPage = lazy(
  () => import('./features/user-management/components/AdminUserManagementPage')
);
const ActivityManagementPage = lazy(
  () =>
    import('./features/activity-management/components/ActivityManagementPage')
);
const QCDiscrepancyPage = lazy(
  () => import('./features/qc-discrepancy/components/QCDiscrepancyPage')
);
const PresalesToolsPage = lazy(
  () => import('./features/presales-tools/components/PresalesToolsPage')
);
const CreateProduct = lazy(
  () => import('./features/presales-tools/CreateProduct')
);
const ResourceCenter = lazy(
  () => import('./features/resource-center/ResourceCenter')
);
const Presentation = lazy(
  () => import('./features/presales-tools/Presentation')
);
const CreateProject = lazy(() => import('./features/project/CreateProject'));
const NotFoundPage = lazy(() => import('./components/shared/NotFoundPage'));
const QCDiscrepancyDetailPage = lazy(
  () => import('./features/qc-discrepancy/pages/QCDiscrepancyDetailPage')
);
const ModuleTablePage = lazy(
  () => import('./features/modules/components/ModuleTablePage')
);

function App() {
  const { isAuthenticated, loading, checkAuth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      <Route
        path='/login'
        element={
          !isAuthenticated ? (
            <LoginPage />
          ) : (
            <Navigate to='/masters/channel' replace />
          )
        }
      />
      {/* Standalone QC Discrepancy Detail Page (no sidebar/layout) */}
      <Route path='/qc-discrepancy/:id' element={<QCDiscrepancyDetailPage />} />
      <Route
        path='/'
        element={
          isAuthenticated ? (
            <Suspense fallback={<LoadingScreen />}>
              <DashboardLayout />
            </Suspense>
          ) : (
            <Navigate to='/login' replace />
          )
        }
      >
        <Route index element={<Navigate to='/masters/channel' replace />} />
        <Route path='dashboard' element={<Dashboard />} />
        <Route path='access-control' element={<AccessControl />} />
        <Route path='admin-activity-logs' element={<AdminActivityLogs />} />
        <Route path='masters/*' element={<MastersPage />} />
        <Route path='report' element={<ReportPage />} />
        <Route path='user-management/*' element={<UserManagementPage />} />
        <Route
          path='admin-user-management'
          element={
            <SuperAdminRoute>
              <Suspense fallback={<LoadingScreen />}>
                <AdminUserManagementPage />
              </Suspense>
            </SuperAdminRoute>
          }
        />
        <Route
          path='activity-management'
          element={<ActivityManagementPage />}
        />
        <Route path='qc-discrepancy' element={<QCDiscrepancyPage />} />
        <Route
          path='modules/*'
          element={
            <SuperAdminRoute>
              <Suspense fallback={<LoadingScreen />}>
                <ModuleTablePage />
              </Suspense>
            </SuperAdminRoute>
          }
        />
        <Route
          path='create-project'
          element={
            <SuperAdminRoute>
              <Suspense fallback={<LoadingScreen />}>
                <CreateProject />
              </Suspense>
            </SuperAdminRoute>
          }
        />
        <Route path='presales-tools' element={<PresalesToolsPage />}>
          <Route index element={<Navigate to='create-product' replace />} />
          <Route
            path='create-product'
            element={
              <Suspense fallback={<LoadingScreen />}>
                <CreateProduct />
              </Suspense>
            }
          />
          <Route
            path='resource-center'
            element={
              <Suspense fallback={<LoadingScreen />}>
                <ResourceCenter />
              </Suspense>
            }
          />
          <Route
            path='presentation'
            element={
              <Suspense fallback={<LoadingScreen />}>
                <Presentation />
              </Suspense>
            }
          />
        </Route>
      </Route>
      <Route path='*' element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
