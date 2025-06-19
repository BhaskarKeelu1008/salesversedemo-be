import { Users, UserX } from 'lucide-react';
import React, { startTransition, Suspense, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import LoadingScreen from '../../../components/ui/LoadingScreen';
import { useTheme } from '../../../context/ThemeContext';
import { setSelectedItem } from '../qcDiscrepancySlice';
import {
  AobApplication,
  fetchAobApplications,
  updateApplicationToUnderReview,
} from '../services/aobApplicationService';

const getApplicantName = (app: AobApplication) =>
  app.applicantName ||
  [app.firstName, app.middleName, app.lastName].filter(Boolean).join(' ');

const getStatus = (app: AobApplication) =>
  app.applicationStatus || app.status || '';

const QCDiscrepancyPage: React.FC = () => {
  const { getColorClasses } = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [applications, setApplications] = useState<AobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingApplication, setUpdatingApplication] = useState<string | null>(
    null
  );

  // Tab state
  const [activeTab, setActiveTab] = useState<
    'submitted' | 'review' | 'approved'
  >('submitted');

  useEffect(() => {
    const loadApplications = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchAobApplications();
        setApplications(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load applications');
      } finally {
        setLoading(false);
      }
    };
    loadApplications();
  }, []);

  // Filter applications based on active tab
  const filteredApplications = applications.filter(app => {
    const status = getStatus(app);
    if (activeTab === 'submitted') {
      return (
        status !== 'approved' &&
        status !== 'qcApproved' &&
        status !== 'underReview'
      );
    } else if (activeTab === 'review') {
      return status === 'underReview';
    } else {
      return status === 'approved' || status === 'qcApproved';
    }
  });

  // Stats for all applications (not filtered)
  const applicationReview = applications.filter(
    app => getStatus(app) === 'underReview'
  ).length;

  const handleUnderReview = async (applicationId: string) => {
    setUpdatingApplication(applicationId);
    try {
      await updateApplicationToUnderReview(applicationId);
      // Refresh the applications list
      const data = await fetchAobApplications();
      setApplications(data);
    } catch (err: any) {
      setError(err.message || 'Failed to update application status');
    } finally {
      setUpdatingApplication(null);
    }
  };

  // Gradient classes (copied from user management)
  const getGradientClasses = () => {
    const colorScheme = getColorClasses('primary').split('-')[0];
    switch (colorScheme) {
      case 'purple':
        return 'bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700';
      case 'blue':
        return 'bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700';
      case 'green':
        return 'bg-gradient-to-r from-green-500 via-green-600 to-green-700';
      case 'orange':
        return 'bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700';
      case 'red':
        return 'bg-gradient-to-r from-red-500 via-red-600 to-red-700';
      case 'indigo':
        return 'bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700';
      default:
        return 'bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700';
    }
  };

  return (
    <Suspense fallback={<LoadingScreen />}>
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <h1 className='text-2xl font-bold text-gray-900'>QC & Discrepancy</h1>
        </div>
        {/* Stats Cards (User Management Style) */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <div
            className={`${getGradientClasses()} p-6 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-200`}
          >
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-white opacity-90'>
                  Total Applications
                </p>
                <h3 className='text-3xl font-bold text-white mt-1'>
                  {applications.length}
                </h3>
              </div>
              <Users className='h-10 w-10 text-white opacity-90' />
            </div>
          </div>
          <div
            className={`${getGradientClasses()} p-6 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-200`}
          >
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-white opacity-90'>
                  Application Review
                </p>
                <h3 className='text-3xl font-bold text-white mt-1'>
                  {applicationReview}
                </h3>
              </div>
              <UserX className='h-10 w-10 text-white opacity-90' />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4'>
          <div className='flex border-b border-gray-200'>
            <button
              onClick={() => setActiveTab('submitted')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'submitted'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Application Submitted (
              {
                applications.filter(app => {
                  const status = getStatus(app);
                  return (
                    status !== 'approved' &&
                    status !== 'qcApproved' &&
                    status !== 'underReview'
                  );
                }).length
              }
              )
            </button>
            <button
              onClick={() => setActiveTab('review')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'review'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Application Review (
              {
                applications.filter(app => getStatus(app) === 'underReview')
                  .length
              }
              )
            </button>
            <button
              onClick={() => setActiveTab('approved')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'approved'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Approved (
              {
                applications.filter(
                  app =>
                    getStatus(app) === 'approved' ||
                    getStatus(app) === 'qcApproved'
                ).length
              }
              )
            </button>
          </div>
        </div>

        {/* Table */}
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
          <div className='overflow-x-auto'>
            {loading ? (
              <LoadingScreen />
            ) : error ? (
              <div className='text-red-500 p-4'>{error}</div>
            ) : (
              <table className='min-w-full divide-y divide-gray-200 table-fixed'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='w-1/6 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Application ID
                    </th>
                    <th className='w-1/5 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Applicant Name
                    </th>
                    <th className='w-1/6 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Email
                    </th>
                    <th className='w-1/6 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Mobile
                    </th>
                    <th className='w-1/6 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Status
                    </th>
                    <th className='w-1/6 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Created At
                    </th>
                    <th className='w-1/6 px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {filteredApplications.map(app => {
                    const status = getStatus(app);
                    return (
                      <tr key={app._id} className='hover:bg-gray-50'>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                          {app.applicationId}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                          {getApplicantName(app)}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                          {app.emailAddress || '-'}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                          {app.mobileNumber || '-'}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap capitalize text-sm'>
                          <span
                            className={
                              status === 'qcApproved'
                                ? 'bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium'
                                : status === 'qcPending'
                                  ? 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium'
                                  : 'bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium'
                            }
                          >
                            {status}
                          </span>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                          {new Date(app.createdAt).toLocaleString()}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-center text-sm font-medium'>
                          <button
                            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                              updatingApplication === app.applicationId
                                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                : `bg-${getColorClasses('primary')} text-white hover:opacity-90`
                            }`}
                            onClick={() => {
                              if (activeTab === 'submitted') {
                                handleUnderReview(app.applicationId);
                              } else {
                                startTransition(() => {
                                  dispatch(setSelectedItem(app));
                                  navigate(`/qc-discrepancy/${app._id}`);
                                });
                              }
                            }}
                            disabled={updatingApplication === app.applicationId}
                          >
                            {updatingApplication === app.applicationId
                              ? 'Updating...'
                              : activeTab === 'submitted'
                                ? 'Review'
                                : 'View'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </Suspense>
  );
};

export default QCDiscrepancyPage;
