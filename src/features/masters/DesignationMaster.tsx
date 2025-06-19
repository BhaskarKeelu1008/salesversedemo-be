import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Loader2, Plus, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Pagination } from '../../components/ui/Pagination';
import { useTheme } from '../../context/ThemeContext';
import { Channel } from '../../services/channelService';
import {
  Designation,
  createDesignation,
  getDesignations,
  updateDesignationStatus,
  validateDesignationRelationships,
} from '../../services/designationService';
import { Hierarchy } from '../../services/hierarchyService';
import { Role } from '../../services/roleService';
import { PaginatedResponse } from '../../types';

interface StatusModalProps {
  designation: Designation;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

const StatusModal: React.FC<StatusModalProps> = ({
  designation,
  onConfirm,
  onCancel,
  isLoading,
}) => {
  const { getColorClasses } = useTheme();
  const newStatus = designation.status === 'active' ? 'inactive' : 'active';

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
      <div className='bg-white rounded-lg shadow-xl max-w-md w-full p-6'>
        <div className='flex items-center gap-3 mb-4'>
          <AlertTriangle className='h-6 w-6 text-warning-500' />
          <h2 className='text-lg font-medium'>Confirm Status Change</h2>
        </div>

        <p className='text-gray-600 mb-6'>
          Are you sure you want to change the status of designation "
          {designation.name}" from{' '}
          <span className='font-medium'>{designation.status}</span> to{' '}
          <span className='font-medium'>{newStatus}</span>?
        </p>

        <div className='flex justify-end space-x-3'>
          <Button variant='outline' onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant={newStatus === 'active' ? 'default' : 'destructive'}
            onClick={onConfirm}
            disabled={isLoading}
            leftIcon={
              isLoading ? (
                <Loader2 className='h-4 w-4 animate-spin' />
              ) : undefined
            }
            className={
              newStatus === 'active'
                ? `bg-${getColorClasses('primary')} hover:bg-${getColorClasses('hover')}`
                : ''
            }
          >
            {isLoading
              ? 'Updating...'
              : `Confirm ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`}
          </Button>
        </div>
      </div>
    </div>
  );
};

// Drawer component for right-side drawer
interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}
const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
}) => {
  const { getColorClasses } = useTheme();
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 bg-black bg-opacity-50 z-40'
            onClick={onClose}
          />
          <div className='fixed inset-0 z-50 flex items-center justify-end p-4'>
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className='h-[calc(100%-2rem)] w-full max-w-sm bg-white shadow-xl flex flex-col rounded-xl border border-gray-200'
            >
              <div
                className={`flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-${getColorClasses('primary')} text-white rounded-t-xl`}
              >
                <div className='flex items-center'>
                  <h2 className='text-xl font-semibold'>{title}</h2>
                </div>
                <button
                  onClick={onClose}
                  className={`p-1 rounded-full hover:bg-${getColorClasses('hover')} transition-colors`}
                  aria-label='Close'
                >
                  <X className='h-5 w-5 text-white' />
                </button>
              </div>
              <div className='flex-1 overflow-y-auto px-6 py-5'>{children}</div>
              <div className='border-t border-gray-200 px-6 py-4 bg-gray-50 rounded-b-xl'>
                {footer}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

const DesignationMaster: React.FC = () => {
  const { getColorClasses } = useTheme();
  const [designationData, setDesignationData] = useState<
    PaginatedResponse<Designation>
  >({
    data: [],
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      itemsPerPage: 10,
      showingFrom: 0,
      showingTo: 0,
    },
  });
  const [channels] = useState<Channel[]>([]);
  const [hierarchies] = useState<Hierarchy[]>([]);
  const [roles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    channelId: '',
    hierarchyId: '',
    roleId: '',
    name: '',
    code: '',
    status: 'active',
    description: '',
    order: '',
  });

  const [statusModal, setStatusModal] = useState<{
    show: boolean;
    designation: Designation | null;
  }>({
    show: false,
    designation: null,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getDesignations(
        {},
        {
          page: currentPage,
          limit: itemsPerPage,
        }
      );
      setDesignationData(response);
    } catch {
      toast.error('Failed to fetch designations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  const validateForm = async () => {
    if (
      !formData.channelId ||
      !formData.hierarchyId ||
      !formData.roleId ||
      !formData.name.trim()
    ) {
      return { valid: false, message: 'All fields are required' };
    }

    const relationshipValidation = await validateDesignationRelationships(
      formData.channelId,
      formData.hierarchyId,
      formData.roleId
    );

    if (!relationshipValidation.valid) {
      return relationshipValidation;
    }

    return { valid: true };
  };

  const handleCreateDesignation = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = await validateForm();
    if (!validation.valid) {
      toast.error(validation.message || 'Validation failed');
      return;
    }

    setCreating(true);
    try {
      const response = await createDesignation(
        formData.channelId,
        formData.hierarchyId,
        formData.roleId,
        formData.name.trim(),
        formData.status as 'active' | 'inactive',
        formData.description,
        parseInt(formData.order) || 0,
        formData.code || formData.name.toUpperCase().replace(/\s+/g, '_')
      );

      if (response.success) {
        // Close modal and reset form first
        setShowAddModal(false);
        setFormData({
          channelId: '',
          hierarchyId: '',
          roleId: '',
          name: '',
          code: '',
          status: 'active',
          description: '',
          order: '',
        });

        // Then refresh the data
        await fetchData();

        toast.success(response.message || 'Designation created successfully');
      } else {
        throw new Error(response.message || 'Failed to create designation');
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to create designation'
      );
    } finally {
      setCreating(false);
    }
  };

  const handleStatusUpdate = (designation: Designation) => {
    setStatusModal({ show: true, designation });
  };

  const confirmStatusUpdate = async () => {
    if (!statusModal.designation) return;

    const newStatus =
      statusModal.designation.status === 'active' ? 'inactive' : 'active';
    setUpdating(statusModal.designation.id);

    try {
      const updatedDesignation = await updateDesignationStatus(
        statusModal.designation.id,
        newStatus
      );
      setDesignationData(prev => ({
        ...prev,
        data: prev.data.map(designation =>
          designation.id === statusModal.designation?.id
            ? updatedDesignation
            : designation
        ),
      }));
      toast.success('Status updated successfully');
      setStatusModal({ show: false, designation: null });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update status'
      );
    } finally {
      setUpdating(null);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      channelId: '',
      hierarchyId: '',
      roleId: '',
      name: '',
      code: '',
      status: 'active',
      description: '',
      order: '',
    });
    setShowAddModal(false);
  };

  const renderDrawerFooter = () => (
    <div className='flex justify-end space-x-3'>
      <Button variant='outline' onClick={resetForm} disabled={creating}>
        Cancel
      </Button>
      <Button
        type='submit'
        form='designationForm'
        disabled={
          !formData.channelId ||
          !formData.hierarchyId ||
          !formData.roleId ||
          !formData.name ||
          creating
        }
        leftIcon={
          creating ? <Loader2 className='h-4 w-4 animate-spin' /> : undefined
        }
        className={`bg-${getColorClasses('primary')} hover:bg-${getColorClasses('hover')} text-white`}
      >
        {creating ? 'Creating...' : 'Create Designation'}
      </Button>
    </div>
  );

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold text-gray-900'>Designation Master</h1>
        <Button
          onClick={() => setShowAddModal(true)}
          leftIcon={<Plus className='h-4 w-4' />}
          className={`bg-${getColorClasses('primary')} hover:bg-${getColorClasses('hover')} text-white`}
        >
          Create New
        </Button>
      </div>
      <div className='bg-white rounded-lg shadow overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200 table-fixed'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Channel
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Hierarchy
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Role
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Designation
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Code
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Status
                </th>
                <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className='px-6 py-4 text-center text-sm text-gray-500'
                  >
                    <div className='flex items-center justify-center space-x-2'>
                      <Loader2 className='h-5 w-5 animate-spin' />
                      <span>Loading designations...</span>
                    </div>
                  </td>
                </tr>
              ) : designationData.data.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className='px-6 py-4 text-center text-sm text-gray-500'
                  >
                    No designations found
                  </td>
                </tr>
              ) : (
                designationData.data.map(designation => (
                  <tr key={designation.id} className='hover:bg-gray-50'>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 truncate'>
                      {designation.channelName}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 truncate'>
                      {designation.hierarchyName}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 truncate'>
                      {designation.roleName}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 truncate'>
                      {designation.name}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 truncate'>
                      {designation.code}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${designation.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                      >
                        {designation.status === 'active'
                          ? 'Active'
                          : 'Inactive'}
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-center text-sm font-medium'>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => handleStatusUpdate(designation)}
                        disabled={updating === designation.id}
                        className={`text-${getColorClasses('primary')} hover:text-${getColorClasses('hover')} hover:bg-${getColorClasses('bg')} w-full justify-center`}
                      >
                        {designation.status === 'active'
                          ? 'Deactivate'
                          : 'Activate'}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Add Designation Drawer */}
      <Drawer
        isOpen={showAddModal}
        onClose={resetForm}
        title='Create New Designation'
        footer={renderDrawerFooter()}
      >
        <form onSubmit={handleCreateDesignation} id='designationForm'>
          <div className='space-y-4'>
            <div>
              <label
                htmlFor='channel'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Channel
              </label>
              <select
                id='channel'
                className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-${getColorClasses('primary')} focus:border-${getColorClasses('primary')} sm:text-sm rounded-md bg-gray-50`}
                value={formData.channelId}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    channelId: e.target.value,
                    hierarchyId: '',
                    roleId: '',
                  }))
                }
                required
              >
                <option value=''>Select a channel</option>
                {channels.map(channel => (
                  <option key={channel.id} value={channel.id}>
                    {channel.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor='hierarchy'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Hierarchy
              </label>
              <select
                id='hierarchy'
                className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-${getColorClasses('primary')} focus:border-${getColorClasses('primary')} sm:text-sm rounded-md bg-gray-50`}
                value={formData.hierarchyId}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    hierarchyId: e.target.value,
                  }))
                }
                required
                disabled={!formData.channelId}
              >
                <option value=''>Select a hierarchy</option>
                {hierarchies.map(hierarchy => (
                  <option key={hierarchy.id} value={hierarchy.id}>
                    {hierarchy.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor='role'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Role
              </label>
              <select
                id='role'
                className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-${getColorClasses('primary')} focus:border-${getColorClasses('primary')} sm:text-sm rounded-md bg-gray-50`}
                value={formData.roleId}
                onChange={e =>
                  setFormData(prev => ({ ...prev, roleId: e.target.value }))
                }
                required
                disabled={!formData.channelId}
              >
                <option value=''>Select a role</option>
                {roles.map(role => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label='Designation Name'
              type='text'
              value={formData.name}
              onChange={e =>
                setFormData(prev => ({ ...prev, name: e.target.value }))
              }
              placeholder='Enter designation name'
              fullWidth
              required
              className='bg-gray-50'
            />
            <Input
              label='Designation Code'
              type='text'
              value={formData.code}
              onChange={e =>
                setFormData(prev => ({ ...prev, code: e.target.value }))
              }
              placeholder='Enter designation code (e.g., SALES_MGR)'
              fullWidth
              className='bg-gray-50'
            />
            <Input
              label='Description'
              type='text'
              value={formData.description}
              onChange={e =>
                setFormData(prev => ({ ...prev, description: e.target.value }))
              }
              placeholder='Enter designation description'
              fullWidth
              className='bg-gray-50'
            />
            <Input
              label='Order'
              type='number'
              value={formData.order}
              onChange={e =>
                setFormData(prev => ({ ...prev, order: e.target.value }))
              }
              placeholder='Enter designation order'
              fullWidth
              className='bg-gray-50'
            />
            <div className='flex items-center justify-between'>
              <span className='text-sm text-gray-700'>Enable Designation</span>
              <div className='relative inline-block w-10 align-middle select-none'>
                <input
                  type='checkbox'
                  name='toggle'
                  id='toggle'
                  className='sr-only'
                  checked={formData.status === 'active'}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      status: e.target.checked ? 'active' : 'inactive',
                    }))
                  }
                />
                <label
                  htmlFor='toggle'
                  className={`block h-6 w-10 rounded-full cursor-pointer ${formData.status === 'active' ? `bg-${getColorClasses('primary')}` : 'bg-gray-300'}`}
                >
                  <span
                    className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out transform ${formData.status === 'active' ? 'translate-x-4' : 'translate-x-0'}`}
                  ></span>
                </label>
              </div>
            </div>
          </div>
        </form>
      </Drawer>
      {/* Status Confirmation Modal */}
      {statusModal.show && statusModal.designation && (
        <StatusModal
          designation={statusModal.designation}
          onConfirm={confirmStatusUpdate}
          onCancel={() => setStatusModal({ show: false, designation: null })}
          isLoading={updating === statusModal.designation.id}
        />
      )}
      {/* Pagination */}
      <Pagination
        currentPage={designationData.pagination.currentPage}
        totalPages={designationData.pagination.totalPages}
        onPageChange={setCurrentPage}
        totalItems={designationData.pagination.totalItems}
        showingFrom={designationData.pagination.showingFrom}
        showingTo={designationData.pagination.showingTo}
      />
    </div>
  );
};

export default DesignationMaster;
