import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Loader2, Plus, Search, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Pagination } from '../../components/ui/Pagination';
import { useTheme } from '../../context/ThemeContext';
import { getChannels } from '../../services/channelService';
import {
  Hierarchy,
  createHierarchy,
  getHierarchies,
  updateHierarchyStatus,
} from '../../services/hierarchyService';
import { PaginatedResponse } from '../../types';

// Define local interfaces to match API responses
interface Channel {
  id: string;
  name: string;
  code: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

interface StatusModalProps {
  hierarchy: Hierarchy;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

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
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 bg-black bg-opacity-50 z-40'
            onClick={onClose}
          />

          {/* Drawer Container with Gap */}
          <div className='fixed inset-0 z-50 flex items-center justify-end p-4'>
            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className='h-[calc(100%-2rem)] w-full max-w-sm bg-white shadow-xl flex flex-col rounded-xl border border-gray-200'
            >
              {/* Fixed Header */}
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

              {/* Scrollable Content */}
              <div className='flex-1 overflow-y-auto px-6 py-5'>{children}</div>

              {/* Fixed Footer */}
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

const StatusModal: React.FC<StatusModalProps> = ({
  hierarchy,
  onConfirm,
  onCancel,
  isLoading,
}) => {
  const { getColorClasses } = useTheme();
  const newStatus = hierarchy.status === 'active' ? 'inactive' : 'active';

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
      <div className='bg-white rounded-lg shadow-xl max-w-md w-full p-6'>
        <div className='flex items-center gap-3 mb-4'>
          <AlertTriangle className='h-6 w-6 text-warning-500' />
          <h2 className='text-lg font-medium'>Confirm Status Change</h2>
        </div>

        <p className='text-gray-600 mb-6'>
          Are you sure you want to change the status of hierarchy "
          {hierarchy.name}" from{' '}
          <span className='font-medium'>{hierarchy.status}</span> to{' '}
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

const HierarchyMaster: React.FC = () => {
  const { getColorClasses } = useTheme();
  const [hierarchyData, setHierarchyData] = useState<
    PaginatedResponse<Hierarchy>
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
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDrawer, setShowAddDrawer] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 10;

  // Form state
  const [formData, setFormData] = useState({
    channelId: '',
    name: '',
    level: '',
    status: 'active',
  });

  // Status modal state
  const [statusModal, setStatusModal] = useState<{
    show: boolean;
    hierarchy: Hierarchy | null;
  }>({
    show: false,
    hierarchy: null,
  });

  // Fetch hierarchies and channels
  const fetchData = async () => {
    try {
      setLoading(true);
      const [hierarchyData, channelData] = await Promise.all([
        getHierarchies(searchQuery, {
          page: currentPage,
          limit: itemsPerPage,
        }),
        getChannels(),
      ]);
      setHierarchyData(hierarchyData);

      // Map the API response to match our Channel interface
      const typedChannels = channelData.data.map((channel: any) => ({
        id: channel.id || channel._id,
        name: channel.name,
        code: channel.code,
        status: channel.status,
        createdAt: channel.createdAt,
        updatedAt: channel.updatedAt,
      }));

      setChannels(typedChannels);
    } catch {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, searchQuery]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle hierarchy creation
  const handleCreateHierarchy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.channelId || !formData.name || !formData.level) return;

    setCreating(true);
    try {
      const level = parseInt(formData.level);
      if (isNaN(level) || level < 1) {
        throw new Error('Level must be a positive number');
      }

      const response = await createHierarchy(
        formData.channelId,
        formData.name.trim(),
        level,
        formData.status as 'active' | 'inactive'
      );

      if (response.success) {
        setShowAddDrawer(false);
        setFormData({ channelId: '', name: '', level: '', status: 'active' });
        await fetchData();
        toast.success(response.message || 'Hierarchy created successfully');
      } else {
        throw new Error(response.message || 'Failed to create hierarchy');
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to create hierarchy'
      );
    } finally {
      setCreating(false);
    }
  };

  // Handle status update
  const handleStatusUpdate = (hierarchy: Hierarchy) => {
    setStatusModal({ show: true, hierarchy });
  };

  const confirmStatusUpdate = async () => {
    if (!statusModal.hierarchy) return;

    const newStatus =
      statusModal.hierarchy.status === 'active' ? 'inactive' : 'active';
    setUpdating(statusModal.hierarchy.id);

    try {
      const updatedHierarchy = await updateHierarchyStatus(
        statusModal.hierarchy.id,
        newStatus
      );
      setHierarchyData(prev => ({
        ...prev,
        data: prev.data.map(hierarchy =>
          hierarchy.id === statusModal.hierarchy?.id
            ? updatedHierarchy
            : hierarchy
        ),
      }));
      toast.success('Status updated successfully');
      setStatusModal({ show: false, hierarchy: null });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update status'
      );
    } finally {
      setUpdating(null);
    }
  };

  const closeDrawer = () => {
    setShowAddDrawer(false);
    setFormData({ channelId: '', name: '', level: '', status: 'active' });
  };

  const renderDrawerFooter = () => (
    <div className='flex justify-end space-x-3'>
      <Button variant='outline' onClick={closeDrawer} disabled={creating}>
        Cancel
      </Button>
      <Button
        onClick={handleCreateHierarchy}
        disabled={
          !formData.channelId || !formData.name || !formData.level || creating
        }
        leftIcon={
          creating ? <Loader2 className='h-4 w-4 animate-spin' /> : undefined
        }
        className={`w-full bg-${getColorClasses('primary')} hover:bg-${getColorClasses('hover')} text-white`}
      >
        {creating ? 'Creating...' : 'Create Hierarchy'}
      </Button>
    </div>
  );

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold text-gray-900'>Hierarchy Master</h1>

        <div className='flex items-center space-x-3'>
          {/* Search moved next to button */}
          <div className='relative w-64'>
            <Input
              type='text'
              placeholder='Search hierarchies...'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              leftIcon={<Search className='h-4 w-4 text-gray-400' />}
              fullWidth
              className='bg-gray-50 border-gray-200'
            />
          </div>

          <Button
            onClick={() => setShowAddDrawer(true)}
            leftIcon={<Plus className='h-4 w-4' />}
            className={`min-w-[140px] bg-${getColorClasses('primary')} hover:bg-${getColorClasses('hover')} text-white`}
          >
            Create New
          </Button>
        </div>
      </div>

      {/* Hierarchies Table */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200 table-fixed'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='w-1/5 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Channel
                </th>
                <th className='w-1/4 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Name
                </th>
                <th className='w-1/6 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Level
                </th>
                <th className='w-1/6 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Status
                </th>
                <th className='w-1/5 px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className='px-6 py-4 text-center text-sm text-gray-500'
                  >
                    <div className='flex items-center justify-center space-x-2'>
                      <Loader2 className='h-5 w-5 animate-spin' />
                      <span>Loading hierarchies...</span>
                    </div>
                  </td>
                </tr>
              ) : hierarchyData.data.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className='px-6 py-4 text-center text-sm text-gray-500'
                  >
                    No hierarchies found
                  </td>
                </tr>
              ) : (
                hierarchyData.data.map(hierarchy => {
                  return (
                    <tr key={hierarchy.id} className='hover:bg-gray-50'>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 truncate'>
                        {hierarchy.channelName}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 truncate'>
                        {hierarchy.name}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        {hierarchy.level}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${
                            hierarchy.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {hierarchy.status === 'active'
                            ? 'Active'
                            : 'Inactive'}
                        </span>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-center text-sm font-medium'>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => handleStatusUpdate(hierarchy)}
                          disabled={updating === hierarchy.id}
                          className={`text-${getColorClasses('primary')} hover:text-${getColorClasses('hover')} hover:bg-${getColorClasses('bg')} w-full justify-center`}
                        >
                          {hierarchy.status === 'active'
                            ? 'Deactivate'
                            : 'Activate'}
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Hierarchy Drawer */}
      <Drawer
        isOpen={showAddDrawer}
        onClose={closeDrawer}
        title='Create New Hierarchy'
        footer={renderDrawerFooter()}
      >
        <div className='space-y-6'>
          <div>
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
                    }))
                  }
                  required
                >
                  <option value=''>Select a channel</option>
                  {channels.map((channel: any) => (
                    <option
                      key={channel.id || channel._id}
                      value={channel.id || channel._id}
                    >
                      {channel.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor='hierarchyName'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
                  Hierarchy Name
                </label>
                <Input
                  id='hierarchyName'
                  type='text'
                  value={formData.name}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, name: e.target.value }))
                  }
                  placeholder='Enter hierarchy name'
                  fullWidth
                  className='bg-gray-50'
                />
              </div>

              <div>
                <label
                  htmlFor='level'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
                  Level
                </label>
                <Input
                  id='level'
                  type='number'
                  min='1'
                  value={formData.level}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, level: e.target.value }))
                  }
                  placeholder='Enter level number'
                  fullWidth
                  className='bg-gray-50'
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className='text-sm font-medium text-gray-700 mb-2'>
              Additional Settings
            </h3>
            <div className='p-4 bg-gray-50 rounded-lg'>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-gray-700'>Enable Hierarchy</span>
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
                      className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out transform ${
                        formData.status === 'active'
                          ? 'translate-x-4'
                          : 'translate-x-0'
                      }`}
                    ></span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Drawer>

      {/* Status Confirmation Modal */}
      {statusModal.show && statusModal.hierarchy && (
        <StatusModal
          hierarchy={statusModal.hierarchy}
          onConfirm={confirmStatusUpdate}
          onCancel={() => setStatusModal({ show: false, hierarchy: null })}
          isLoading={updating === statusModal.hierarchy.id}
        />
      )}

      {/* Pagination */}
      <div className='mt-4'>
        <Pagination
          currentPage={hierarchyData.pagination.currentPage}
          totalPages={hierarchyData.pagination.totalPages}
          onPageChange={handlePageChange}
          totalItems={hierarchyData.pagination.totalItems}
          showingFrom={hierarchyData.pagination.showingFrom}
          showingTo={hierarchyData.pagination.showingTo}
        />
      </div>
    </div>
  );
};

export default HierarchyMaster;
