import React, { useState } from 'react';
import { X, Plus, Trash2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../../context/ThemeContext';
import { createModule, CreateModulePayload } from '../services/moduleService';
import { toast } from 'sonner';
import { Button } from '../../../components/ui/Button';

interface CreateModuleFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
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
              className='h-[calc(100%-2rem)] w-full max-w-2xl bg-white shadow-xl flex flex-col rounded-xl border border-gray-200'
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

const CreateModuleForm: React.FC<CreateModuleFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { getColorClasses } = useTheme();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateModulePayload>({
    name: '',
    code: '',
    description: '',
    icon: '',
    isActive: true,
    isCore: false,
    version: '1.0.0',
    defaultConfig: {},
    permissions: [],
  });
  const [newPermission, setNewPermission] = useState('');
  const [newConfigKey, setNewConfigKey] = useState('');
  const [newConfigValue, setNewConfigValue] = useState('');

  const handleInputChange = (field: keyof CreateModulePayload, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddPermission = () => {
    if (
      newPermission.trim() &&
      !formData.permissions.includes(newPermission.trim())
    ) {
      setFormData(prev => ({
        ...prev,
        permissions: [...prev.permissions, newPermission.trim()],
      }));
      setNewPermission('');
    }
  };

  const handleRemovePermission = (permission: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.filter(p => p !== permission),
    }));
  };

  const handleAddConfig = () => {
    if (newConfigKey.trim() && newConfigValue.trim()) {
      setFormData(prev => ({
        ...prev,
        defaultConfig: {
          ...prev.defaultConfig,
          [newConfigKey.trim()]: newConfigValue.trim(),
        },
      }));
      setNewConfigKey('');
      setNewConfigValue('');
    }
  };

  const handleRemoveConfig = (key: string) => {
    setFormData(prev => {
      const newConfig = { ...prev.defaultConfig };
      delete newConfig[key];
      return {
        ...prev,
        defaultConfig: newConfig,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createModule(formData);
      toast.success('Module created successfully!');
      onSuccess();
      onClose();
      // Reset form
      setFormData({
        name: '',
        code: '',
        description: '',
        icon: '',
        isActive: true,
        isCore: false,
        version: '1.0.0',
        defaultConfig: {},
        permissions: [],
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to create module');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title='Create New Module'
      footer={
        <div className='flex justify-end gap-3'>
          <Button variant='outline' onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            leftIcon={
              loading ? <Loader2 className='h-4 w-4 animate-spin' /> : undefined
            }
            className={`bg-${getColorClasses('primary')} hover:bg-${getColorClasses('hover')} text-white`}
          >
            {loading ? 'Creating...' : 'Create Module'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className='space-y-6'>
        {/* Basic Information */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Module Name *
            </label>
            <input
              type='text'
              required
              value={formData.name}
              onChange={e => handleInputChange('name', e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              placeholder='Enter module name'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Module Code *
            </label>
            <input
              type='text'
              required
              value={formData.code}
              onChange={e => handleInputChange('code', e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              placeholder='Enter module code'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Version *
            </label>
            <input
              type='text'
              required
              value={formData.version}
              onChange={e => handleInputChange('version', e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              placeholder='e.g., 1.0.0'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Icon
            </label>
            <input
              type='text'
              value={formData.icon}
              onChange={e => handleInputChange('icon', e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              placeholder='e.g., fas fa-users'
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Description *
          </label>
          <textarea
            required
            value={formData.description}
            onChange={e => handleInputChange('description', e.target.value)}
            rows={3}
            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            placeholder='Enter module description'
          />
        </div>

        {/* Status */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='flex items-center'>
            <input
              type='checkbox'
              id='isActive'
              checked={formData.isActive}
              onChange={e => handleInputChange('isActive', e.target.checked)}
              className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
            />
            <label
              htmlFor='isActive'
              className='ml-2 block text-sm text-gray-900'
            >
              Active
            </label>
          </div>

          <div className='flex items-center'>
            <input
              type='checkbox'
              id='isCore'
              checked={formData.isCore}
              onChange={e => handleInputChange('isCore', e.target.checked)}
              className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
            />
            <label
              htmlFor='isCore'
              className='ml-2 block text-sm text-gray-900'
            >
              Core Module
            </label>
          </div>
        </div>

        {/* Permissions */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Permissions
          </label>
          <div className='flex gap-2 mb-3'>
            <input
              type='text'
              value={newPermission}
              onChange={e => setNewPermission(e.target.value)}
              className='flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              placeholder='Enter permission (e.g., CREATE_USER)'
              onKeyPress={e =>
                e.key === 'Enter' && (e.preventDefault(), handleAddPermission())
              }
            />
            <button
              type='button'
              onClick={handleAddPermission}
              className={`px-4 py-2 bg-${getColorClasses('primary')} text-white rounded-lg hover:opacity-90 transition-opacity`}
            >
              <Plus className='h-4 w-4' />
            </button>
          </div>
          <div className='flex flex-wrap gap-2'>
            {formData.permissions.map((permission, index) => (
              <span
                key={index}
                className='inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm'
              >
                {permission}
                <button
                  type='button'
                  onClick={() => handleRemovePermission(permission)}
                  className='text-blue-500 hover:text-blue-700'
                >
                  <Trash2 className='h-3 w-3' />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Default Config */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Default Configuration
          </label>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-2 mb-3'>
            <input
              type='text'
              value={newConfigKey}
              onChange={e => setNewConfigKey(e.target.value)}
              className='px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              placeholder='Config key'
            />
            <input
              type='text'
              value={newConfigValue}
              onChange={e => setNewConfigValue(e.target.value)}
              className='px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              placeholder='Config value'
            />
            <button
              type='button'
              onClick={handleAddConfig}
              className={`px-4 py-2 bg-${getColorClasses('primary')} text-white rounded-lg hover:opacity-90 transition-opacity`}
            >
              Add
            </button>
          </div>
          <div className='space-y-2'>
            {Object.entries(formData.defaultConfig).map(([key, value]) => (
              <div
                key={key}
                className='flex items-center justify-between bg-gray-50 px-3 py-2 rounded'
              >
                <span className='text-sm'>
                  <strong>{key}:</strong> {value}
                </span>
                <button
                  type='button'
                  onClick={() => handleRemoveConfig(key)}
                  className='text-red-500 hover:text-red-700'
                >
                  <Trash2 className='h-4 w-4' />
                </button>
              </div>
            ))}
          </div>
        </div>
      </form>
    </Drawer>
  );
};

export default CreateModuleForm;
