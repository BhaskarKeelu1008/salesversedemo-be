import React from 'react';

const ActivityManagementPage: React.FC = () => {
  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold text-gray-900'>
          Activity Management
        </h1>
      </div>

      <div className='bg-white p-6 rounded-lg shadow'>
        <h2 className='text-lg font-medium mb-4'>Activity Management</h2>
        <p className='text-gray-600'>Manage activities here.</p>
      </div>
    </div>
  );
};

export default ActivityManagementPage;
