import {
  CheckCircle,
  Edit,
  Package,
  Plus,
  Search,
  Trash2,
  XCircle,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import LoadingScreen from '../../../components/ui/LoadingScreen';
import { Pagination } from '../../../components/ui/Pagination';
import { useTheme } from '../../../context/ThemeContext';
import { fetchModules, Module } from '../services/moduleService';
import CreateModuleForm from './CreateModuleForm';

const ModuleTablePage: React.FC = () => {
  const { getColorClasses } = useTheme();
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [totalModules, setTotalModules] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    const loadModules = async () => {
      setLoading(true);
      try {
        const response = await fetchModules(currentPage, itemsPerPage);
        setModules(response.modules);
        setTotalModules(response.total);
      } catch (err: any) {
        setError(err.message || 'Failed to load modules');
      } finally {
        setLoading(false);
      }
    };

    loadModules();
  }, [currentPage, itemsPerPage]);

  // Filter modules based on search and filters
  const filteredModules = modules.filter(module => {
    const matchesSearch =
      module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      module.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (module.code &&
        module.code.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' ? module.isActive : !module.isActive);

    return matchesSearch && matchesStatus;
  });

  const handleEdit = (moduleId: string) => {
    console.log('Edit module:', moduleId);
    // TODO: Implement edit functionality
  };

  const handleDelete = (moduleId: string) => {
    console.log('Delete module:', moduleId);
    // TODO: Implement delete functionality
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Calculate pagination values
  const totalPages = Math.ceil(totalModules / itemsPerPage);
  const showingFrom = (currentPage - 1) * itemsPerPage + 1;
  const showingTo = Math.min(currentPage * itemsPerPage, totalModules);

  if (loading) return <LoadingScreen />;
  if (error) return <div className='p-8 text-center text-red-500'>{error}</div>;

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <div
            className={`p-2 rounded-lg bg-${getColorClasses('primary')} text-white`}
          >
            <Package className='h-6 w-6' />
          </div>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>
              Module Configuration
            </h1>
            <p className='text-sm text-gray-600'>
              Manage and configure all system modules
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className={`px-4 py-2 bg-${getColorClasses('primary')} text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2`}
        >
          <Plus className='h-4 w-4' />
          Add Module
        </button>
      </div>

      {/* Filters */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4'>
        <div className='flex flex-col md:flex-row gap-4'>
          {/* Search */}
          <div className='flex-1'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
              <input
                type='text'
                placeholder='Search modules...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className='flex gap-2'>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className='px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            >
              <option value='all'>All Status</option>
              <option value='active'>Active</option>
              <option value='inactive'>Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Name
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Code
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Description
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Active
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Permissions
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Updated At
                </th>
                <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {filteredModules.map(module => (
                <tr key={module._id} className='hover:bg-gray-50'>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='text-sm font-medium text-gray-900'>
                      {module.name}
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='text-sm text-gray-900'>{module.code}</div>
                  </td>
                  <td className='px-6 py-4'>
                    <div className='text-sm text-gray-900 max-w-xs truncate'>
                      {module.description}
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    {module.isActive ? (
                      <CheckCircle className='h-5 w-5 text-green-500' />
                    ) : (
                      <XCircle className='h-5 w-5 text-red-500' />
                    )}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='flex flex-wrap gap-1'>
                      {module.permissions?.map((perm, idx) => (
                        <span
                          key={idx}
                          className='bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-medium'
                        >
                          {perm}
                        </span>
                      )) || (
                        <span className='text-xs text-gray-400'>
                          No permissions
                        </span>
                      )}
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='text-sm text-gray-500'>
                      {new Date(module.updatedAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-center text-sm font-medium'>
                    <div className='flex items-center justify-center gap-2'>
                      <button
                        onClick={() => handleEdit(module._id)}
                        className='text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50'
                        title='Edit Module'
                      >
                        <Edit className='h-4 w-4' />
                      </button>
                      <button
                        onClick={() => handleDelete(module._id)}
                        className='text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50'
                        title='Delete Module'
                      >
                        <Trash2 className='h-4 w-4' />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredModules.length === 0 && (
          <div className='text-center py-12'>
            <Package className='h-12 w-12 mx-auto text-gray-400 mb-4' />
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              No modules found
            </h3>
            <p className='text-gray-500'>
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className='mt-4 flex justify-center'>
        <Pagination
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          totalItems={totalModules}
          showingFrom={showingFrom}
          showingTo={showingTo}
        />
      </div>

      {/* Create Module Form */}
      <CreateModuleForm
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSuccess={() => {
          // Refresh the modules list
          const loadModules = async () => {
            try {
              const response = await fetchModules(currentPage, itemsPerPage);
              setModules(response.modules);
              setTotalModules(response.total);
            } catch (err: any) {
              console.error('Failed to refresh modules:', err);
            }
          };
          loadModules();
        }}
      />
    </div>
  );
};

export default ModuleTablePage;
