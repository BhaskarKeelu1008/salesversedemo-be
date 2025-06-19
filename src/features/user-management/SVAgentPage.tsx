import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  Check,
  Copy,
  Edit2,
  Filter,
  Loader2,
  Plus,
  Search,
  Upload,
  UserCheck,
  Users,
  UserX,
  X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Pagination } from '../../components/ui/Pagination';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { fetchProjects, Project } from '../../services/adminService';
import { Channel, getChannels } from '../../services/channelService';
import {
  Designation,
  getDesignations,
} from '../../services/designationService';
import {
  Agent,
  createUser,
  getUsers,
  updateUser,
} from '../../services/userService';

interface StatusModalProps {
  agent: Agent;
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
              className='h-[calc(100%-2rem)] w-full max-w-xl bg-white shadow-xl flex flex-col rounded-xl border border-gray-200'
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
  agent,
  onConfirm,
  onCancel,
  isLoading,
}) => {
  const { getColorClasses } = useTheme();
  const newStatus = agent.agentStatus === 'active' ? 'inactive' : 'active';

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
      <div className='bg-white rounded-lg shadow-xl max-w-md w-full p-6'>
        <div className='flex items-center gap-3 mb-4'>
          <AlertTriangle className='h-6 w-6 text-warning-500' />
          <h2 className='text-lg font-medium'>Confirm Status Change</h2>
        </div>

        <p className='text-gray-600 mb-6'>
          Are you sure you want to change the status of agent "{agent.firstName}{' '}
          {agent.lastName}" from{' '}
          <span className='font-medium'>{agent.agentStatus}</span> to{' '}
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

const SVAgentPage: React.FC = () => {
  const { getColorClasses } = useTheme();
  const { user } = useAuth();

  // State for data
  const [agents, setAgents] = useState<Agent[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  });

  // UI state
  const [loading, setLoading] = useState(true);
  const [showDrawer, setShowDrawer] = useState(false);
  const [updating] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const itemsPerPage = 10;

  // Filters
  const [filters, setFilters] = useState({
    channelId: '',
    searchQuery: '',
  });

  // Form state
  const [formData, setFormData] = useState({
    userId: '507f1f77bcf86cd799439010',
    channelId: '',
    designationId: '',
    agentCode: '',
    employeeId: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    agentStatus: 'active' as 'active' | 'inactive',
    joiningDate: '',
    targetAmount: 0,
    commissionPercentage: 0,
    isTeamLead: false,
    teamLeadId: '',
    reportingManagerId: '',
    projectId: user?.role === 'user' ? (user as any)?.projectId || '' : '',
  });

  // Form validation
  const [formErrors, setFormErrors] = useState({
    agentCode: '',
    employeeId: '',
    email: '',
    phoneNumber: '',
    targetAmount: '',
    commissionPercentage: '',
  });

  // Status modal state
  const [statusModal, setStatusModal] = useState<{
    show: boolean;
    agent: Agent | null;
  }>({
    show: false,
    agent: null,
  });

  // Add editingUser state
  const [editingUser, setEditingUser] = useState<Agent | null>(null);

  // Handle copy agent code
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getUsers(
        currentPage,
        itemsPerPage,
        filters.searchQuery,
        filters.channelId
      );
      setAgents(response.data.agents);

      // Update stats
      setStats({
        total: response.data.pagination.total,
        active: response.data.agents.filter(
          agent => agent.agentStatus === 'active'
        ).length,
        inactive: response.data.agents.filter(
          agent => agent.agentStatus === 'inactive'
        ).length,
      });
    } catch {
      toast.error('Failed to fetch agents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters, currentPage]);

  // Fetch channels and designations
  const fetchChannelsAndDesignations = async () => {
    try {
      const [channelsData, designationsData] = await Promise.all([
        getChannels(),
        getDesignations(),
      ]);
      setChannels(channelsData.data);
      setDesignations(designationsData.data);
    } catch {
      toast.error('Failed to fetch channels and designations');
    }
  };

  // Fetch projects for superadmin users
  const fetchProjectsData = async () => {
    if (user?.role === 'superadmin') {
      try {
        setLoadingProjects(true);
        const response = await fetchProjects(1, 100); // Get all projects
        setProjects(response.projects);
      } catch {
        console.error('Failed to load projects');
        toast.error('Failed to load projects');
      } finally {
        setLoadingProjects(false);
      }
    }
  };

  useEffect(() => {
    fetchChannelsAndDesignations();
    fetchProjectsData();
  }, [user?.role]);

  // Update formData projectId when user role changes
  useEffect(() => {
    if (user?.role === 'user') {
      setFormData(prev => ({
        ...prev,
        projectId: (user as any)?.projectId || '',
      }));
    }
  }, [user?.role, user]);

  // Add this useEffect to log channels state whenever it changes
  useEffect(() => {
    console.log('Channels state:', channels);
  }, [channels]);

  // Add this useEffect to log selected channelId whenever it changes
  useEffect(() => {
    console.log('Selected channelId:', formData.channelId);
  }, [formData.channelId]);

  // Validate form
  const validateForm = () => {
    const errors: string[] = [];

    if (!formData.userId) {
      errors.push('User ID is required');
    }
    if (!formData.channelId) {
      errors.push('Channel is required');
    }
    if (!formData.designationId) {
      errors.push('Designation is required');
    }
    // Agent code is optional - will be auto-generated if empty
    if (!formData.employeeId) {
      errors.push('Employee ID is required');
    }
    if (!formData.firstName) {
      errors.push('First Name is required');
    }
    if (!formData.lastName) {
      errors.push('Last Name is required');
    }
    if (!formData.email) {
      errors.push('Email is required');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.push('Invalid email format');
    }
    if (!formData.phoneNumber) {
      errors.push('Phone Number is required');
    }
    if (!formData.joiningDate) {
      errors.push('Joining Date is required');
    }
    if (!formData.targetAmount) {
      errors.push('Target Amount is required');
    }
    if (!formData.commissionPercentage) {
      errors.push('Commission Percentage is required');
    }

    return errors;
  };

  // Handle form submission
  const handleSubmitAgent = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateForm();
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return;
    }

    // Get userId from localStorage (login response)
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user._id;

    try {
      const agentData: any = {
        userId: userId, // Always use logged-in user's ID
        channelId: formData.channelId,
        designationId: formData.designationId,
        employeeId: formData.employeeId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        agentStatus: formData.agentStatus as 'active' | 'inactive',
        joiningDate: formData.joiningDate,
        targetAmount: formData.targetAmount,
        commissionPercentage: formData.commissionPercentage,
        isTeamLead: formData.isTeamLead,
        teamLeadId: formData.teamLeadId || undefined,
        reportingManagerId: formData.reportingManagerId || undefined,
        projectId:
          user?.role === 'user'
            ? (user as any)?.projectId
            : formData.projectId || undefined,
        generateAgentCode: !formData.agentCode.trim(),
      };

      // Only include agentCode if it has a value
      if (formData.agentCode.trim()) {
        agentData.agentCode = formData.agentCode;
      }

      if (editingUser) {
        await updateUser(editingUser._id, agentData);
        toast.success('Agent updated successfully');
      } else {
        await createUser(agentData);
        toast.success('Agent created successfully');
      }

      setShowDrawer(false);
      setEditingUser(null);
      setFormData({
        userId: '',
        channelId: '',
        designationId: '',
        agentCode: '',
        employeeId: '',
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        agentStatus: 'active',
        joiningDate: '',
        targetAmount: 0,
        commissionPercentage: 0,
        isTeamLead: false,
        teamLeadId: '',
        reportingManagerId: '',
        projectId: user?.role === 'user' ? (user as any)?.projectId || '' : '',
      });
      fetchData();
    } catch {
      toast.error('Failed to submit agent');
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      channelId: '',
      searchQuery: '',
    });
  };

  // Add a handler to fetch masters when opening the modal
  const handleOpenAddModal = async () => {
    try {
      await fetchChannelsAndDesignations();
      setEditingUser(null);
      setFormData({
        userId: '507f1f77bcf86cd799439010',
        channelId: '',
        designationId: '',
        agentCode: '',
        employeeId: '',
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        agentStatus: 'active' as 'active' | 'inactive',
        joiningDate: '',
        targetAmount: 0,
        commissionPercentage: 0,
        isTeamLead: false,
        teamLeadId: '',
        reportingManagerId: '',
        projectId: user?.role === 'user' ? (user as any)?.projectId || '' : '',
      });
      setFormErrors({
        agentCode: '',
        employeeId: '',
        email: '',
        phoneNumber: '',
        targetAmount: '',
        commissionPercentage: '',
      });
      setShowDrawer(true);
    } catch {
      toast.error('Failed to fetch channels and designations');
    }
  };

  // Add a handler to edit a user
  const handleEdit = (agent: Agent) => {
    setEditingUser(agent);
    setFormData({
      userId: agent.userId,
      channelId: agent.channelId,
      designationId: agent.designationId,
      agentCode: agent.agentCode,
      employeeId: agent.employeeId,
      firstName: agent.firstName,
      lastName: agent.lastName,
      email: agent.email,
      phoneNumber: agent.phoneNumber,
      agentStatus: agent.agentStatus,
      joiningDate: agent.joiningDate,
      targetAmount: agent.targetAmount,
      commissionPercentage: agent.commissionPercentage,
      isTeamLead: agent.isTeamLead,
      teamLeadId: agent.teamLeadId || '',
      reportingManagerId: agent.reportingManagerId || '',
      projectId: agent.projectId || '',
    });
    setShowDrawer(true);
  };

  const handleStatusChange = async (
    agentId: string,
    newStatus: 'active' | 'inactive'
  ) => {
    try {
      await updateUser(agentId, {
        agentStatus: newStatus as 'active' | 'inactive',
      });
      setAgents(prev =>
        prev.map(agent =>
          agent._id === agentId ? { ...agent, agentStatus: newStatus } : agent
        )
      );
      toast.success('Status updated successfully');
    } catch {
      toast.error('Failed to update status');
    }
  };

  // Helper function to get gradient classes
  const getGradientClasses = () => {
    const colorScheme = getColorClasses('primary').split('-')[0]; // Extract color name (e.g., 'purple' from 'purple-600')

    switch (colorScheme) {
      case 'purple':
        return 'bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700';
      case 'blue':
        return 'bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700';
      case 'green':
        return 'bg-gradient-to-r from-green-500 via-green-600 to-green-700';
      case 'orange':
        return 'bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700';
      case 'red':
        return 'bg-gradient-to-r from-red-500 via-red-600 to-red-700';
      case 'indigo':
        return 'bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700';
      default:
        return 'bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700';
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold text-gray-900'>User Management</h1>

        <div className='flex items-center space-x-3'>
          {/* Search moved next to button */}
          <div className='relative w-64'>
            <Input
              type='text'
              placeholder='Search agents...'
              value={filters.searchQuery}
              onChange={e =>
                setFilters(prev => ({ ...prev, searchQuery: e.target.value }))
              }
              leftIcon={
                <Search
                  className={`h-4 w-4 text-${getColorClasses('secondary')}`}
                />
              }
              fullWidth
              className={`bg-${getColorClasses('bg')} border-${getColorClasses('accent')}`}
            />
          </div>

          <Button
            variant='outline'
            leftIcon={
              <Upload
                className={`h-4 w-4 text-${getColorClasses('secondary')}`}
              />
            }
            className={`border-${getColorClasses('accent')} text-${getColorClasses('secondary')} hover:bg-${getColorClasses('hover')}`}
          >
            Bulk Upload
          </Button>

          <Button
            onClick={handleOpenAddModal}
            leftIcon={
              <Plus className={`h-4 w-4 text-${getColorClasses('primary')}`} />
            }
            className={`bg-${getColorClasses('primary')} hover:bg-${getColorClasses('hover')}`}
          >
            Add Agent
          </Button>
        </div>
      </div>

      {/* Stats Cards with theme schema */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <div
          className={`${getGradientClasses()} p-6 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-200`}
        >
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-white opacity-90'>
                Total Agents
              </p>
              <h3 className='text-3xl font-bold text-white mt-1'>
                {stats.total}
              </h3>
            </div>
            <Users className='h-10 w-10 text-white opacity-90' />
          </div>
        </div>

        <div
          className={`${getGradientClasses()} p-6 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-200`}
        >
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-white opacity-90'>
                Active Agents
              </p>
              <h3 className='text-3xl font-bold text-white mt-1'>
                {stats.active}
              </h3>
            </div>
            <UserCheck className='h-10 w-10 text-white opacity-90' />
          </div>
        </div>

        <div
          className={`${getGradientClasses()} p-6 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-200`}
        >
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-white opacity-90'>
                Inactive Agents
              </p>
              <h3 className='text-3xl font-bold text-white mt-1'>
                {stats.inactive}
              </h3>
            </div>
            <UserX className='h-10 w-10 text-white opacity-90' />
          </div>
        </div>
      </div>

      {/* Channel Filter */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4'>
        <div className='flex items-center gap-2 text-sm text-gray-700 mb-3'>
          <Filter className={`h-4 w-4 text-${getColorClasses('primary')}`} />
          <span className='font-medium'>Filter by Channel</span>
        </div>

        <div className='flex items-center gap-4'>
          <div className='flex-1 max-w-xs'>
            <select
              className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-${getColorClasses('primary')} focus:border-${getColorClasses('primary')} sm:text-sm rounded-md bg-gray-50`}
              value={filters.channelId}
              onChange={e =>
                setFilters(prev => ({ ...prev, channelId: e.target.value }))
              }
            >
              <option value=''>All Channels</option>
              {channels.map(channel => (
                <option key={channel.id} value={channel.id}>
                  {channel.name}
                </option>
              ))}
            </select>
          </div>

          {(filters.channelId || filters.searchQuery) && (
            <Button
              size='sm'
              onClick={handleResetFilters}
              className={`border-${getColorClasses('accent')} text-${getColorClasses('secondary')} hover:bg-${getColorClasses('hover')}`}
            >
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200 table-fixed'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='w-1/8 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Agent Code
                </th>
                <th className='w-1/6 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Name
                </th>
                <th className='w-1/8 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Channel
                </th>
                <th className='w-1/8 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Designation
                </th>
                <th className='w-1/6 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Email
                </th>
                <th className='w-1/8 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Phone
                </th>
                <th className='w-1/8 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Status
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
                    colSpan={8}
                    className='px-6 py-4 text-center text-sm text-gray-500'
                  >
                    <div className='flex items-center justify-center space-x-2'>
                      <Loader2 className='h-5 w-5 animate-spin' />
                      <span>Loading agents...</span>
                    </div>
                  </td>
                </tr>
              ) : agents.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className='px-6 py-4 text-center text-sm text-gray-500'
                  >
                    No agents found
                  </td>
                </tr>
              ) : (
                agents.map(agent => (
                  <tr key={agent._id} className='hover:bg-gray-50'>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 truncate'>
                      <div className='flex items-center gap-2'>
                        <span className='font-medium bg-gray-100 px-2 py-1 rounded text-xs'>
                          {agent.agentCode}
                        </span>
                        <button
                          onClick={() => handleCopyCode(agent.agentCode)}
                          className={`text-gray-400 hover:text-${getColorClasses('primary')} transition-colors`}
                          title='Copy agent code'
                        >
                          {copiedCode === agent.agentCode ? (
                            <Check className='h-3 w-3 text-green-500' />
                          ) : (
                            <Copy className='h-3 w-3' />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 truncate'>
                      <div>
                        <div className='font-medium'>{agent.fullName}</div>
                        <div className='text-gray-500 text-xs'>
                          {agent.employeeId}
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 truncate'>
                      {agent.channelName}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 truncate'>
                      {agent.designationName}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate'>
                      {agent.email}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate'>
                      {agent.phoneNumber}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          agent.agentStatus === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {agent.agentStatus === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-center text-sm font-medium'>
                      <div className='flex items-center justify-center space-x-2'>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => handleEdit(agent)}
                          className={`text-${getColorClasses('primary')} hover:text-${getColorClasses('hover')} hover:bg-${getColorClasses('bg')}`}
                        >
                          <Edit2 className='h-4 w-4 mr-1' />
                          Edit
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() =>
                            handleStatusChange(
                              agent._id,
                              agent.agentStatus === 'active'
                                ? 'inactive'
                                : 'active'
                            )
                          }
                          className={`${
                            agent.agentStatus === 'active'
                              ? 'text-red-600 hover:text-red-800 hover:bg-red-50'
                              : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                          }`}
                        >
                          {agent.agentStatus === 'active'
                            ? 'Deactivate'
                            : 'Activate'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {stats.total > itemsPerPage && (
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(stats.total / itemsPerPage)}
          onPageChange={setCurrentPage}
          totalItems={stats.total}
          showingFrom={(currentPage - 1) * itemsPerPage + 1}
          showingTo={Math.min(currentPage * itemsPerPage, stats.total)}
        />
      )}

      {/* Right Drawer for Add/Edit */}
      <Drawer
        isOpen={showDrawer}
        onClose={() => {
          setShowDrawer(false);
          setEditingUser(null);
          setFormData({
            userId: '',
            channelId: '',
            designationId: '',
            agentCode: '',
            employeeId: '',
            firstName: '',
            lastName: '',
            email: '',
            phoneNumber: '',
            agentStatus: 'active',
            joiningDate: '',
            targetAmount: 0,
            commissionPercentage: 0,
            isTeamLead: false,
            teamLeadId: '',
            reportingManagerId: '',
            projectId:
              user?.role === 'user' ? (user as any)?.projectId || '' : '',
          });
          setFormErrors({
            agentCode: '',
            employeeId: '',
            email: '',
            phoneNumber: '',
            targetAmount: '',
            commissionPercentage: '',
          });
        }}
        title={editingUser ? 'Edit Agent' : 'Add New Agent'}
        footer={
          <div className='flex justify-end space-x-3'>
            <Button
              variant='outline'
              onClick={() => {
                setShowDrawer(false);
                setEditingUser(null);
                setFormData({
                  userId: '',
                  channelId: '',
                  designationId: '',
                  agentCode: '',
                  employeeId: '',
                  firstName: '',
                  lastName: '',
                  email: '',
                  phoneNumber: '',
                  agentStatus: 'active',
                  joiningDate: '',
                  targetAmount: 0,
                  commissionPercentage: 0,
                  isTeamLead: false,
                  teamLeadId: '',
                  reportingManagerId: '',
                  projectId:
                    user?.role === 'user' ? (user as any)?.projectId || '' : '',
                });
                setFormErrors({
                  agentCode: '',
                  employeeId: '',
                  email: '',
                  phoneNumber: '',
                  targetAmount: '',
                  commissionPercentage: '',
                });
              }}
              className={`border-${getColorClasses('accent')} text-${getColorClasses('secondary')} hover:bg-${getColorClasses('hover')}`}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitAgent}
              disabled={updating === editingUser?._id}
              leftIcon={
                updating ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : undefined
              }
              className={`bg-${getColorClasses('primary')} hover:bg-${getColorClasses('hover')}`}
            >
              {updating
                ? 'Updating...'
                : editingUser
                  ? 'Update Agent'
                  : 'Create Agent'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmitAgent} className='space-y-6'>
          <div className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Channel
                </label>
                <select
                  id='channelId'
                  name='channelId'
                  value={formData.channelId}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      channelId: e.target.value,
                    }))
                  }
                  className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-${getColorClasses('primary')} focus:border-${getColorClasses('primary')} sm:text-sm rounded-md bg-gray-50`}
                  required
                >
                  <option value=''>Select Channel</option>
                  {channels.map(channel => (
                    <option key={channel.id} value={channel.id}>
                      {channel.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Designation
                </label>
                <select
                  className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-${getColorClasses('primary')} focus:border-${getColorClasses('primary')} sm:text-sm rounded-md bg-gray-50`}
                  value={formData.designationId}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      designationId: e.target.value,
                    }))
                  }
                  required
                >
                  <option value=''>Select Designation</option>
                  {designations.map(designation => (
                    <option key={designation.id} value={designation.id}>
                      {designation.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Project dropdown for superadmin users */}
            {user?.role === 'superadmin' && (
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
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
                    name='projectId'
                    value={formData.projectId}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        projectId: e.target.value,
                      }))
                    }
                    className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-${getColorClasses('primary')} focus:border-${getColorClasses('primary')} sm:text-sm rounded-md bg-gray-50`}
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

            <div className='grid grid-cols-2 gap-4'>
              <Input
                label='Agent Code'
                type='text'
                value={formData.agentCode}
                onChange={e =>
                  setFormData(prev => ({ ...prev, agentCode: e.target.value }))
                }
                error={formErrors.agentCode}
                placeholder='Enter agent code or leave empty for auto-generation'
                fullWidth
                className={`bg-${getColorClasses('bg')}`}
              />

              <Input
                label='Employee ID'
                type='text'
                value={formData.employeeId}
                onChange={e =>
                  setFormData(prev => ({ ...prev, employeeId: e.target.value }))
                }
                error={formErrors.employeeId}
                placeholder='Enter employee ID'
                required
                fullWidth
                className={`bg-${getColorClasses('bg')}`}
              />
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <Input
                label='First Name'
                type='text'
                value={formData.firstName}
                onChange={e =>
                  setFormData(prev => ({ ...prev, firstName: e.target.value }))
                }
                placeholder='Enter first name'
                required
                fullWidth
                className={`bg-${getColorClasses('bg')}`}
              />

              <Input
                label='Last Name'
                type='text'
                value={formData.lastName}
                onChange={e =>
                  setFormData(prev => ({ ...prev, lastName: e.target.value }))
                }
                placeholder='Enter last name'
                required
                fullWidth
                className={`bg-${getColorClasses('bg')}`}
              />
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <Input
                label='Email'
                type='email'
                value={formData.email}
                onChange={e =>
                  setFormData(prev => ({ ...prev, email: e.target.value }))
                }
                error={formErrors.email}
                placeholder='Enter email address'
                required
                fullWidth
                className={`bg-${getColorClasses('bg')}`}
              />

              <Input
                label='Phone Number'
                type='text'
                value={formData.phoneNumber}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    phoneNumber: e.target.value,
                  }))
                }
                error={formErrors.phoneNumber}
                placeholder='Enter phone number'
                required
                fullWidth
                className={`bg-${getColorClasses('bg')}`}
              />
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <Input
                label='Joining Date'
                type='date'
                value={formData.joiningDate}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    joiningDate: e.target.value,
                  }))
                }
                required
                fullWidth
                className={`bg-${getColorClasses('bg')}`}
              />

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Status
                </label>
                <select
                  className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-${getColorClasses('primary')} focus:border-${getColorClasses('primary')} sm:text-sm rounded-md bg-gray-50`}
                  value={formData.agentStatus}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      agentStatus: e.target.value as 'active' | 'inactive',
                    }))
                  }
                  required
                >
                  <option value='active'>Active</option>
                  <option value='inactive'>Inactive</option>
                </select>
              </div>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <Input
                label='Target Amount'
                type='number'
                value={formData.targetAmount}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    targetAmount: Number(e.target.value),
                  }))
                }
                error={formErrors.targetAmount}
                placeholder='Enter target amount'
                required
                fullWidth
                className={`bg-${getColorClasses('bg')}`}
              />

              <Input
                label='Commission Percentage'
                type='number'
                value={formData.commissionPercentage}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    commissionPercentage: Number(e.target.value),
                  }))
                }
                error={formErrors.commissionPercentage}
                placeholder='Enter commission percentage'
                required
                fullWidth
                className={`bg-${getColorClasses('bg')}`}
              />
            </div>

            <div className='flex items-center'>
              <input
                type='checkbox'
                id='isTeamLead'
                checked={formData.isTeamLead}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    isTeamLead: e.target.checked,
                  }))
                }
                className={`h-4 w-4 text-${getColorClasses('primary')} focus:ring-${getColorClasses('primary')} border-gray-300 rounded`}
              />
              <label
                htmlFor='isTeamLead'
                className='ml-2 block text-sm text-gray-900'
              >
                Is Team Lead
              </label>
            </div>
          </div>
        </form>
      </Drawer>

      {/* Status Confirmation Modal */}
      {statusModal.show && statusModal.agent && (
        <StatusModal
          agent={statusModal.agent}
          onConfirm={async () => {
            if (!statusModal.agent) return;
            await handleStatusChange(
              statusModal.agent._id,
              statusModal.agent.agentStatus === 'active' ? 'inactive' : 'active'
            );
            setStatusModal({ show: false, agent: null });
          }}
          onCancel={() => setStatusModal({ show: false, agent: null })}
          isLoading={updating === statusModal.agent._id}
        />
      )}
    </div>
  );
};

export default SVAgentPage;
