import React from 'react';

const AdminActivityLogs: React.FC = () => {
  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold text-gray-900'>
          Admin Activity Logs
        </h1>
      </div>

      <div className='bg-white p-6 rounded-lg shadow'>
        <h2 className='text-lg font-medium mb-4'>Admin Activity Logs</h2>
        <p className='text-gray-600'>
          View and manage all admin activity logs here.
        </p>
      </div>
    </div>
  );
};

export default AdminActivityLogs;
