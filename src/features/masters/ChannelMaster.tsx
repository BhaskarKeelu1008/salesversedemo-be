import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Loader2, Plus, Search, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Pagination } from '../../components/ui/Pagination';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { fetchProjects, Project } from '../../services/adminService';
import {
  createChannel,
  getChannels,
  updateChannel,
} from '../../services/channelService';
import { PaginatedResponse } from '../../types';

// Updated Channel interface to match what's returned by the API
interface Channel {
  id: string;
  name: string;
  code: string;
  status: 'active' | 'inactive';
  projectId?: string;
  projectName?: string;
  projectCode?: string;
  createdAt: string;
  updatedAt: string;
}

interface StatusModalProps {
  channel: Channel;
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
  channel,
  onConfirm,
  onCancel,
  isLoading,
}) => {
  const { getColorClasses } = useTheme();
  const newStatus = channel.status === 'active' ? 'inactive' : 'active';

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
      <div className='bg-white rounded-lg shadow-xl max-w-md w-full p-6'>
        <div className='flex items-center gap-3 mb-4'>
          <AlertTriangle className='h-6 w-6 text-warning-500' />
          <h2 className='text-lg font-medium'>Confirm Status Change</h2>
        </div>

        <p className='text-gray-600 mb-6'>
          Are you sure you want to change the status of channel "{channel.name}"
          from <span className='font-medium'>{channel.status}</span> to{' '}
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

const ChannelMaster: React.FC = () => {
  const { getColorClasses } = useTheme();
  const { user } = useAuth();

  const [channelData, setChannelData] = useState<PaginatedResponse<Channel>>({
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
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDrawer, setShowAddDrawer] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  // Status modal state
  const [statusModal, setStatusModal] = useState<{
    show: boolean;
    channel: Channel | null;
  }>({
    show: false,
    channel: null,
  });

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    projectId: user?.role === 'user' ? (user as any)?.projectId || '' : '',
  });
  const [formErrors, setFormErrors] = useState({
    name: '',
    code: '',
  });

  // Fetch channels
  const fetchChannels = async () => {
    try {
      setLoading(true);
      const response = await getChannels(searchQuery, {
        page: currentPage,
        limit: itemsPerPage,
      });
      setChannelData(response);
    } catch {
      toast.error('Failed to fetch channels');
    } finally {
      setLoading(false);
    }
  };

  // Fetch projects for superadmin users
  const fetchProjectsData = async () => {
    if (user?.role === 'superadmin') {
      try {
        setLoadingProjects(true);
        const response = await fetchProjects(1, 100); // Get all projects
        setProjects(response.projects);
      } catch (error) {
        console.error('Failed to load projects:', error);
        toast.error('Failed to load projects');
      } finally {
        setLoadingProjects(false);
      }
    }
  };

  useEffect(() => {
    fetchChannels();
    fetchProjectsData();
  }, [searchQuery, currentPage, user?.role]);

  // Update formData projectId when user role changes
  useEffect(() => {
    if (user?.role === 'user') {
      setFormData(prev => ({
        ...prev,
        projectId: (user as any)?.projectId || '',
      }));
    }
  }, [user?.role, user]);

  // Validate form
  const validateForm = () => {
    const errors = {
      name: '',
      code: '',
    };
    let isValid = true;

    if (!formData.name.trim()) {
      errors.name = 'Channel name is required';
      isValid = false;
    }

    if (!formData.code.trim()) {
      errors.code = 'Channel code is required';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  // Handle channel creation
  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setCreating(true);
    try {
      // Determine projectId based on user role
      const projectId =
        user?.role === 'user'
          ? (user as any)?.projectId
          : formData.projectId || undefined;

      const newChannel = await createChannel({
        name: formData.name.trim(),
        code: formData.code.trim(),
        projectId: projectId,
      });
      // Cast the new channel to match our interface
      const typedChannel = newChannel as unknown as Channel;

      setChannelData(prev => ({
        ...prev,
        data: [...prev.data, typedChannel],
      }));
      setShowAddDrawer(false);
      setFormData({
        name: '',
        code: '',
        projectId: user?.role === 'user' ? (user as any)?.projectId || '' : '',
      });
      setFormErrors({ name: '', code: '' });
      toast.success('Channel created successfully');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to create channel'
      );
    } finally {
      setCreating(false);
    }
  };

  // Handle input change with validation
  const handleInputChange = (
    field: 'name' | 'code' | 'projectId',
    value: string
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (formErrors[field as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle status update
  const handleStatusUpdate = (channel: Channel) => {
    setStatusModal({ show: true, channel });
  };

  const confirmStatusUpdate = async () => {
    if (!statusModal.channel) return;

    const newStatus =
      statusModal.channel.status === 'active' ? 'inactive' : 'active';
    setUpdating(statusModal.channel.id);

    try {
      const updatedChannel = await updateChannel(statusModal.channel.id, {
        status: newStatus,
      });
      // Cast the updated channel to match our interface
      const typedUpdatedChannel = updatedChannel as unknown as Channel;

      setChannelData(prev => ({
        ...prev,
        data: prev.data.map(channel =>
          channel.id === statusModal.channel?.id ? typedUpdatedChannel : channel
        ),
      }));
      toast.success('Status updated successfully');
      setStatusModal({ show: false, channel: null });
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
    setFormData({
      name: '',
      code: '',
      projectId: user?.role === 'user' ? (user as any)?.projectId || '' : '',
    });
    setFormErrors({ name: '', code: '' });
  };

  const renderDrawerFooter = () => (
    <div className='flex justify-end space-x-3'>
      <Button variant='outline' onClick={closeDrawer} disabled={creating}>
        Cancel
      </Button>
      <Button
        onClick={handleCreateChannel}
        disabled={!formData.name.trim() || !formData.code.trim() || creating}
        leftIcon={
          creating ? <Loader2 className='h-4 w-4 animate-spin' /> : undefined
        }
        className={`bg-${getColorClasses('primary')} hover:bg-${getColorClasses('hover')} text-white`}
      >
        {creating ? 'Creating...' : 'Create Channel'}
      </Button>
    </div>
  );

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold text-gray-900'>Channel Master</h1>

        <div className='flex items-center space-x-3'>
          {/* Search moved next to button */}
          <div className='relative w-64'>
            <Input
              type='text'
              placeholder='Search channels...'
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
            className={`bg-${getColorClasses('primary')} hover:bg-${getColorClasses('hover')} text-white`}
          >
            Add Channel
          </Button>
        </div>
      </div>

      {/* Channels Table */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200 table-fixed'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='w-1/4 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Name
                </th>
                <th className='w-1/6 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Code
                </th>
                <th className='w-1/6 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Status
                </th>
                <th className='w-1/6 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Date Added
                </th>
                <th className='w-1/6 px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
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
                      <span>Loading channels...</span>
                    </div>
                  </td>
                </tr>
              ) : channelData.data.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className='px-6 py-4 text-center text-sm text-gray-500'
                  >
                    No channels found
                  </td>
                </tr>
              ) : (
                channelData.data.map(channel => {
                  const createdDate = new Date(channel.createdAt);
                  const formattedDate = `${createdDate.getDate().toString().padStart(2, '0')}/${(createdDate.getMonth() + 1).toString().padStart(2, '0')}/${createdDate.getFullYear()}`;

                  return (
                    <tr key={channel.id} className='hover:bg-gray-50'>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 truncate'>
                        {channel.name}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        {channel.code}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${
                            channel.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {channel.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        {formattedDate}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-center text-sm font-medium'>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => handleStatusUpdate(channel)}
                          disabled={updating === channel.id}
                          className={`text-${getColorClasses('primary')} hover:text-${getColorClasses('hover')} hover:bg-${getColorClasses('bg')} w-full justify-center`}
                        >
                          {channel.status === 'active'
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

      {/* Add Channel Drawer */}
      <Drawer
        isOpen={showAddDrawer}
        onClose={closeDrawer}
        title='Create New Channel'
        footer={renderDrawerFooter()}
      >
        <div className='space-y-6'>
          <div>
            <div className='space-y-4'>
              <div>
                <label
                  htmlFor='channelName'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
                  Channel Name
                </label>
                <Input
                  id='channelName'
                  type='text'
                  value={formData.name}
                  onChange={e => handleInputChange('name', e.target.value)}
                  placeholder='Enter channel name'
                  fullWidth
                  error={formErrors.name}
                  className='bg-gray-50'
                />
              </div>
              <div>
                <label
                  htmlFor='channelCode'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
                  Channel Code
                </label>
                <Input
                  id='channelCode'
                  type='text'
                  value={formData.code}
                  onChange={e => handleInputChange('code', e.target.value)}
                  placeholder='Enter channel code'
                  fullWidth
                  error={formErrors.code}
                  className='bg-gray-50'
                />
              </div>

              {/* Project dropdown for superadmin users */}
              {user?.role === 'superadmin' && (
                <div>
                  <label
                    htmlFor='projectId'
                    className='block text-sm font-medium text-gray-700 mb-1'
                  >
                    Project
                  </label>
                  {loadingProjects ? (
                    <div className='flex items-center justify-center py-2'>
                      <Loader2 className='h-4 w-4 animate-spin mr-2' />
                      <span className='text-sm text-gray-500'>
                        Loading projects...
                      </span>
                    </div>
                  ) : (
                    <select
                      id='projectId'
                      name='projectId'
                      value={formData.projectId}
                      onChange={e =>
                        handleInputChange('projectId', e.target.value)
                      }
                      className='mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-transparent sm:text-sm rounded-md bg-gray-50'
                    >
                      <option value=''>Select a project (optional)</option>
                      {projects.map(project => (
                        <option key={project.id} value={project.id}>
                          {project.projectName} ({project.projectCode})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}
            </div>
          </div>

          <div>
            <div className='p-4 bg-gray-50 rounded-lg'>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-gray-700'>Enable Channel</span>
                <div className='relative inline-block w-10 align-middle select-none'>
                  <input
                    type='checkbox'
                    name='toggle'
                    id='toggle'
                    className='sr-only'
                    defaultChecked
                  />
                  <label
                    htmlFor='toggle'
                    className={`block h-6 w-10 rounded-full bg-${getColorClasses('primary')} cursor-pointer`}
                  >
                    <span className='absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out transform translate-x-4'></span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Drawer>

      {/* Status Confirmation Modal */}
      {statusModal.show && statusModal.channel && (
        <StatusModal
          channel={statusModal.channel}
          onConfirm={confirmStatusUpdate}
          onCancel={() => setStatusModal({ show: false, channel: null })}
          isLoading={updating === statusModal.channel.id}
        />
      )}

      {/* Add Pagination component */}
      <Pagination
        currentPage={channelData.pagination.currentPage}
        totalPages={channelData.pagination.totalPages}
        onPageChange={setCurrentPage}
        totalItems={channelData.pagination.totalItems}
        showingFrom={channelData.pagination.showingFrom}
        showingTo={channelData.pagination.showingTo}
      />
    </div>
  );
};

export default ChannelMaster;
