import { FileText } from 'lucide-react';
import React from 'react';

interface ImagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string;
  fileName: string;
  fileFormat?: string;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  isOpen,
  onClose,
  fileUrl,
  fileName,
  fileFormat,
}) => {
  if (!isOpen) return null;

  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(
    (fileFormat || '').toLowerCase()
  );
  const isPdf = (fileFormat || '').toLowerCase() === 'pdf';

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75'>
      <div className='relative w-[75vw] max-h-[90vh] bg-white rounded-lg shadow-xl'>
        {/* Header */}
        <div className='flex items-center justify-between p-4 border-b'>
          <div className='flex items-center gap-2'>
            <FileText className='h-5 w-5 text-gray-500' />
            <h3 className='text-lg font-semibold text-gray-900'>{fileName}</h3>
          </div>
          <div className='flex gap-2'>
            <a
              href={fileUrl}
              target='_blank'
              rel='noopener noreferrer'
              className='px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors'
            >
              Open in New Tab
            </a>
            <button
              onClick={onClose}
              className='px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors'
            >
              Close
            </button>
          </div>
        </div>

        {/* Content */}
        <div className='p-4'>
          {isImage ? (
            <img
              src={fileUrl}
              alt={fileName}
              className='max-w-full max-h-[70vh] object-contain rounded'
            />
          ) : isPdf ? (
            <iframe
              src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`}
              title={fileName}
              className='w-full h-[70vh] border rounded'
              frameBorder='0'
            />
          ) : (
            <div className='flex flex-col items-center justify-center h-[70vh] text-gray-500'>
              <FileText className='h-16 w-16 mb-4' />
              <p className='text-lg font-medium'>File Preview Not Available</p>
              <p className='text-sm'>
                This file type cannot be previewed in the browser.
              </p>
              <a
                href={fileUrl}
                download
                className='mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors'
              >
                Download File
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='flex justify-start p-4 border-t'>
          <div className='text-sm text-gray-500'>
            {fileFormat && <span className='uppercase'>{fileFormat}</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImagePreviewModal;
