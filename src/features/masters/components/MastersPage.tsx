import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Import master subpages
const ChannelMaster = React.lazy(() => import('../ChannelMaster'));
const HierarchyMaster = React.lazy(() => import('../HierarchyMaster'));
const RoleMaster = React.lazy(() => import('../RoleMaster'));
const DesignationMaster = React.lazy(() => import('../DesignationMaster'));
const ProductCategoryMaster = React.lazy(
  () => import('../ProductCategoryMaster')
);
const ResourceCategoryMaster = React.lazy(
  () => import('../ResourceCategoryMaster')
);

const MastersPage: React.FC = () => {
  return (
    <Routes>
      <Route index element={<Navigate to='channel' replace />} />
      <Route path='channel' element={<ChannelMaster />} />
      <Route path='hierarchy' element={<HierarchyMaster />} />
      <Route path='role' element={<RoleMaster />} />
      <Route path='designation' element={<DesignationMaster />} />
      <Route path='product-category' element={<ProductCategoryMaster />} />
      <Route path='resource-category' element={<ResourceCategoryMaster />} />
    </Routes>
  );
};

export default MastersPage;
