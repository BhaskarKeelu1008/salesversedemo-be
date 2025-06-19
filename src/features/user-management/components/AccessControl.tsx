import React from 'react';

const AccessControl: React.FC = () => {
  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold text-gray-900'>Access Control</h1>
      </div>

      <div className='bg-white p-6 rounded-lg shadow'>
        <h2 className='text-lg font-medium mb-4'>Access Control Management</h2>
        <p className='text-gray-600'>Manage user roles and permissions here.</p>
      </div>
    </div>
  );
};

export default AccessControl;
