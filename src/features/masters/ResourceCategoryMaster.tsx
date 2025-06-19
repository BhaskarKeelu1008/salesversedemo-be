import React from 'react';

const ResourceCategoryMaster: React.FC = () => {
  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold text-gray-900'>
          Resource Category Master
        </h1>
      </div>

      <div className='bg-white p-6 rounded-lg shadow'>
        <h2 className='text-lg font-medium mb-4'>
          Resource Category Management
        </h2>
        <p className='text-gray-600'>Manage resource categories here.</p>
      </div>
    </div>
  );
};

export default ResourceCategoryMaster;
