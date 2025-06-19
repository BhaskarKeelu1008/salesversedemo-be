import { Upload } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

interface ResourceFile {
  id: string;
  channel: string;
  category: string;
  subCategory: string;
  status: 'active' | 'inactive';
  title: string;
  description: string;
  thumbnail: string;
  tags: string[];
  publishStatus: 'publish' | 'draft';
  uploadedDate: string;
  uploadedBy: string;
}

const ResourceCenter: React.FC = () => {
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [formData, setFormData] = useState({
    channel: '',
    resourceCategory: '',
    subCategory: '',
    status: 'active' as 'active' | 'inactive',
    title: '',
    description: '',
    thumbnail: null as File | null,
    thumbnailPreview: '',
    tags: [] as string[],
    publishStatus: 'publish' as 'publish' | 'draft',
  });

  const [newTag, setNewTag] = useState('');

  const [resources] = useState<ResourceFile[]>([
    {
      id: '1',
      channel: 'Channel 1',
      category: 'Category 1',
      subCategory: 'Sub-category 1',
      status: 'active',
      title: 'Product Catalog 2024',
      description: 'This is a description of the product catalog',
      thumbnail: 'https://via.placeholder.com/150',
      tags: ['PDF', 'Product Catalog'],
      publishStatus: 'publish',
      uploadedDate: '2024-03-15',
      uploadedBy: 'John Doe',
    },
    // Add more sample data as needed
  ]);

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
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        thumbnail: file,
        thumbnailPreview: URL.createObjectURL(file),
      }));
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form data:', formData);
    setShowUploadForm(false);
  };

  return (
    <div className='p-6'>
      <div className='flex justify-between items-center mb-8'>
        <h1 className='text-2xl font-bold text-gray-900'>Resource Center</h1>
        <Button variant='default' onClick={() => setShowUploadForm(true)}>
          Upload New Resource
        </Button>
      </div>

      {/* Upload Form Modal */}
      {showUploadForm && (
        <div className='fixed inset-0 z-50 overflow-hidden'>
          <div className='flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0'>
            <div
              className='fixed inset-0 transition-opacity'
              aria-hidden='true'
            >
              <div className='absolute inset-0 bg-gray-500 opacity-75'></div>
            </div>

            <div className='inline-block w-full h-[90vh] max-w-2xl overflow-hidden text-left align-middle transition-all transform bg-white rounded-lg shadow-xl'>
              <form onSubmit={handleSubmit} className='flex flex-col h-full'>
                {/* Fixed Header */}
                <div className='px-6 py-4 border-b border-gray-200'>
                  <h3 className='text-lg font-medium text-gray-900'>
                    Upload New Resource
                  </h3>
                </div>

                {/* Scrollable Content */}
                <div className='flex-1 px-6 py-4 overflow-y-auto'>
                  <div className='space-y-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Channel:
                      </label>
                      <select
                        name='channel'
                        value={formData.channel}
                        onChange={handleInputChange}
                        className='mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md'
                      >
                        <option value=''>Select Channel *</option>
                        <option value='channel1'>Channel 1</option>
                        <option value='channel2'>Channel 2</option>
                      </select>
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Resource Category:
                      </label>
                      <select
                        name='resourceCategory'
                        value={formData.resourceCategory}
                        onChange={handleInputChange}
                        className='mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md'
                      >
                        <option value=''>Select Resource Category *</option>
                        <option value='category1'>Category 1</option>
                        <option value='category2'>Category 2</option>
                      </select>
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Sub-Categories:
                      </label>
                      <select
                        name='subCategory'
                        value={formData.subCategory}
                        onChange={handleInputChange}
                        className='mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md'
                      >
                        <option value=''>Select Sub-Categories *</option>
                        <option value='sub1'>Sub-category 1</option>
                        <option value='sub2'>Sub-category 2</option>
                      </select>
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Status:
                      </label>
                      <div className='mt-2 space-x-4'>
                        <label className='inline-flex items-center'>
                          <input
                            type='radio'
                            name='status'
                            value='active'
                            checked={formData.status === 'active'}
                            onChange={handleInputChange}
                            className='form-radio h-4 w-4 text-primary-600'
                          />
                          <span className='ml-2'>Active</span>
                        </label>
                        <label className='inline-flex items-center'>
                          <input
                            type='radio'
                            name='status'
                            value='inactive'
                            checked={formData.status === 'inactive'}
                            onChange={handleInputChange}
                            className='form-radio h-4 w-4 text-primary-600'
                          />
                          <span className='ml-2'>Inactive</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Title:
                      </label>
                      <Input
                        name='title'
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder='Enter title here *'
                      />
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Description:
                      </label>
                      <textarea
                        name='description'
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={4}
                        className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm'
                        placeholder='Enter description here *'
                      />
                      <div className='text-right text-xs text-gray-500 mt-1'>
                        0 / 2000
                      </div>
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        * Upload Thumbnail/Main Image:
                      </label>
                      <div className='mt-1 p-6 border-2 border-dashed border-gray-300 rounded-md text-center'>
                        <Button
                          type='button'
                          variant='outline'
                          className='flex items-center mx-auto'
                          onClick={() =>
                            document.getElementById('thumbnail-upload')?.click()
                          }
                        >
                          <Upload className='h-4 w-4 mr-2' />
                          UPLOAD
                        </Button>
                        <span className='text-sm text-gray-500 mt-2 block'>
                          File Name
                        </span>
                        <input
                          id='thumbnail-upload'
                          type='file'
                          className='hidden'
                          accept='image/*'
                          onChange={handleThumbnailChange}
                        />
                      </div>
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Tags:
                      </label>
                      <div className='flex items-center space-x-2'>
                        <select
                          value={newTag}
                          onChange={e => setNewTag(e.target.value)}
                          className='mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md'
                        >
                          <option value=''>
                            Select or Search Existing Tags
                          </option>
                          <option value='tag1'>Tag 1</option>
                          <option value='tag2'>Tag 2</option>
                        </select>
                        <Button
                          type='button'
                          onClick={handleAddTag}
                          className='flex-shrink-0'
                        >
                          ADD NEW TAG
                        </Button>
                      </div>
                      {formData.tags.length > 0 && (
                        <div className='mt-2 flex flex-wrap gap-2'>
                          {formData.tags.map(tag => (
                            <span
                              key={tag}
                              className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800'
                            >
                              {tag}
                              <button
                                type='button'
                                onClick={() => handleRemoveTag(tag)}
                                className='ml-1 inline-flex items-center p-0.5 rounded-full text-primary-400 hover:bg-primary-200 hover:text-primary-500 focus:outline-none'
                              >
                                <span className='sr-only'>Remove tag</span>×
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        * Publish:
                      </label>
                      <div className='mt-2 space-x-4'>
                        <label className='inline-flex items-center'>
                          <input
                            type='radio'
                            name='publishStatus'
                            value='publish'
                            checked={formData.publishStatus === 'publish'}
                            onChange={handleInputChange}
                            className='form-radio h-4 w-4 text-primary-600'
                          />
                          <span className='ml-2'>Publish</span>
                        </label>
                        <label className='inline-flex items-center'>
                          <input
                            type='radio'
                            name='publishStatus'
                            value='draft'
                            checked={formData.publishStatus === 'draft'}
                            onChange={handleInputChange}
                            className='form-radio h-4 w-4 text-primary-600'
                          />
                          <span className='ml-2'>Draft</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fixed Footer */}
                <div className='px-6 py-4 bg-gray-50 border-t border-gray-200'>
                  <div className='flex flex-row-reverse gap-2'>
                    <Button type='submit' variant='default'>
                      Submit
                    </Button>
                    <Button
                      type='button'
                      variant='outline'
                      onClick={() => setShowUploadForm(false)}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Resources List */}
      <div className='bg-white rounded-lg shadow overflow-hidden'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
              >
                Channel
              </th>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
              >
                Category
              </th>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
              >
                Sub-Category
              </th>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
              >
                Title
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
                Uploaded Date
              </th>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
              >
                Uploaded By
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {resources.map(resource => (
              <tr key={resource.id}>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                  {resource.channel}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                  {resource.category}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                  {resource.subCategory}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                  {resource.title}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                  {resource.status}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                  {resource.uploadedDate}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                  {resource.uploadedBy}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResourceCenter;
