import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  Loader2,
  Plus,
  Search,
  Settings,
  X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Pagination } from '../../components/ui/Pagination';
import { useTheme } from '../../context/ThemeContext';
import { getChannels } from '../../services/channelService';
import {
  Role,
  createRole,
  getRoles,
  updateRoleStatus,
} from '../../services/roleService';
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
  role: Role;
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

const StatusModal: React.FC<StatusModalProps & { getColorClasses: any }> = ({
  role,
  onConfirm,
  onCancel,
  isLoading,
  getColorClasses,
}) => {
  const newStatus = role.status === 'active' ? 'inactive' : 'active';

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
      <div className='bg-white rounded-lg shadow-xl max-w-md w-full p-6'>
        <div className='flex items-center gap-3 mb-4'>
          <AlertTriangle className='h-6 w-6 text-warning-500' />
          <h2 className='text-lg font-medium'>Confirm Status Change</h2>
        </div>

        <p className='text-gray-600 mb-6'>
          Are you sure you want to change the status of role "{role.name}" from{' '}
          <span className='font-medium'>{role.status}</span> to{' '}
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

const RoleMaster: React.FC = () => {
  const { getColorClasses } = useTheme();
  const [roleData, setRoleData] = useState<PaginatedResponse<Role>>({
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

  // Filter state
  const [selectedChannel, setSelectedChannel] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  // Form state
  const [formData, setFormData] = useState({
    channelId: '',
    name: '',
    code: '',
    status: 'active',
  });

  // Form validation
  const [formErrors, setFormErrors] = useState({
    code: '',
  });

  // Status modal state
  const [statusModal, setStatusModal] = useState<{
    show: boolean;
    role: Role | null;
  }>({
    show: false,
    role: null,
  });

  // Fetch roles and channels
  const fetchData = async () => {
    try {
      setLoading(true);
      const [roleData, channelData] = await Promise.all([
        getRoles(searchQuery, {
          page: currentPage,
          limit: itemsPerPage,
        }),
        getChannels(),
      ]);
      setRoleData(roleData);

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
  }, [currentPage]);

  // Apply filters with debounce
  useEffect(() => {
    if (
      searchQuery ||
      selectedChannel ||
      selectedStatus ||
      dateRange.from ||
      dateRange.to
    ) {
      const timer = setTimeout(() => {
        fetchData();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [
    searchQuery,
    selectedChannel,
    selectedStatus,
    dateRange.from,
    dateRange.to,
  ]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Validate role code
  const validateRoleCode = (value: string) => {
    if (!value.trim()) return 'Role Code is required';
    if (!/^[A-Za-z0-9_]+$/.test(value))
      return 'Role Code can only contain letters, numbers, and underscores';
    if (value.length < 2) return 'Role Code must be at least 2 characters long';
    if (value.length > 20) return 'Role Code must be less than 20 characters';
    return '';
  };

  // Handle role creation
  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('handleCreateRole called', { formData, formErrors });

    if (!formData.channelId || !formData.name || !formData.code) {
      console.log('Missing required fields');
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate code
    const codeError = validateRoleCode(formData.code);
    if (codeError) {
      console.log('Validation error:', codeError);
      setFormErrors({ code: codeError });
      toast.error('Please fix validation errors');
      return;
    }

    console.log('Starting API call');
    setCreating(true);
    try {
      await createRole(formData.channelId, formData.name.trim(), formData.code);

      // Close drawer and reset form
      setShowAddDrawer(false);
      setFormData({ channelId: '', name: '', code: '', status: 'active' });
      setFormErrors({ code: '' });

      // Refresh the data
      await fetchData();

      toast.success('Role created successfully');
    } catch (error) {
      console.error('API call failed:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to create role'
      );
    } finally {
      setCreating(false);
    }
  };

  // Handle status update
  const handleStatusUpdate = (role: Role) => {
    setStatusModal({ show: true, role });
  };

  const confirmStatusUpdate = async () => {
    if (!statusModal.role) return;

    const newStatus =
      statusModal.role.status === 'active' ? 'inactive' : 'active';
    setUpdating(statusModal.role.id);

    try {
      const updatedRole = await updateRoleStatus(
        statusModal.role.id,
        newStatus
      );
      setRoleData(prev => ({
        ...prev,
        data: prev.data.map(role =>
          role.id === statusModal.role?.id ? updatedRole : role
        ),
      }));
      toast.success('Status updated successfully');
      setStatusModal({ show: false, role: null });
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdating(null);
    }
  };

  const closeDrawer = () => {
    setShowAddDrawer(false);
    setFormData({ channelId: '', name: '', code: '', status: 'active' });
    setFormErrors({ code: '' });
  };

  const renderDrawerFooter = () => (
    <div className='flex justify-end space-x-3'>
      <Button variant='outline' onClick={closeDrawer} disabled={creating}>
        Cancel
      </Button>
      <Button
        type='submit'
        onClick={e => {
          e.preventDefault();
          handleCreateRole(e as any);
        }}
        disabled={creating}
        leftIcon={
          creating ? (
            <Loader2 className='h-4 w-4 animate-spin' />
          ) : (
            <Plus className='h-4 w-4' />
          )
        }
        className={`w-full bg-${getColorClasses('primary')} hover:bg-${getColorClasses('hover')} text-white`}
      >
        {creating ? 'Creating...' : 'Add Role'}
      </Button>
    </div>
  );

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedChannel('');
    setSelectedStatus('');
    setSearchQuery('');
    setDateRange({ from: '', to: '' });
  };

  // Filter roles by date
  const isWithinDateRange = (role: Role) => {
    if (!dateRange.from && !dateRange.to) return true;

    const createdDate = new Date(role.createdAt);
    const fromDate = dateRange.from ? new Date(dateRange.from) : null;
    const toDate = dateRange.to ? new Date(dateRange.to) : null;

    if (fromDate && toDate) {
      return createdDate >= fromDate && createdDate <= toDate;
    } else if (fromDate) {
      return createdDate >= fromDate;
    } else if (toDate) {
      return createdDate <= toDate;
    }

    return true;
  };

  // Count active filters
  const getActiveFilterCount = () => {
    let count = 0;
    if (selectedChannel) count++;
    if (selectedStatus) count++;
    if (searchQuery) count++;
    if (dateRange.from) count++;
    if (dateRange.to) count++;
    return count;
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold text-gray-900'>Role Master</h1>

        <div className='flex items-center space-x-3'>
          {/* Search with filter button */}
          <div className='flex items-center'>
            <div className='relative w-64'>
              <Input
                type='text'
                placeholder='Search roles...'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                leftIcon={<Search className='h-4 w-4 text-gray-400' />}
                fullWidth
                className='bg-gray-50 border-gray-200 rounded-r-none'
              />
            </div>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              leftIcon={<Settings className='h-4 w-4' />}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                showFilters
                  ? `bg-${getColorClasses('primary')} text-white`
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
              }`}
            >
              <span>Filters</span>
              <span
                className={`ml-1 flex items-center justify-center bg-${getColorClasses('bg')} text-${getColorClasses('primary')} text-xs font-medium rounded-full h-5 w-5`}
              >
                {getActiveFilterCount()}
              </span>
            </Button>
          </div>

          <Button
            onClick={() => setShowAddDrawer(true)}
            leftIcon={<Plus className='h-4 w-4' />}
            className={`bg-${getColorClasses('primary')} hover:bg-${getColorClasses('hover')} text-white`}
          >
            Create New
          </Button>
        </div>
      </div>

      {/* Filter Panel - Conditionally shown */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className='overflow-hidden'
          >
            <div className='bg-white p-4 rounded-lg shadow-sm border border-gray-200'>
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2 text-sm font-medium text-gray-700'>
                    <Settings className='h-4 w-4' />
                    <span>Filters</span>
                  </div>

                  {(selectedChannel ||
                    selectedStatus ||
                    searchQuery ||
                    dateRange.from ||
                    dateRange.to) && (
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={clearAllFilters}
                      className={`text-${getColorClasses('primary')} border-${getColorClasses('accent')} hover:bg-${getColorClasses('bg')}`}
                    >
                      Clear All
                    </Button>
                  )}
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label
                      htmlFor='channel-filter'
                      className='block text-sm font-medium text-gray-700 mb-1'
                    >
                      Channel
                    </label>
                    <select
                      id='channel-filter'
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-${getColorClasses('primary')} focus:border-${getColorClasses('primary')} sm:text-sm rounded-md bg-gray-50"
                      value={selectedChannel}
                      onChange={e => setSelectedChannel(e.target.value)}
                    >
                      <option value=''>All Channels</option>
                      {channels.map(channel => (
                        <option key={channel.id} value={channel.id}>
                          {channel.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor='status-filter'
                      className='block text-sm font-medium text-gray-700 mb-1'
                    >
                      Status
                    </label>
                    <select
                      id='status-filter'
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-${getColorClasses('primary')} focus:border-${getColorClasses('primary')} sm:text-sm rounded-md bg-gray-50"
                      value={selectedStatus}
                      onChange={e => setSelectedStatus(e.target.value)}
                    >
                      <option value=''>All Statuses</option>
                      <option value='active'>Active</option>
                      <option value='inactive'>Inactive</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Date Range
                  </label>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
                    <div>
                      <label
                        htmlFor='date-from'
                        className='block text-xs text-gray-500 mb-1'
                      >
                        From
                      </label>
                      <input
                        id='date-from'
                        type='date'
                        className="block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-${getColorClasses('primary')} focus:border-${getColorClasses('primary')} sm:text-sm rounded-md bg-gray-50"
                        value={dateRange.from}
                        onChange={e =>
                          setDateRange(prev => ({
                            ...prev,
                            from: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label
                        htmlFor='date-to'
                        className='block text-xs text-gray-500 mb-1'
                      >
                        To
                      </label>
                      <input
                        id='date-to'
                        type='date'
                        className="block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-${getColorClasses('primary')} focus:border-${getColorClasses('primary')} sm:text-sm rounded-md bg-gray-50"
                        value={dateRange.to}
                        onChange={e =>
                          setDateRange(prev => ({
                            ...prev,
                            to: e.target.value,
                          }))
                        }
                        min={dateRange.from}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Roles Table */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200 table-fixed'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='w-1/5 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Channel
                </th>
                <th className='w-1/5 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
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
                    colSpan={6}
                    className='px-6 py-4 text-center text-sm text-gray-500'
                  >
                    <div className='flex items-center justify-center space-x-2'>
                      <Loader2 className='h-5 w-5 animate-spin' />
                      <span>Loading roles...</span>
                    </div>
                  </td>
                </tr>
              ) : roleData.data.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className='px-6 py-4 text-center text-sm text-gray-500'
                  >
                    No roles found
                  </td>
                </tr>
              ) : (
                roleData.data
                  .filter(
                    role =>
                      !selectedChannel || role.channelId === selectedChannel
                  )
                  .filter(
                    role => !selectedStatus || role.status === selectedStatus
                  )
                  .filter(isWithinDateRange)
                  .map(role => {
                    const createdDate = new Date(role.createdAt);
                    const formattedDate = `${createdDate.getDate().toString().padStart(2, '0')}/${(createdDate.getMonth() + 1).toString().padStart(2, '0')}/${createdDate.getFullYear()}`;

                    return (
                      <tr key={role.id} className='hover:bg-gray-50'>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 truncate'>
                          {role.channelName}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 truncate'>
                          {role.name}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                          {role.code}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded ${
                              role.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {role.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                          {formattedDate}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-center text-sm font-medium'>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => handleStatusUpdate(role)}
                            disabled={updating === role.id}
                            className={`text-${getColorClasses('primary')} hover:text-${getColorClasses('hover')} hover:bg-${getColorClasses('bg')} w-full justify-center`}
                          >
                            {role.status === 'active'
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

      {/* Add Role Drawer */}
      <Drawer
        isOpen={showAddDrawer}
        onClose={closeDrawer}
        title='Create New Role'
        footer={renderDrawerFooter()}
      >
        <form onSubmit={handleCreateRole} className='space-y-6'>
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
                  className={`block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-${getColorClasses('primary')} focus:border-${getColorClasses('primary')} sm:text-sm rounded-md bg-gray-50`}
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
                  {channels.map(channel => (
                    <option key={channel.id} value={channel.id}>
                      {channel.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor='roleName'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
                  Role Name
                </label>
                <Input
                  id='roleName'
                  type='text'
                  value={formData.name}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, name: e.target.value }))
                  }
                  placeholder='Enter role name'
                  fullWidth
                  required
                  className={`bg-gray-50 focus:ring-${getColorClasses('primary')} focus:border-${getColorClasses('primary')}`}
                />
              </div>

              <div>
                <label
                  htmlFor='roleCode'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
                  Role Code
                </label>
                <Input
                  id='roleCode'
                  type='text'
                  value={formData.code}
                  onChange={e => {
                    const value = e.target.value;
                    setFormData(prev => ({ ...prev, code: value }));
                    setFormErrors(prev => ({
                      ...prev,
                      code: validateRoleCode(value),
                    }));
                  }}
                  placeholder='Enter role code (e.g., SALES_MGR, ADMIN01)'
                  fullWidth
                  className={`bg-gray-50 focus:ring-${getColorClasses('primary')} focus:border-${getColorClasses('primary')}`}
                />
                {formErrors.code && (
                  <p className='mt-1 text-sm text-red-600'>{formErrors.code}</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <h3 className='text-sm font-medium text-gray-700 mb-2'>
              Additional Settings
            </h3>
            <div className='p-4 bg-gray-50 rounded-lg'>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-gray-700'>Enable Role</span>
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
        </form>
      </Drawer>

      {/* Status Confirmation Modal */}
      {statusModal.show && statusModal.role && (
        <StatusModal
          role={statusModal.role}
          onConfirm={confirmStatusUpdate}
          onCancel={() => setStatusModal({ show: false, role: null })}
          isLoading={updating === statusModal.role.id}
          getColorClasses={getColorClasses}
        />
      )}

      {/* Pagination */}
      <div className='mt-4'>
        <Pagination
          currentPage={roleData.pagination.currentPage}
          totalPages={roleData.pagination.totalPages}
          onPageChange={handlePageChange}
          totalItems={roleData.pagination.totalItems}
          showingFrom={roleData.pagination.showingFrom}
          showingTo={roleData.pagination.showingTo}
        />
      </div>
    </div>
  );
};

export default RoleMaster;
