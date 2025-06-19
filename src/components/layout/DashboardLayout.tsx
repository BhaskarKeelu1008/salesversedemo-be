import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className='h-screen flex overflow-hidden bg-gray-50'>
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main content area */}
      <div className='flex flex-col flex-1 overflow-hidden'>
        <Header toggleSidebar={toggleSidebar} />

        {/* Main content */}
        <main className='flex-1 relative overflow-y-auto focus:outline-none p-6'>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
