import React from 'react';
import { Upload } from 'lucide-react';
import { Button } from '../../components/ui/Button';

const ResourceCenter: React.FC = () => {
  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold text-gray-900'>Resource Center</h1>
        <Button variant='default' leftIcon={<Upload className='h-4 w-4' />}>
          Upload Resource
        </Button>
      </div>

      <div className='bg-white p-6 rounded-lg shadow'>
        <h2 className='text-lg font-medium mb-4'>Resources</h2>
        <p className='text-gray-600'>Access and manage your resources here.</p>
      </div>
    </div>
  );
};

export default ResourceCenter;
