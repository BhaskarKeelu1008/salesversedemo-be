import React, { useState } from 'react';
import { Upload, Plus } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

interface Presentation {
  id: string;
  title: string;
  channelCode: string;
  status: 'active' | 'inactive';
  description: string;
  thumbnail: string;
  publishStatus: 'publish' | 'draft';
  createdDate: string;
  createdBy: string;
}

const Presentation: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    channelCode: '',
    status: 'active' as 'active' | 'inactive',
    description: '',
    thumbnail: null as File | null,
    thumbnailPreview: '',
    publishStatus: 'publish' as 'publish' | 'draft',
  });

  const [presentations] = useState<Presentation[]>([
    {
      id: '1',
      title: 'Product Overview 2024',
      channelCode: 'CH001',
      status: 'active',
      description: 'Comprehensive product overview for sales team',
      thumbnail: 'thumbnail1.jpg',
      publishStatus: 'publish',
      createdDate: '2024-03-15',
      createdBy: 'John Doe',
    },
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form data:', formData);
    setShowForm(false);
  };

  return (
    <div className='p-6'>
      <div className='flex justify-between items-center mb-8'>
        <h1 className='text-2xl font-bold text-gray-900'>Presentations</h1>
        <Button
          variant='default'
          onClick={() => setShowForm(true)}
          leftIcon={<Plus className='h-4 w-4' />}
        >
          Create Presentation
        </Button>
      </div>

      {/* Create Presentation Form Modal */}
      {showForm && (
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
                    New Presentation
                  </h3>
                </div>

                {/* Scrollable Content */}
                <div className='flex-1 px-6 py-4 overflow-y-auto'>
                  <div className='space-y-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Title:
                      </label>
                      <Input
                        name='title'
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder='Enter title here *'
                        required
                      />
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Channel Code:
                      </label>
                      <Input
                        name='channelCode'
                        value={formData.channelCode}
                        onChange={handleInputChange}
                        placeholder='Channel *'
                        required
                      />
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
                        Description:
                      </label>
                      <textarea
                        name='description'
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={4}
                        className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm'
                        placeholder='Enter description here *'
                        required
                      />
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        * Upload Presentation Images here *
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
                          Drag Presentation Images here *
                        </Button>
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
                      onClick={() => setShowForm(false)}
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

      {/* Presentations List */}
      <div className='bg-white rounded-lg shadow overflow-hidden'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
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
                Channel Code
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
                Created Date
              </th>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
              >
                Created By
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {presentations.map(presentation => (
              <tr key={presentation.id}>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                  {presentation.title}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                  {presentation.channelCode}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      presentation.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {presentation.status}
                  </span>
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                  {presentation.createdDate}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                  {presentation.createdBy}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Presentation;
