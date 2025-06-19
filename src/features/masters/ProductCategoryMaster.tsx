import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, Plus, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Pagination } from '../../components/ui/Pagination';
import { useTheme } from '../../context/ThemeContext';
import {
  ProductCategory,
  ProductCategoryListData,
  createProductCategory,
  getProductCategories,
  updateProductCategory,
} from '../../services/productCategoryService';

interface StatusModalProps {
  category: ProductCategory;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

const StatusModal: React.FC<StatusModalProps> = ({
  category,
  onConfirm,
  onCancel,
  isLoading,
}) => {
  const { getColorClasses } = useTheme();
  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
      <div className='bg-white rounded-lg max-w-md w-full p-6 space-y-4'>
        <h3 className='text-lg font-medium'>Update Status</h3>
        <p className='text-gray-600'>
          Are you sure you want to{' '}
          {category.status === 'active' ? 'deactivate' : 'activate'} the
          category "{category.categoryName}"?
        </p>
        <div className='flex justify-end space-x-3'>
          <Button variant='outline' onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            leftIcon={
              isLoading ? (
                <Loader2 className='h-4 w-4 animate-spin' />
              ) : undefined
            }
            className={`bg-${getColorClasses('primary')} hover:bg-${getColorClasses('hover')}`}
          >
            {isLoading ? 'Updating...' : 'Confirm'}
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

const ProductCategoryMaster: React.FC = () => {
  const { getColorClasses } = useTheme();
  const [categoryData, setCategoryData] = useState<ProductCategoryListData>({
    categories: [],
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 1,
    },
  });

  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    categoryName: '',
    sequenceNumber: '',
    status: 'active' as 'active' | 'inactive',
  });

  const [statusModal, setStatusModal] = useState<{
    show: boolean;
    category: ProductCategory | null;
  }>({
    show: false,
    category: null,
  });

  const fetchData = async () => {
    try {
      const response = await getProductCategories(currentPage, itemsPerPage);
      setCategoryData(response.data);
    } catch {
      toast.error('Failed to fetch product categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.categoryName.trim() || !formData.sequenceNumber) {
      toast.error('All fields are required');
      return;
    }

    setCreating(true);
    try {
      const user = localStorage.getItem('user');
      const userData = JSON.parse(user || '{}');
      await createProductCategory({
        categoryName: formData.categoryName.trim(),
        sequenceNumber: parseInt(formData.sequenceNumber),
        status: formData.status,
        createdBy: userData._id || 'default-user-id',
      });

      setShowAddModal(false);
      setFormData({
        categoryName: '',
        sequenceNumber: '',
        status: 'active',
      });

      await fetchData();
      toast.success('Product category created successfully');
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to create product category'
      );
    } finally {
      setCreating(false);
    }
  };

  const handleStatusUpdate = (category: ProductCategory) => {
    setStatusModal({ show: true, category });
  };

  const confirmStatusUpdate = async () => {
    if (!statusModal.category) return;

    const newStatus =
      statusModal.category.status === 'active' ? 'inactive' : 'active';
    setUpdating(statusModal.category._id);

    try {
      await updateProductCategory(statusModal.category._id, {
        categoryName: statusModal.category.categoryName,
        sequenceNumber: statusModal.category.sequenceNumber,
        status: newStatus,
        createdBy: statusModal.category.createdBy,
      });

      await fetchData();
      toast.success('Status updated successfully');
      setStatusModal({ show: false, category: null });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update status'
      );
    } finally {
      setUpdating(null);
    }
  };

  const renderDrawerFooter = () => (
    <div className='flex justify-end space-x-3'>
      <Button
        variant='outline'
        onClick={() => {
          setShowAddModal(false);
          setFormData({
            categoryName: '',
            sequenceNumber: '',
            status: 'active',
          });
        }}
        disabled={creating}
      >
        Cancel
      </Button>
      <Button
        type='submit'
        form='categoryForm'
        disabled={
          !formData.categoryName.trim() || !formData.sequenceNumber || creating
        }
        leftIcon={
          creating ? <Loader2 className='h-4 w-4 animate-spin' /> : undefined
        }
        className={`bg-${getColorClasses('primary')} hover:bg-${getColorClasses('hover')} text-white`}
      >
        {creating ? 'Creating...' : 'Create Category'}
      </Button>
    </div>
  );

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold text-gray-900'>
          Product Category Master
        </h1>
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
                  Category Name
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Sequence Number
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
                    colSpan={4}
                    className='px-6 py-4 text-center text-sm text-gray-500'
                  >
                    <div className='flex items-center justify-center space-x-2'>
                      <Loader2 className='h-5 w-5 animate-spin' />
                      <span>Loading categories...</span>
                    </div>
                  </td>
                </tr>
              ) : categoryData.categories.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className='px-6 py-4 text-center text-sm text-gray-500'
                  >
                    No categories found
                  </td>
                </tr>
              ) : (
                categoryData.categories.map(category => (
                  <tr key={category._id} className='hover:bg-gray-50'>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 truncate'>
                      {category.categoryName}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 truncate'>
                      {category.sequenceNumber}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${category.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                      >
                        {category.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-center text-sm font-medium'>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => handleStatusUpdate(category)}
                        disabled={updating === category._id}
                        className={`text-${getColorClasses('primary')} hover:text-${getColorClasses('hover')} hover:bg-${getColorClasses('bg')} w-full justify-center`}
                      >
                        {category.status === 'active'
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
      {/* Add Category Drawer */}
      <Drawer
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setFormData({
            categoryName: '',
            sequenceNumber: '',
            status: 'active',
          });
        }}
        title='Create New Category'
        footer={renderDrawerFooter()}
      >
        <form onSubmit={handleCreateCategory} id='categoryForm'>
          <div className='space-y-4'>
            <Input
              label='Category Name'
              type='text'
              value={formData.categoryName}
              onChange={e =>
                setFormData(prev => ({ ...prev, categoryName: e.target.value }))
              }
              placeholder='Enter category name'
              fullWidth
              required
              className='bg-gray-50'
            />
            <Input
              label='Sequence Number'
              type='number'
              value={formData.sequenceNumber}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  sequenceNumber: e.target.value,
                }))
              }
              placeholder='Enter sequence number'
              fullWidth
              required
              className='bg-gray-50'
            />
            <div className='flex items-center justify-between'>
              <span className='text-sm text-gray-700'>Enable Category</span>
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
      {statusModal.show && statusModal.category && (
        <StatusModal
          category={statusModal.category}
          onConfirm={confirmStatusUpdate}
          onCancel={() => setStatusModal({ show: false, category: null })}
          isLoading={updating === statusModal.category._id}
        />
      )}
      {/* Pagination */}
      <Pagination
        currentPage={categoryData.pagination.page}
        totalPages={categoryData.pagination.totalPages}
        onPageChange={setCurrentPage}
        totalItems={categoryData.pagination.total}
        showingFrom={
          (categoryData.pagination.page - 1) * categoryData.pagination.limit + 1
        }
        showingTo={Math.min(
          categoryData.pagination.page * categoryData.pagination.limit,
          categoryData.pagination.total
        )}
      />
    </div>
  );
};

export default ProductCategoryMaster;
