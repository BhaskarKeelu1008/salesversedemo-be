import React from 'react';

const Dashboard: React.FC = () => {
  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold text-gray-900'>Dashboard</h1>
        <div className='text-sm text-gray-500'>
          Last updated: Today at 12:30 PM
        </div>
      </div>

      <div className='bg-white p-6 rounded-lg shadow'>
        <h2 className='text-lg font-medium mb-4'>
          Welcome to Salesverse Admin
        </h2>
        <p className='text-gray-600'>
          This is the admin dashboard for Salesverse. Use the navigation menu to
          access different parts of the application.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
