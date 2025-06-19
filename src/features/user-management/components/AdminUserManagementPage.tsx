import { AnimatePresence, motion } from 'framer-motion';
import {
  CheckCircle,
  Edit2,
  Loader2,
  Mail,
  Search,
  Shield,
  Trash2,
  UserPlus,
  X,
  XCircle,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Pagination } from '../../../components/ui/Pagination';
import { useTheme } from '../../../context/ThemeContext';
import {
  AdminUser,
  createAdminUser,
  deactivateAdminUser,
  fetchAdminUsers,
  fetchProjects,
  Project,
  toggleAdminUserStatus,
  updateAdminUser,
} from '../../../services/adminService';

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
              className='h-[calc(100%-2rem)] w-full max-w-md bg-white shadow-xl flex flex-col rounded-xl border border-gray-200'
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

interface AdminUserFormProps {
  onClose: () => void;
  onSubmitSuccess?: (user: AdminUser) => void;
  initialData?: Partial<AdminUser>;
}

const AdminUserForm = React.forwardRef<HTMLFormElement, AdminUserFormProps>(
  ({ onClose, onSubmitSuccess, initialData }, ref) => {
    const [formData, setFormData] = useState({
      firstName: initialData?.firstName || '',
      lastName: initialData?.lastName || '',
      email: initialData?.email || '',
      password: '',
      role: 'admin',
      isActive: true,
      projectId: '',
    });

    const [loadingProjects, setLoadingProjects] = useState(false);
    const [projects, setProjects] = useState<Project[]>([]);

    // Load projects for dropdown
    useEffect(() => {
      const loadProjects = async () => {
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
      };

      loadProjects();
    }, []);

    const handleInputChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
      const { name, value, type } = e.target;
      const checked =
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : undefined;

      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    };

    const validateForm = () => {
      const newErrors: Record<string, string> = {};

      if (!formData.firstName.trim()) {
        newErrors.firstName = 'First name is required';
      }

      if (!formData.lastName.trim()) {
        newErrors.lastName = 'Last name is required';
      }

      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email is invalid';
      }

      if (!initialData && !formData.password.trim()) {
        newErrors.password = 'Password is required';
      }

      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      try {
        let response;

        if (initialData?.id) {
          // Update existing user
          const updateData = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            isActive: formData.isActive,
            role: formData.role,
            projectId: formData.projectId || undefined,
          };
          response = await updateAdminUser(initialData.id, updateData);
        } else {
          // Create new user
          response = await createAdminUser(formData);
        }

        if (onSubmitSuccess && response) {
          onSubmitSuccess(response);
        }

        toast.success(
          initialData?.id
            ? 'Admin user updated successfully'
            : 'Admin user created successfully'
        );
        onClose();
      } catch (error: any) {
        console.error('Error saving admin user:', error);
        toast.error(error.message || 'Failed to save admin user');
      }
    };

    return (
      <form onSubmit={handleSubmit} className='space-y-6' ref={ref}>
        <div className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              First Name*
            </label>
            <Input
              name='firstName'
              value={formData.firstName}
              onChange={handleInputChange}
              placeholder='Enter first name'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Last Name*
            </label>
            <Input
              name='lastName'
              value={formData.lastName}
              onChange={handleInputChange}
              placeholder='Enter last name'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Email*
            </label>
            <Input
              name='email'
              type='email'
              value={formData.email}
              onChange={handleInputChange}
              placeholder='Enter email address'
              disabled={!!initialData?.id} // Disable email editing for existing users
            />
          </div>

          {!initialData?.id && (
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Password*
              </label>
              <Input
                name='password'
                type='password'
                value={formData.password}
                onChange={handleInputChange}
                placeholder='Enter password'
              />
            </div>
          )}

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Role
            </label>
            <select
              name='role'
              value={formData.role}
              onChange={handleInputChange}
              className='mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md bg-gray-50'
            >
              <option value='superadmin'>Super admin</option>
              <option value='user'>User</option>
            </select>
          </div>

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
                onChange={handleInputChange}
                className='mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md bg-gray-50'
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

          <div className='flex items-center'>
            <input
              id='isActive'
              name='isActive'
              type='checkbox'
              checked={formData.isActive}
              onChange={handleInputChange}
              className='h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded'
            />
            <label
              htmlFor='isActive'
              className='ml-2 block text-sm text-gray-900'
            >
              Active User
            </label>
          </div>
        </div>
      </form>
    );
  }
);

AdminUserForm.displayName = 'AdminUserForm';

const AdminUserManagementPage: React.FC = () => {
  const { getColorClasses } = useTheme();
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [showDrawer, setShowDrawer] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  const [formLoading] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const formRef = React.useRef<HTMLFormElement>(null);

  // Load admin users and projects from API
  useEffect(() => {
    const loadData = async () => {
      try {
        const [usersResponse] = await Promise.all([
          fetchAdminUsers(currentPage, itemsPerPage),
          fetchProjects(1, 100), // Get all projects for reference
        ]);

        setAdminUsers(usersResponse.users);
        setTotalUsers(usersResponse.pagination.total);
        setTotalPages(usersResponse.pagination.totalPages);
      } catch (error: any) {
        console.error('Failed to load data:', error);
        toast.error('Failed to load data');
      }
    };

    loadData();
  }, [currentPage, itemsPerPage]);

  // Filter users based on search query
  const filteredUsers = adminUsers.filter(
    user =>
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const closeDrawer = () => {
    setShowDrawer(false);
    setEditingUser(null);
  };

  const handleFormSubmit = () => {
    if (formRef.current) {
      formRef.current.requestSubmit();
    }
  };

  const handleAddUser = (newUser: AdminUser) => {
    setAdminUsers(prev => [newUser, ...prev]);
    setTotalUsers(prev => prev + 1);
  };

  const handleUpdateUser = (updatedUser: AdminUser) => {
    setAdminUsers(prev =>
      prev.map(user => (user.id === updatedUser.id ? updatedUser : user))
    );
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deactivateAdminUser(userId, 'User deactivated by admin');
      setAdminUsers(prev => prev.filter(user => user.id !== userId));
      setTotalUsers(prev => prev - 1);
      toast.success('Admin user deleted successfully');
    } catch (error: any) {
      console.error('Failed to delete user:', error);
      toast.error('Failed to delete admin user');
    }
  };

  const handleEditUser = (user: AdminUser) => {
    setEditingUser(user);
    setShowDrawer(true);
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await toggleAdminUserStatus(userId, !currentStatus);
      setAdminUsers(prev =>
        prev.map(user =>
          user.id === userId ? { ...user, isActive: !currentStatus } : user
        )
      );
      toast.success(
        `User ${!currentStatus ? 'activated' : 'deactivated'} successfully`
      );
    } catch (error: any) {
      console.error('Failed to toggle user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive
      ? 'bg-green-100 text-green-800'
      : 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderDrawerFooter = () => (
    <div className='flex justify-end space-x-3'>
      <Button variant='outline' onClick={closeDrawer} disabled={formLoading}>
        Cancel
      </Button>
      <Button
        onClick={handleFormSubmit}
        disabled={formLoading}
        leftIcon={
          formLoading ? <Loader2 className='h-4 w-4 animate-spin' /> : undefined
        }
        className={`w-full bg-${getColorClasses('primary')} hover:bg-${getColorClasses('hover')} text-white`}
      >
        {formLoading
          ? editingUser
            ? 'Updating...'
            : 'Creating...'
          : editingUser
            ? 'Update Admin User'
            : 'Create Admin User'}
      </Button>
    </div>
  );

  return (
    <div className='container mx-auto p-6'>
      <div className='flex items-center justify-between mb-8'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>
            Admin User Management
          </h1>
          <p className='mt-2 text-gray-600'>
            Manage administrative users and their project assignments
          </p>
        </div>
        <Button
          onClick={() => setShowDrawer(true)}
          leftIcon={<UserPlus className='h-4 w-4' />}
          className={`min-w-[160px] bg-${getColorClasses('primary')} hover:bg-${getColorClasses('hover')} text-white`}
        >
          Add Admin User
        </Button>
      </div>

      {/* Search and Filters */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6'>
        <div className='flex items-center gap-4'>
          <div className='relative flex-1 max-w-md'>
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <Search className='h-5 w-5 text-gray-400' />
            </div>
            <Input
              type='text'
              placeholder='Search admin users...'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className='pl-10'
            />
          </div>
          <div className='text-sm text-gray-500'>
            {filteredUsers.length} of {totalUsers} users
          </div>
        </div>
      </div>

      {/* Admin Users Table */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  User
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Status
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Last Login
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Created
                </th>
                <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
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
                      <span>Loading admin users...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className='px-6 py-4 text-center text-sm text-gray-500'
                  >
                    No admin users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id} className='hover:bg-gray-50'>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='flex items-center'>
                        <div className='flex-shrink-0 h-10 w-10'>
                          <div className='h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center'>
                            <Shield className='h-5 w-5 text-gray-600' />
                          </div>
                        </div>
                        <div className='ml-4'>
                          <div className='text-sm font-medium text-gray-900'>
                            {user.fullName}
                          </div>
                          <div className='text-sm text-gray-500 flex items-center'>
                            <Mail className='h-3 w-3 mr-1' />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(user.isActive)}`}
                      >
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {formatDate(user.lastLoginAt)}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {formatDate(user.createdAt)}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                      <div className='flex justify-end space-x-2'>
                        <button
                          className='text-primary-600 hover:text-primary-900'
                          onClick={() => handleEditUser(user)}
                        >
                          <Edit2 className='h-4 w-4' />
                        </button>
                        <button
                          className={`${user.isActive ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'}`}
                          onClick={() =>
                            handleToggleStatus(user.id, user.isActive)
                          }
                        >
                          {user.isActive ? (
                            <XCircle className='h-4 w-4' />
                          ) : (
                            <CheckCircle className='h-4 w-4' />
                          )}
                        </button>
                        <button
                          className='text-red-600 hover:text-red-900'
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash2 className='h-4 w-4' />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className='mt-6 flex justify-center'>
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            totalItems={totalUsers}
            showingFrom={(currentPage - 1) * itemsPerPage + 1}
            showingTo={Math.min(currentPage * itemsPerPage, totalUsers)}
          />
        </div>
      )}

      {/* Create/Edit Admin User Drawer */}
      <Drawer
        isOpen={showDrawer}
        onClose={closeDrawer}
        title={editingUser ? 'Edit Admin User' : 'Create New Admin User'}
        footer={renderDrawerFooter()}
      >
        <AdminUserForm
          ref={formRef}
          onClose={closeDrawer}
          onSubmitSuccess={editingUser ? handleUpdateUser : handleAddUser}
          initialData={editingUser || undefined}
        />
      </Drawer>
    </div>
  );
};

export default AdminUserManagementPage;
