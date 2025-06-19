import { AnimatePresence, motion } from 'framer-motion';
import { Edit2, Loader2, Plus, Search, Upload, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Pagination } from '../../components/ui/Pagination';
import { getApiUrl } from '../../config';
import { useTheme } from '../../context/ThemeContext';
import { getActiveChannels } from '../../services/channelService';
import { getActiveProductCategories } from '../../services/productCategoryService';
import {
  Product as APIProduct,
  getProducts,
} from '../../services/productService';

// Helper function to extract clean category ID from various formats
const extractCategoryId = (categoryId: any): string => {
  if (!categoryId) return '';

  // If it's already a simple string, return it
  if (typeof categoryId === 'string' && !categoryId.includes('ObjectId')) {
    return categoryId;
  }

  // If it's a stringified object containing ObjectId
  if (typeof categoryId === 'string' && categoryId.includes('ObjectId')) {
    try {
      // Try to extract the ID from the string
      const match = categoryId.match(/'([^']+)'/);
      if (match && match[1]) {
        return match[1];
      }
    } catch (error) {
      console.error('Error parsing categoryId:', error);
    }
  }

  // If it's an object with _id property
  if (
    typeof categoryId === 'object' &&
    categoryId !== null &&
    '_id' in categoryId
  ) {
    return categoryId._id;
  }

  // If it's an object with id property
  if (
    typeof categoryId === 'object' &&
    categoryId !== null &&
    'id' in categoryId
  ) {
    return categoryId.id;
  }

  // Default case: return as string or empty string
  return String(categoryId) || '';
};

// Supported file types
const SUPPORTED_FILE_TYPES = {
  IMAGE: [
    '.jpg',
    '.jpeg',
    '.png',
    '.gif',
    '.webp',
    '.svg',
    '.tif',
    '.tiff',
    '.bmp',
  ],
  VIDEO: ['.mp4', '.webm', '.avi', '.mov', '.wmv', '.flv', '.3gp'],
  DOCUMENT: [
    '.pdf',
    '.doc',
    '.docx',
    '.xls',
    '.xlsx',
    '.ppt',
    '.pptx',
    '.txt',
    '.csv',
    '.rtf',
  ],
};

interface FileWithTitle {
  file: File;
  title: string;
}

interface FormData {
  productCategory: string;
  channelIds: string[];
  productName: string;
  productStatus: 'active' | 'inactive';
  webLink: string;
  applicationId: string;
  productDescription: string;
  reasons: string[];
  videos: FileWithTitle[];
  videoUrl: string;
  youtubeTitle: string;
  images: FileWithTitle[];
  documents: FileWithTitle[];
  fileCategory: string;
  fileType: string;
  language: string;
}

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer: React.ReactNode;
  currentStage?: number;
}

const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  currentStage = 1,
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
              className='h-[calc(100%-2rem)] w-full max-w-4xl bg-white shadow-xl flex flex-col rounded-xl border border-gray-200'
            >
              {/* Fixed Header */}
              <div
                className={`flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-${getColorClasses('primary')} text-white rounded-t-xl`}
              >
                <div className='flex items-center space-x-4'>
                  <h2 className='text-xl font-semibold'>{title}</h2>
                  {/* Stepper */}
                  <div className='flex items-center space-x-2'>
                    {[1, 2, 3].map(stage => (
                      <div key={stage} className='flex items-center'>
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                            currentStage >= stage
                              ? `bg-${getColorClasses('primary')} text-white`
                              : 'bg-gray-200 text-gray-500'
                          }`}
                        >
                          {stage}
                        </div>
                        {stage < 3 && (
                          <div
                            className={`w-8 h-1 mx-1 ${
                              currentStage > stage
                                ? `bg-${getColorClasses('primary')}`
                                : 'bg-gray-200'
                            }`}
                          />
                        )}
                      </div>
                    ))}
                  </div>
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

const CreateProduct: React.FC = () => {
  const { getColorClasses } = useTheme();
  const [showModal, setShowModal] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [fileUploading, setFileUploading] = useState<{
    videos: Record<number, boolean>;
    images: Record<number, boolean>;
    documents: Record<number, boolean>;
  }>({
    videos: {},
    images: {},
    documents: {},
  });
  const [currentStage, setCurrentStage] = useState(1);
  const totalStages = 3; // Adjust based on your total number of stages

  // State for dynamic data
  const [channels, setChannels] = useState<any[]>([]);
  const [categories, setCategories] = useState<
    { _id: string; categoryName: string }[]
  >([]);

  // Product list state
  const [productData, setProductData] = useState<{
    products: APIProduct[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  }>({
    products: [],
    pagination: {
      total: 0,
      page: 1,
      limit: 10,
      pages: 0,
    },
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<APIProduct | null>(
    null
  );

  const [formData, setFormData] = useState<FormData>({
    productCategory: '',
    channelIds: [],
    productName: '',
    productStatus: 'active',
    webLink: '',
    applicationId: '',
    productDescription: '',
    reasons: ['', '', '', '', ''],
    videos: [],
    videoUrl: '',
    youtubeTitle: '',
    images: [],
    documents: [],
    fileCategory: '',
    fileType: 'PDF',
    language: 'English',
  });

  // Track uploaded file URLs
  const [uploadedFiles, setUploadedFiles] = useState<{
    videos: { title: string; url: string }[];
    images: { title: string; url: string }[];
    documents: { title: string; url: string }[];
  }>({
    videos: [],
    images: [],
    documents: [],
  });

  // Fetch channels and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [channelsData, categoriesData] = await Promise.all([
          getActiveChannels(),
          getActiveProductCategories(),
        ]);
        setChannels(channelsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to fetch channels or categories');
      }
    };

    fetchData();
  }, []);

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await getProducts(currentPage, 10, 'active');
      setProductData(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    if (name === 'channelIds' && e.target instanceof HTMLInputElement) {
      // Handle checkbox selection
      const channelId = e.target.value;
      const isChecked = e.target.checked;

      setFormData(prev => ({
        ...prev,
        channelIds: isChecked
          ? [...prev.channelIds, channelId]
          : prev.channelIds.filter(id => id !== channelId),
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleReasonChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      reasons: prev.reasons.map((reason, i) => (i === index ? value : reason)),
    }));
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'videos' | 'images' | 'documents'
  ) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      // Create file objects with empty titles
      const newFiles = files.map(file => ({
        file,
        title: file.name.split('.')[0], // Use filename without extension as title
      }));

      // Add files to form data
      setFormData(prev => ({
        ...prev,
        [type]: [...prev[type], ...newFiles],
      }));
    }
  };

  // Function to upload a single file
  const uploadSingleFile = async (
    type: 'videos' | 'images' | 'documents',
    index: number
  ) => {
    try {
      // Set this specific file as uploading
      setFileUploading(prev => ({
        ...prev,
        [type]: {
          ...prev[type],
          [index]: true,
        },
      }));

      // Check if index is valid
      if (index < 0 || index >= formData[type].length) {
        console.error(`Invalid index ${index} for ${type}`);
        toast.error('Invalid file index');
        return;
      }

      const fileToUpload = formData[type][index];

      // Check if title is provided
      if (!fileToUpload.title) {
        toast.error('Please provide a title for the file before uploading');
        return;
      }

      // Create FormData for this specific file
      const uploadFormData = new FormData();
      const user = localStorage.getItem('user');
      const userData = JSON.parse(user || '{}');

      uploadFormData.append('userId', userData._id);
      uploadFormData.append(
        'fileType',
        type === 'videos' ? 'video' : type === 'images' ? 'image' : 'document'
      );
      uploadFormData.append('isMultiple', 'false');
      uploadFormData.append('files', fileToUpload.file);

      console.log(`Uploading ${type} file: ${fileToUpload.file.name}`);

      const response = await fetch(`${getApiUrl('api')}/products/upload`, {
        method: 'POST',
        body: uploadFormData,
      });

      if (!response.ok) {
        throw new Error(`Failed to upload ${type}`);
      }

      const result = await response.json();
      console.log('Upload response:', result);

      // Process upload result
      let uploadedFile: { title: string; url: string } | null = null;

      if (result.data && result.data.fileUrl) {
        uploadedFile = {
          title: fileToUpload.title,
          url: result.data.fileUrl,
        };
      } else if (
        Array.isArray(result.data) &&
        result.data.length > 0 &&
        result.data[0].fileUrl
      ) {
        uploadedFile = {
          title: fileToUpload.title,
          url: result.data[0].fileUrl,
        };
      }

      if (uploadedFile) {
        // Add to uploaded files
        setUploadedFiles(prev => ({
          ...prev,
          [type]: [...prev[type], uploadedFile!],
        }));

        // Remove from form data
        setFormData(prev => ({
          ...prev,
          [type]: prev[type].filter((_, i) => i !== index),
        }));

        toast.success(`${type.slice(0, -1)} uploaded successfully`);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      toast.error(
        error instanceof Error ? error.message : `Failed to upload ${type}`
      );
    } finally {
      // Clear this specific file's uploading state
      setFileUploading(prev => ({
        ...prev,
        [type]: {
          ...prev[type],
          [index]: false,
        },
      }));
    }
  };

  const handleFileTitleChange = (
    type: 'videos' | 'images' | 'documents',
    index: number,
    title: string
  ) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].map((item, i) =>
        i === index ? { ...item, title } : item
      ),
    }));
  };

  const handleDeleteFile = (
    type: 'videos' | 'images' | 'documents',
    index: number
  ) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));

    // Also remove from uploaded files if exists
    setUploadedFiles(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
  };

  // No need for uploadFiles function as files are uploaded directly in handleFileChange

  // No need for handleStageUpload as files are uploaded directly in handleFileChange

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (currentStage < totalStages) {
      // Validate current stage
      let canProceed = true;

      if (currentStage === 1) {
        if (
          !formData.productCategory ||
          !formData.productName ||
          formData.channelIds.length === 0
        ) {
          toast.error('Please fill in all required fields');
          canProceed = false;
        }
      } else if (currentStage === 2) {
        // Validate titles for all files
        const hasUntitledFiles = [
          ...formData.videos,
          ...formData.images,
          ...formData.documents,
        ].some(file => !file.title);

        if (hasUntitledFiles) {
          toast.error('Please enter titles for all files');
          canProceed = false;
        } else if (
          formData.videos.length > 0 ||
          formData.images.length > 0 ||
          formData.documents.length > 0
        ) {
          // Remind user to upload files before proceeding
          toast.info(
            'Please upload all files before proceeding to the next step'
          );
          // Don't block proceeding if there are pending files - they can still upload them on the review page
        }

        // Validate YouTube video title if URL is provided
        if (formData.videoUrl && !formData.youtubeTitle) {
          toast.error('Please provide a title for the YouTube video');
          canProceed = false;
        }
      }

      if (canProceed) {
        setCurrentStage(prev => prev + 1);
      }
      return;
    }

    // Stage 3: Final product creation or update (files are already uploaded)
    try {
      setLoading(true);

      // Check if there are any pending files that haven't been uploaded yet
      const pendingFiles = [
        ...formData.videos,
        ...formData.images,
        ...formData.documents,
      ];

      if (pendingFiles.length > 0) {
        toast.warning(
          `You have ${pendingFiles.length} file(s) that haven't been uploaded yet. Please upload them before proceeding.`
        );
        setLoading(false);
        return;
      }

      // Log the current state for debugging
      console.log('Current form data:', formData);
      console.log('Current uploaded files:', uploadedFiles);

      // Files are already uploaded when selected
      console.log('Using previously uploaded files:', uploadedFiles);

      const user = localStorage.getItem('user');
      const userData = JSON.parse(user || '{}');

      // Log the uploaded files to debug
      console.log('Videos before payload creation:', uploadedFiles.videos);
      console.log('Images before payload creation:', uploadedFiles.images);
      console.log(
        'Documents before payload creation:',
        uploadedFiles.documents
      );

      // Create videos array for payload
      const videosForPayload: Array<{
        title: string;
        s3Links: string[];
        youtubeUrl?: string;
        isActive: boolean;
      }> = [
        ...uploadedFiles.videos.map(video => ({
          title: video.title,
          s3Links: [video.url], // Ensure URL is wrapped in an array for s3Links
          isActive: true,
        })),
      ];

      console.log('Video payload structure:', videosForPayload);

      // Add YouTube video if URL is provided
      if (formData.videoUrl && formData.videoUrl.trim() !== '') {
        // Check if this YouTube URL already exists in the payload (to avoid duplicates)
        const youtubeExists = videosForPayload.some(
          video => video.youtubeUrl === formData.videoUrl
        );

        if (!youtubeExists) {
          videosForPayload.push({
            title: formData.youtubeTitle || 'YouTube Video',
            youtubeUrl: formData.videoUrl,
            s3Links: [], // YouTube videos have empty s3Links array
            isActive: true,
          });
        }
      }

      console.log('Final videos payload with YouTube:', videosForPayload);

      // Create images array for payload
      const imagesForPayload = uploadedFiles.images.map(image => ({
        title: image.title,
        s3Link: image.url,
        isActive: true,
      }));

      console.log('Final images for payload:', imagesForPayload);

      // Create documents array for payload
      const documentsForPayload = uploadedFiles.documents.map(doc => {
        // Use the helper function to extract the clean categoryId
        const cleanCategoryId = extractCategoryId(formData.fileCategory);
        console.log('Document categoryId after processing:', cleanCategoryId);

        return {
          categoryId: cleanCategoryId,
          fileType: formData.fileType || 'PDF',
          language: formData.language || 'English',
          brochureName: doc.title,
          s3Link: doc.url,
        };
      });

      console.log('Final documents for payload:', documentsForPayload);

      // Create base payload without createdBy
      const basePayload = {
        productCategoryId: formData.productCategory,
        channelIds: formData.channelIds,
        productName: formData.productName,
        status: formData.productStatus,
        webLink: formData.webLink,
        applicationId: formData.applicationId,
        productDescription: formData.productDescription,
        reasonsToBuy: {
          reason1: formData.reasons[0],
          reason2: formData.reasons[1],
          reason3: formData.reasons[2],
          reason4: formData.reasons[3],
          reason5: formData.reasons[4],
        },
        media: {
          videos: videosForPayload,
          images: imagesForPayload,
        },
        files: documentsForPayload,
      };

      // Only add createdBy for new products, not for updates
      const productPayload = selectedProduct
        ? basePayload
        : { ...basePayload, createdBy: userData._id };

      // Log the final payload for debugging
      console.log(
        'FINAL PRODUCT PAYLOAD:',
        JSON.stringify(productPayload, null, 2)
      );

      // Final validation check for document categoryId
      if (productPayload.files && productPayload.files.length > 0) {
        const hasInvalidCategoryId = productPayload.files.some(file => {
          const isValid =
            typeof file.categoryId === 'string' &&
            file.categoryId.length === 24 &&
            !file.categoryId.includes('ObjectId');
          return !isValid;
        });

        if (hasInvalidCategoryId) {
          console.error('Invalid categoryId detected in files payload');
          toast.error(
            'Invalid document category ID format. Please check the file category.'
          );
          setLoading(false);
          return;
        }
      }

      let response;

      if (selectedProduct) {
        // Update existing product (PUT) with specific ID pattern
        response = await fetch(
          `${getApiUrl('api')}/products/${selectedProduct._id}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              accept: '*/*',
            },
            body: JSON.stringify(productPayload),
          }
        );

        if (!response.ok) {
          throw new Error('Failed to update product');
        }

        toast.success('Product updated successfully');
      } else {
        // Create new product (POST)
        response = await fetch(`${getApiUrl('api')}/products`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            accept: '*/*',
          },
          body: JSON.stringify(productPayload),
        });

        if (!response.ok) {
          throw new Error('Failed to create product');
        }

        toast.success('Product created successfully');
      }

      setShowModal(false);
      // Reset form

      // Refresh product list
      fetchProducts();
      setFormData({
        productCategory: '',
        channelIds: [],
        productName: '',
        productStatus: 'active',
        webLink: '',
        applicationId: '',
        productDescription: '',
        reasons: ['', '', '', '', ''],
        videos: [],
        videoUrl: '',
        youtubeTitle: '',
        images: [],
        documents: [],
        fileCategory: '',
        fileType: 'PDF',
        language: 'English',
      });
      setUploadedFiles({
        videos: [],
        images: [],
        documents: [],
      });
    } catch (error) {
      console.error(
        selectedProduct ? 'Error updating product:' : 'Error creating product:',
        error
      );
      toast.error(
        error instanceof Error
          ? error.message
          : selectedProduct
            ? 'Failed to update product'
            : 'Failed to create product'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = async (product: APIProduct) => {
    try {
      setLoading(true);
      setSelectedProduct(product);
      setCurrentStage(1); // Reset to first step

      console.log('Editing product:', product);

      // Initialize uploadedFiles with existing media from the product
      const existingVideos = product.media.videos.map(video => {
        console.log('Processing video:', video);
        return {
          title: video.title,
          url:
            Array.isArray(video.s3Links) && video.s3Links.length > 0
              ? video.s3Links[0]
              : video.youtubeUrl || '',
        };
      });

      const existingImages = product.media.images.map(image => ({
        title: image.title,
        url: image.s3Link,
      }));

      const existingDocuments = product.files.map(file => {
        console.log('Processing document file:', file);
        console.log('Original categoryId:', file.categoryId);
        console.log(
          'Extracted categoryId:',
          extractCategoryId(file.categoryId)
        );

        return {
          title: file.brochureName,
          url: file.s3Link,
        };
      });

      // Set uploaded files state with existing media
      setUploadedFiles({
        videos: existingVideos,
        images: existingImages,
        documents: existingDocuments,
      });

      // Set form data
      setFormData({
        productCategory: product.productCategoryId,
        channelIds: product.channelIds,
        productName: product.productName,
        productStatus: product.status,
        webLink: product.webLink,
        applicationId: product.applicationId,
        productDescription: product.productDescription,
        reasons: [
          product.reasonsToBuy.reason1,
          product.reasonsToBuy.reason2,
          product.reasonsToBuy.reason3,
          product.reasonsToBuy.reason4,
          product.reasonsToBuy.reason5,
        ],
        videos: [], // New videos to upload
        // Find YouTube video if it exists
        videoUrl:
          product.media.videos.find(v => v.youtubeUrl)?.youtubeUrl || '',
        youtubeTitle: product.media.videos.find(v => v.youtubeUrl)?.title || '',
        images: [], // New images to upload
        documents: [], // New documents to upload
        fileCategory:
          product.files && product.files.length > 0
            ? extractCategoryId(product.files[0]?.categoryId)
            : '',
        fileType: product.files[0]?.fileType || 'PDF',
        language: product.files[0]?.language || 'English',
      });

      setShowModal(true);
    } catch (error) {
      console.error('Error fetching product details:', error);
      toast.error('Failed to fetch product details');
    } finally {
      setLoading(false);
    }
  };

  const renderFileUploadSection = (
    type: 'videos' | 'images' | 'documents',
    title: string
  ) => {
    const files = formData[type];
    const maxSize =
      type === 'videos' ? '100MB' : type === 'images' ? '10MB' : '50MB';
    const acceptedTypes =
      type === 'videos'
        ? SUPPORTED_FILE_TYPES.VIDEO
        : type === 'images'
          ? SUPPORTED_FILE_TYPES.IMAGE
          : SUPPORTED_FILE_TYPES.DOCUMENT;

    return (
      <div className='space-y-6'>
        <h4 className='text-sm font-medium text-gray-900'>{title}</h4>

        <div className='border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50'>
          <div className='flex flex-col items-center'>
            <div
              className={`w-16 h-16 mb-4 bg-${getColorClasses('bg')} rounded-lg flex items-center justify-center`}
            >
              <Upload
                className={`h-8 w-8 text-${getColorClasses('primary')}`}
              />
            </div>
            <p className='text-sm text-gray-500 mb-2'>
              Max size per file: {maxSize}
            </p>
            <p className='text-sm text-gray-500 mb-4'>
              Supported formats: {acceptedTypes.join(', ')}
            </p>
            <input
              type='file'
              accept={acceptedTypes.join(',')}
              onChange={e => handleFileChange(e, type)}
              className='hidden'
              id={`${type}-upload`}
              multiple
            />
            <button
              type='button'
              className={`mt-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-${getColorClasses('primary')} hover:bg-${getColorClasses('hover')} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${getColorClasses('primary')} cursor-pointer transition-colors duration-200`}
              onClick={() => document.getElementById(`${type}-upload`)?.click()}
            >
              Choose File
            </button>
          </div>
        </div>

        {files.length > 0 && (
          <div className='space-y-4'>
            <h5 className='text-sm font-medium text-gray-700'>
              Selected Files
            </h5>
            {files.map((file, index) => (
              <div
                key={index}
                className='flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200'
              >
                <div className='flex-1'>
                  <Input
                    placeholder='Enter file title'
                    value={file.title}
                    onChange={e =>
                      handleFileTitleChange(type, index, e.target.value)
                    }
                    required
                    className='bg-white'
                  />
                  <p className='mt-1 text-sm text-gray-500'>{file.file.name}</p>
                </div>
                <div className='flex gap-2'>
                  <Button
                    type='button'
                    size='sm'
                    variant='default'
                    onClick={() => uploadSingleFile(type, index)}
                    disabled={fileUploading[type][index] || !file.title}
                    className={`bg-${getColorClasses('primary')} hover:bg-${getColorClasses('hover')} text-white`}
                  >
                    {fileUploading[type][index] ? (
                      <Loader2 className='h-4 w-4 animate-spin mr-1' />
                    ) : null}
                    Upload
                  </Button>
                  <Button
                    type='button'
                    size='sm'
                    variant='outline'
                    onClick={() => handleDeleteFile(type, index)}
                    className={`text-${getColorClasses('primary')} hover:text-${getColorClasses('hover')} border-${getColorClasses('primary')} hover:bg-${getColorClasses('bg')}`}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {uploadedFiles[type].length > 0 && (
          <div className='mt-4 space-y-4'>
            <h5 className='text-sm font-medium text-gray-700'>
              Uploaded Files
            </h5>
            {uploadedFiles[type].map((file, index) => (
              <div
                key={index}
                className='flex items-start gap-4 p-4 bg-green-50 rounded-lg border border-green-200'
              >
                <div className='flex-1'>
                  <p className='font-medium text-green-800'>{file.title}</p>
                  <p className='mt-1 text-sm text-green-600 break-all'>
                    {file.url}
                  </p>
                </div>
                <Button
                  type='button'
                  size='sm'
                  variant='outline'
                  onClick={() => {
                    setUploadedFiles(prev => ({
                      ...prev,
                      [type]: prev[type].filter((_, i) => i !== index),
                    }));
                  }}
                  className={`text-${getColorClasses('primary')} hover:text-${getColorClasses('hover')} border-${getColorClasses('primary')} hover:bg-${getColorClasses('bg')}`}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderStageContent = () => {
    switch (currentStage) {
      case 1: {
        return (
          <div className='space-y-6'>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Product Category
                </label>
                <select
                  name='productCategory'
                  value={formData.productCategory}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-${getColorClasses('primary')} focus:border-${getColorClasses('primary')} sm:text-sm rounded-md bg-gray-50`}
                  required
                >
                  <option value=''>Select category</option>
                  {categories.map(category => (
                    <option key={category._id} value={category._id}>
                      {category.categoryName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Product Status
                </label>
                <select
                  name='productStatus'
                  value={formData.productStatus}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-${getColorClasses('primary')} focus:border-${getColorClasses('primary')} sm:text-sm rounded-md bg-gray-50`}
                  required
                >
                  <option value='active'>Active</option>
                  <option value='inactive'>Inactive</option>
                </select>
              </div>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <Input
                label='Product Name'
                name='productName'
                value={formData.productName}
                onChange={handleInputChange}
                placeholder='Enter product name'
                required
                fullWidth
                className='bg-gray-50'
              />

              <Input
                label='Application ID'
                name='applicationId'
                value={formData.applicationId}
                onChange={handleInputChange}
                placeholder='Enter application ID'
                required
                fullWidth
                className='bg-gray-50'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Web Link
              </label>
              <Input
                name='webLink'
                value={formData.webLink}
                onChange={handleInputChange}
                placeholder='Enter web link'
                fullWidth
                className='bg-gray-50'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Product Description
              </label>
              <textarea
                name='productDescription'
                value={formData.productDescription}
                onChange={handleInputChange}
                rows={4}
                className='mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md bg-gray-50'
                placeholder='Enter product description'
                required
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Select Channels
              </label>
              <div className='mt-2 space-y-2 max-h-32 overflow-y-auto border border-gray-300 rounded-md p-3 bg-gray-50'>
                {channels.map(channel => (
                  <div key={channel.id} className='flex items-center'>
                    <input
                      type='checkbox'
                      id={`channel-${channel.id}`}
                      name='channelIds'
                      value={channel.id}
                      checked={formData.channelIds.includes(channel.id)}
                      onChange={e => {
                        const value = e.target.value;
                        setFormData(prev => ({
                          ...prev,
                          channelIds: e.target.checked
                            ? [...prev.channelIds, value]
                            : prev.channelIds.filter(id => id !== value),
                        }));
                      }}
                      className={`h-4 w-4 text-${getColorClasses('primary')} focus:ring-${getColorClasses('primary')} border-gray-300 rounded`}
                    />
                    <label
                      htmlFor={`channel-${channel.id}`}
                      className='ml-2 block text-sm text-gray-900'
                    >
                      {channel.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Reasons to Buy (Top 5)
              </label>
              <div className='space-y-2'>
                {formData.reasons.map((reason, index) => (
                  <Input
                    key={index}
                    value={reason}
                    onChange={e => handleReasonChange(index, e.target.value)}
                    placeholder={`Reason ${index + 1}`}
                    fullWidth
                    className='bg-gray-50'
                  />
                ))}
              </div>
            </div>
          </div>
        );
      }
      case 2: {
        return (
          <div className='space-y-8'>
            <div className='space-y-6'>
              <h4 className='text-sm font-medium text-gray-900'>
                Upload Video
              </h4>
              {formData.videoUrl && (
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    YouTube Video Title
                  </label>
                  <Input
                    name='youtubeTitle'
                    value={formData.youtubeTitle || ''}
                    onChange={handleInputChange}
                    placeholder='Enter title for YouTube video'
                    required={!!formData.videoUrl}
                    className='bg-gray-50'
                  />
                </div>
              )}

              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                {renderFileUploadSection('videos', 'Upload Video')}

                <div className='space-y-4'>
                  <p className='text-sm font-medium text-gray-900'>
                    Add Youtube URL
                  </p>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Video URL
                    </label>
                    <Input
                      name='videoUrl'
                      value={formData.videoUrl}
                      onChange={handleInputChange}
                      placeholder='Enter YouTube URL here'
                      className='bg-gray-50'
                    />
                  </div>
                </div>
              </div>
            </div>

            {renderFileUploadSection('images', 'Upload Product Image')}
          </div>
        );
      }
      case 3: {
        return (
          <div className='space-y-6'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Files upload categories:
              </label>
              <select
                name='fileCategory'
                value={formData.fileCategory}
                onChange={handleInputChange}
                className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-${getColorClasses('primary')} focus:border-${getColorClasses('primary')} sm:text-sm rounded-md bg-gray-50`}
              >
                <option value=''>Select category</option>
                {categories.map(category => (
                  <option key={category._id} value={category._id}>
                    {category.categoryName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Select File Type:
              </label>
              <select
                name='fileType'
                value={formData.fileType}
                onChange={handleInputChange}
                className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-${getColorClasses('primary')} focus:border-${getColorClasses('primary')} sm:text-sm rounded-md bg-gray-50`}
              >
                <option value='PDF'>PDF</option>
                <option value='DOC'>DOC</option>
                <option value='DOCX'>DOCX</option>
                <option value='XLS'>XLS</option>
                <option value='XLSX'>XLSX</option>
                <option value='PPT'>PPT</option>
                <option value='PPTX'>PPTX</option>
                <option value='TXT'>TXT</option>
                <option value='CSV'>CSV</option>
                <option value='RTF'>RTF</option>
              </select>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Select Language:
              </label>
              <select
                name='language'
                value={formData.language}
                onChange={handleInputChange}
                className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-${getColorClasses('primary')} focus:border-${getColorClasses('primary')} sm:text-sm rounded-md bg-gray-50`}
              >
                <option value='English'>English</option>
                <option value='Spanish'>Spanish</option>
                <option value='French'>French</option>
                <option value='German'>German</option>
              </select>
            </div>

            {renderFileUploadSection('documents', 'Upload Brochure')}
          </div>
        );
      }
      default:
        return null;
    }
  };

  return (
    <div className='space-y-6'>
      {/* Header with search and button */}
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold text-gray-900'>Product Management</h1>

        <div className='flex items-center space-x-3'>
          {/* Search moved next to button */}
          <div className='relative w-64'>
            <Input
              type='text'
              placeholder='Search products...'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              leftIcon={<Search className='h-4 w-4 text-gray-400' />}
              fullWidth
              className='bg-gray-50 border-gray-200'
            />
          </div>

          <div>
            <select
              value={selectedChannel}
              onChange={e => setSelectedChannel(e.target.value)}
              className='mt-1 block w-40 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md bg-gray-50'
            >
              <option value='All'>All Channels</option>
              {channels.map(channel => (
                <option key={channel.id} value={channel.code}>
                  {channel.name}
                </option>
              ))}
            </select>
          </div>

          <Button
            onClick={() => {
              setSelectedProduct(null);
              setCurrentStage(1);
              setFormData({
                productCategory: '',
                channelIds: [],
                productName: '',
                productStatus: 'active',
                webLink: '',
                applicationId: '',
                productDescription: '',
                reasons: ['', '', '', '', ''],
                videos: [],
                videoUrl: '',
                youtubeTitle: '',
                images: [],
                documents: [],
                fileCategory: '',
                fileType: 'PDF',
                language: 'English',
              });
              setShowModal(true);
            }}
            leftIcon={<Plus className='h-4 w-4' />}
            className={`bg-${getColorClasses('primary')} hover:bg-${getColorClasses('hover')} text-white`}
          >
            NEW PRODUCT
          </Button>
        </div>
      </div>

      {/* Product List Table */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200 table-fixed'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='w-1/6 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Category
                </th>
                <th className='w-1/6 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Channel
                </th>
                <th className='w-1/4 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Product Name
                </th>
                <th className='w-1/6 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Created Date
                </th>
                <th className='w-1/6 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
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
                    colSpan={6}
                    className='px-6 py-4 text-center text-sm text-gray-500'
                  >
                    <div className='flex items-center justify-center space-x-2'>
                      <Loader2 className='h-5 w-5 animate-spin' />
                      <span>Loading products...</span>
                    </div>
                  </td>
                </tr>
              ) : productData.products.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className='px-6 py-4 text-center text-sm text-gray-500'
                  >
                    No products found
                  </td>
                </tr>
              ) : (
                productData.products.map(product => (
                  <tr key={product._id} className='hover:bg-gray-50'>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 truncate'>
                      {product.productCategoryName}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 truncate'>
                      <div className='flex flex-wrap gap-1'>
                        {product.channelNames.map(ch => (
                          <span
                            key={ch}
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${getColorClasses('bg')} text-${getColorClasses('primary')}`}
                          >
                            {ch}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 truncate'>
                      {product.productName}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 truncate'>
                      {new Date(product.createdAt).toLocaleDateString()}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 truncate'>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          product.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {product.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-center text-sm font-medium'>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => handleEditProduct(product)}
                        className={`text-${getColorClasses('primary')} hover:text-${getColorClasses('hover')} hover:bg-${getColorClasses('bg')}`}
                      >
                        <Edit2 className='h-4 w-4 mr-1' />
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {productData.products.length > 0 && (
        <div className='mt-4'>
          <Pagination
            currentPage={productData.pagination.page}
            totalPages={productData.pagination.pages}
            onPageChange={setCurrentPage}
            totalItems={productData.pagination.total}
            showingFrom={
              (productData.pagination.page - 1) * productData.pagination.limit +
              1
            }
            showingTo={Math.min(
              productData.pagination.page * productData.pagination.limit,
              productData.pagination.total
            )}
          />
        </div>
      )}

      {/* Create/Edit Product Drawer */}
      {showModal && (
        <Drawer
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={selectedProduct ? 'Edit Product' : 'Create New Product'}
          currentStage={currentStage}
          footer={
            <div className='flex justify-between'>
              <Button
                type='button'
                variant='outline'
                onClick={() => {
                  if (currentStage > 1) {
                    setCurrentStage(prev => prev - 1);
                  } else {
                    setShowModal(false);
                  }
                }}
                className='border-gray-300 text-gray-700 hover:bg-gray-50'
              >
                {currentStage === 1 ? 'Cancel' : 'Previous'}
              </Button>
              <Button
                type='button'
                variant='default'
                onClick={() => {
                  if (currentStage < totalStages) {
                    setCurrentStage(prev => prev + 1);
                  } else {
                    // Only submit the form when on the final stage
                    // Use a custom event object with preventDefault method
                    handleSubmit({
                      preventDefault: () => {},
                    } as React.FormEvent);
                  }
                }}
                disabled={loading}
                className={`bg-${getColorClasses('primary')} hover:bg-${getColorClasses('hover')} text-white`}
              >
                {currentStage === totalStages
                  ? loading
                    ? selectedProduct
                      ? 'Updating...'
                      : 'Creating...'
                    : selectedProduct
                      ? 'Update Product'
                      : 'Create Product'
                  : 'Next'}
              </Button>
            </div>
          }
        >
          <div className='flex flex-col h-full'>
            {/* Scrollable Content */}
            <div className='flex-1 px-6 py-4 overflow-y-auto'>
              {renderStageContent()}
            </div>
          </div>
        </Drawer>
      )}
    </div>
  );
};

export default CreateProduct;
