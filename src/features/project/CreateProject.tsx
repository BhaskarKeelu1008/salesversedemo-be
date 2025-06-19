import { AnimatePresence, motion } from 'framer-motion';
import { Edit2, Loader2, Package, Plus, Search, Trash2, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Pagination } from '../../components/ui/Pagination';
import { useTheme } from '../../context/ThemeContext';
import { fetchModules, Module } from '../modules/services/moduleService';
import {
  createProject,
  CreateProjectPayload,
  fetchProjects,
  Project,
} from './services/projectService';

interface ProjectFormProps {
  onClose: () => void;
  onSubmitSuccess?: (project: any) => void;
  initialData?: {
    projectName?: string;
    projectCode?: string;
    description?: string;
    projectStatus?: string;
  };
  onLoadingChange?: (loading: boolean) => void;
  ref?: React.RefObject<HTMLFormElement>;
}

const ProjectForm = React.forwardRef<HTMLFormElement, ProjectFormProps>(
  ({ onClose, onSubmitSuccess, initialData, onLoadingChange }, ref) => {
    const [formData, setFormData] = useState({
      projectName: initialData?.projectName || '',
      projectCode: initialData?.projectCode || '',
      description: initialData?.description || '',
      projectStatus: initialData?.projectStatus || 'active',
      modules: [] as Module[],
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [availableModules, setAvailableModules] = useState<Module[]>([]);
    const [loadingModules, setLoadingModules] = useState(false);

    // Load available modules
    useEffect(() => {
      const loadModules = async () => {
        setLoadingModules(true);
        try {
          const response = await fetchModules();
          setAvailableModules(response.modules);
        } catch (error) {
          console.error('Failed to load modules:', error);
          toast.error('Failed to load modules');
        } finally {
          setLoadingModules(false);
        }
      };

      loadModules();
    }, []);

    const handleInputChange = (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));

      // Clear error when field is edited
      if (errors[name]) {
        setErrors(prev => ({
          ...prev,
          [name]: '',
        }));
      }
    };

    const handleModuleToggle = (module: Module) => {
      setFormData(prev => {
        const existingModule = prev.modules.find(m => m._id === module._id);
        if (existingModule) {
          // Remove module
          return {
            ...prev,
            modules: prev.modules.filter(m => m._id !== module._id),
          };
        } else {
          // Add entire module object
          return {
            ...prev,
            modules: [...prev.modules, module],
          };
        }
      });
    };

    const validateForm = () => {
      const newErrors: Record<string, string> = {};

      if (!formData.projectName.trim()) {
        newErrors.projectName = 'Project name is required';
      }

      if (!formData.projectCode.trim()) {
        newErrors.projectCode = 'Project code is required';
      }

      if (!formData.description.trim()) {
        newErrors.description = 'Project description is required';
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      setLoading(true);

      try {
        const projectData: CreateProjectPayload = {
          projectName: formData.projectName,
          projectCode: formData.projectCode,
          description: formData.description,
          projectStatus: formData.projectStatus,
          modules: formData.modules.map(module => ({
            moduleId: module._id,
            isActive: true,
          })),
        };

        const response = await createProject(projectData);

        // Call the onSubmitSuccess callback with the new project
        if (onSubmitSuccess) {
          onSubmitSuccess(response.data || response);
        }

        toast.success('Project created successfully');
        onClose();
      } catch (error: any) {
        console.error('Error creating project:', error);
        toast.error(error.message || 'Failed to create project');
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      if (onLoadingChange) {
        onLoadingChange(loading);
      }
    }, [loading, onLoadingChange]);

    return (
      <form onSubmit={handleSubmit} className='space-y-6' ref={ref}>
        <div className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Project Name*
            </label>
            <Input
              name='projectName'
              value={formData.projectName}
              onChange={handleInputChange}
              placeholder='Enter project name'
              className={errors.projectName ? 'border-red-500' : ''}
            />
            {errors.projectName && (
              <p className='mt-1 text-sm text-red-600'>{errors.projectName}</p>
            )}
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Project Code*
            </label>
            <Input
              name='projectCode'
              value={formData.projectCode}
              onChange={handleInputChange}
              placeholder='Enter project code'
              className={errors.projectCode ? 'border-red-500' : ''}
            />
            {errors.projectCode && (
              <p className='mt-1 text-sm text-red-600'>{errors.projectCode}</p>
            )}
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Project Status
            </label>
            <select
              name='projectStatus'
              value={formData.projectStatus}
              onChange={handleInputChange}
              className='mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md bg-gray-50'
            >
              <option value='active'>Active</option>
              <option value='pending'>Pending</option>
              <option value='completed'>Completed</option>
              <option value='onhold'>On Hold</option>
            </select>
          </div>
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Project Description*
          </label>
          <textarea
            name='description'
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-gray-50 ${errors.description ? 'border-red-500' : ''}`}
            placeholder='Enter project details'
          />
          {errors.description && (
            <p className='mt-1 text-sm text-red-600'>{errors.description}</p>
          )}
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Select Modules
          </label>
          {loadingModules ? (
            <div className='flex items-center justify-center py-4'>
              <Loader2 className='h-5 w-5 animate-spin mr-2' />
              <span>Loading modules...</span>
            </div>
          ) : (
            <div className='mt-1 border border-gray-300 rounded-md p-3 max-h-48 overflow-y-auto bg-gray-50'>
              {availableModules.length === 0 ? (
                <p className='text-gray-500 text-sm'>No modules available</p>
              ) : (
                <div className='space-y-2'>
                  {availableModules.map(module => (
                    <label
                      key={module._id}
                      className='flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer'
                    >
                      <input
                        type='checkbox'
                        name='modules'
                        value={module._id}
                        checked={formData.modules.some(
                          m => m._id === module._id
                        )}
                        onChange={() => handleModuleToggle(module)}
                        className='form-checkbox h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded'
                      />
                      <div className='ml-3'>
                        <div className='text-sm font-medium text-gray-900'>
                          {module.name}
                        </div>
                        <div className='text-xs text-gray-500'>
                          {module.description}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}
          {formData.modules.length > 0 && (
            <div className='mt-2'>
              <p className='text-sm text-gray-600'>
                Selected modules: {formData.modules.length}
              </p>
            </div>
          )}
        </div>
      </form>
    );
  }
);

ProjectForm.displayName = 'ProjectForm';

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

const CreateProject: React.FC = () => {
  const { getColorClasses } = useTheme();
  const [projects, setProjects] = useState<Project[]>([]);
  const [showDrawer, setShowDrawer] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProjects, setTotalProjects] = useState(0);
  const [limit] = useState(10);
  const [formLoading, setFormLoading] = useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);

  useEffect(() => {
    const loadProjects = async () => {
      setLoading(true);
      try {
        const response = await fetchProjects(currentPage, limit);
        setProjects(response.projects);
        setTotalProjects(response.total);
      } catch (err: any) {
        setError(err.message || 'Failed to load projects');
        toast.error('Failed to load projects');
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, [currentPage, limit]);

  // Filter projects based on search query
  const filteredProjects = projects.filter(
    project =>
      project.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.projectCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Function to handle project creation (would connect to API in real implementation)
  const handleCreateProject = () => {
    console.log('Create Project button clicked!');
    setShowDrawer(true);
  };

  // Function to handle adding a new project to the list
  const handleAddProject = (newProject: any) => {
    setProjects(prevProjects => [newProject, ...prevProjects]);
  };

  // Function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Function to get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'onhold':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Calculate pagination values
  const totalPages = Math.ceil(totalProjects / limit);
  const showingFrom = (currentPage - 1) * limit + 1;
  const showingTo = Math.min(currentPage * limit, totalProjects);

  const closeDrawer = () => {
    setShowDrawer(false);
  };

  const handleFormSubmit = () => {
    if (formRef.current) {
      formRef.current.requestSubmit();
    }
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
        {formLoading ? 'Creating...' : 'Create Project'}
      </Button>
    </div>
  );

  if (error) return <div className='p-8 text-center text-red-500'>{error}</div>;

  return (
    <div className='container mx-auto p-6'>
      <div className='flex justify-between items-center mb-8'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Projects</h1>
          <p className='mt-2 text-gray-600'>
            Manage your organization's projects
          </p>
        </div>
        <Button
          onClick={handleCreateProject}
          leftIcon={<Plus className='h-4 w-4' />}
          className={`min-w-[140px] bg-${getColorClasses('primary')} hover:bg-${getColorClasses('hover')} text-white`}
        >
          Create Project
        </Button>
      </div>

      <div className='bg-white rounded-lg shadow overflow-hidden'>
        <div className='p-4 border-b border-gray-200'>
          <div className='flex items-center gap-4'>
            <div className='relative flex-1'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <Search className='h-5 w-5 text-gray-400' />
              </div>
              <Input
                type='text'
                placeholder='Search projects...'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className='pl-10'
              />
            </div>
          </div>
        </div>

        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                >
                  Project Name
                </th>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                >
                  Project Code
                </th>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                >
                  Status
                </th>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                >
                  Modules
                </th>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                >
                  Created At
                </th>
                <th
                  scope='col'
                  className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className='px-6 py-4 whitespace-nowrap text-center'
                  >
                    <div className='flex items-center justify-center'>
                      <Loader2 className='h-5 w-5 text-primary-500 animate-spin mr-2' />
                      <span>Loading projects...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredProjects.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className='px-6 py-4 whitespace-nowrap text-center text-gray-500'
                  >
                    No projects found
                  </td>
                </tr>
              ) : (
                filteredProjects.map(project => (
                  <tr key={project.id} className='hover:bg-gray-50'>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='flex items-center'>
                        <div>
                          <div className='text-sm font-medium text-gray-900'>
                            {project.projectName}
                          </div>
                          <div className='text-sm text-gray-500 truncate max-w-xs'>
                            {project.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {project.projectCode}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(project.projectStatus)}`}
                      >
                        {project.projectStatus.charAt(0).toUpperCase() +
                          project.projectStatus.slice(1)}
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      <div className='flex items-center gap-1'>
                        <Package className='h-4 w-4 text-gray-400' />
                        <span>{project.modules.length} modules</span>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {formatDate(project.createdAt)}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                      <div className='flex justify-end space-x-2'>
                        <button
                          className='text-primary-600 hover:text-primary-900'
                          onClick={() =>
                            toast.info(`Edit project: ${project.projectName}`)
                          }
                        >
                          <Edit2 className='h-4 w-4' />
                        </button>
                        <button
                          className='text-red-600 hover:text-red-900'
                          onClick={() =>
                            toast.info(`Delete project: ${project.projectName}`)
                          }
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
      <div className='mt-4 flex justify-center'>
        <Pagination
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          totalItems={totalProjects}
          showingFrom={showingFrom}
          showingTo={showingTo}
        />
      </div>

      {/* Create Project Drawer */}
      <Drawer
        isOpen={showDrawer}
        onClose={closeDrawer}
        title='Create New Project'
        footer={renderDrawerFooter()}
      >
        <ProjectForm
          ref={formRef}
          onClose={closeDrawer}
          onSubmitSuccess={handleAddProject}
          onLoadingChange={setFormLoading}
        />
      </Drawer>
    </div>
  );
};

export default CreateProject;
