import React from 'react';
import { Outlet } from 'react-router-dom';

const PresalesToolsPage: React.FC = () => {
  return (
    <div className='h-full'>
      <Outlet />
    </div>
  );
};

export default PresalesToolsPage;
