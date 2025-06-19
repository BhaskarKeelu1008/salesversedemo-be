import {
  ArrowLeft,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Download,
  Eye,
  FileText,
  User,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import Logo from '../../../components/ui/Logo';
import { useTheme } from '../../../context/ThemeContext';
import ImagePreviewModal from '../components/ImagePreviewModal';
import {
  AobApplication,
  approveApplicationToQC,
  fetchAobApplicationById,
} from '../services/aobApplicationService';

// Simple Accordion
const AccordionSection: React.FC<{
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}> = ({ title, icon, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  const { getColorClasses } = useTheme();
  return (
    <div className='border-b last:border-b-0'>
      <button
        className={`w-full flex items-center justify-between px-4 py-3 text-left font-semibold focus:outline-none bg-${getColorClasses('primary')} text-white`}
        onClick={() => setOpen(v => !v)}
      >
        <span className='flex items-center gap-2'>
          {icon}
          {title}
        </span>
        {open ? (
          <ChevronUp className='h-5 w-5' />
        ) : (
          <ChevronDown className='h-5 w-5' />
        )}
      </button>
      {open && (
        <div className='px-4 py-6 bg-white text-gray-900'>{children}</div>
      )}
    </div>
  );
};

const QCDiscrepancyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getColorClasses } = useTheme();
  const [application, setApplication] = useState<AobApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const selectedItem = useSelector(
    (state: any) => state.qcDiscrepancy.selectedItem
  );

  // Approve to QC state
  const [approving, setApproving] = useState(false);
  const [approveError, setApproveError] = useState<string | null>(null);

  // Image preview modal state
  const [imageModal, setImageModal] = useState<{
    isOpen: boolean;
    fileUrl: string;
    fileName: string;
    fileFormat: string;
  }>({
    isOpen: false,
    fileUrl: '',
    fileName: '',
    fileFormat: '',
  });

  useEffect(() => {
    if (id) {
      // Check if we have Redux state and it matches the current ID (navigation from listing)
      if (selectedItem) {
        setApplication(selectedItem);
        setLoading(false);
        fetchAobApplicationById(id)
          .then(data => setApplication(data))
          .catch(() => {
            // Background fetch failed
          });
      } else {
        // No Redux state or mismatch - fresh page load, fetch from API
        setLoading(true);
        setError(null);
        fetchAobApplicationById(id)
          .then(data => setApplication(data))
          .catch(err => setError(err.message || 'Failed to load application'))
          .finally(() => setLoading(false));
      }
    }
  }, [id, selectedItem]);

  // Mock documents if not present
  const documents = application?.documents;

  const handleApproveToQC = async () => {
    if (!application?.applicationId) {
      setApproveError('Application ID not found');
      return;
    }

    setApproving(true);
    setApproveError(null);

    try {
      await approveApplicationToQC(application.applicationId, 'approved', '');

      // Update local state to reflect the change
      setApplication(prev =>
        prev
          ? {
              ...prev,
              applicationStatus: 'approved',
              status: 'approved',
            }
          : null
      );

      // Show success toast message
      toast.success('Application approved successfully!');
    } catch (error: any) {
      setApproveError(error.message || 'Failed to approve application');
      toast.error('Failed to approve application');
    } finally {
      setApproving(false);
    }
  };

  if (loading) return <div className='p-8 text-center'>Loading...</div>;
  if (error) return <div className='p-8 text-center text-red-500'>{error}</div>;
  if (!application)
    return <div className='p-8 text-center'>No application found.</div>;

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Main App/Header Bar */}
      <div className='w-full bg-white shadow-sm px-8 py-4 flex items-center'>
        <Logo size='md' withText />
      </div>
      {/* Card wrapper for QC header and content */}
      <div className='max-w-6xl mx-auto mt-6 rounded-xl shadow bg-white overflow-hidden'>
        {/* QC Header (transparent) */}
        <div
          className={`flex flex-col md:flex-row items-start md:items-center justify-between px-8 pt-8 pb-4 bg-transparent text-black rounded-xl`}
        >
          <div className='flex items-center gap-3 mb-2 md:mb-0'>
            <button
              onClick={() => navigate(-1)}
              className='p-2 rounded hover:bg-gray-200'
            >
              <ArrowLeft className='h-5 w-5 text-black' />
            </button>
            <div>
              <div className='flex items-center gap-2'>
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${application.applicationStatus === 'qcPending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}
                >
                  {application.applicationStatus || application.status}
                </span>
                <span className='text-xs text-gray-800 ml-2'>
                  Submitted on{' '}
                  {new Date(application.createdAt).toLocaleString()}
                </span>
              </div>
              <div className='font-bold text-xl text-black'>
                {application.firstName
                  ? `${application.firstName}'s Application`
                  : 'Application'}
              </div>
              <div className='text-xs text-gray-800'>
                Application ID:{' '}
                <span className='text-black font-medium'>
                  {application.applicationId}
                </span>
              </div>
            </div>
          </div>
          <div className='flex gap-2 mt-2 md:mt-0'>
            {application.applicationStatus !== 'approved' &&
              application.status !== 'approved' && (
                <>
                  <button
                    className={`px-4 py-2 rounded font-semibold border transition-colors ${
                      approving
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-100 text-black border-gray-300 hover:bg-gray-200'
                    }`}
                    onClick={handleApproveToQC}
                    disabled={approving}
                  >
                    {approving ? 'Approving...' : 'Approve to QC'}
                  </button>
                  <button
                    className={`px-4 py-2 rounded bg-${getColorClasses('primary')} text-white font-semibold hover:opacity-90 transition-opacity`}
                  >
                    Raise Discrepancy
                  </button>
                </>
              )}
          </div>
          {approveError && (
            <div className='text-red-500 text-sm mt-2'>{approveError}</div>
          )}
        </div>
        {/* Main 2-column grid */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 px-8 py-6 bg-white'>
          {/* Left side: Accordions */}
          <div className='md:col-span-2 flex flex-col gap-6'>
            {/* Basic Information Accordion */}
            <AccordionSection
              title='Basic Information'
              icon={<User className='h-4 w-4' />}
              defaultOpen
            >
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <div className='text-xs text-gray-500'>Applicant Name</div>
                  <div className='font-medium'>
                    {[
                      application.firstName,
                      application.middleName,
                      application.lastName,
                    ]
                      .filter(Boolean)
                      .join(' ') || '-'}
                  </div>
                </div>
                <div>
                  <div className='text-xs text-gray-500'>Application ID</div>
                  <div className='font-medium'>
                    {application.applicationId || '-'}
                  </div>
                </div>
                <div>
                  <div className='text-xs text-gray-500'>Email</div>
                  <div className='font-medium'>
                    {application.emailAddress || '-'}
                  </div>
                </div>
                <div>
                  <div className='text-xs text-gray-500'>Mobile</div>
                  <div className='font-medium'>
                    {application.mobileNumber || '-'}
                  </div>
                </div>
                <div>
                  <div className='text-xs text-gray-500'>Address</div>
                  <div className='font-medium'>
                    {application.address || '-'}
                  </div>
                </div>
                <div>
                  <div className='text-xs text-gray-500'>Status</div>
                  <div className='font-medium'>
                    {application.applicationStatus || application.status || '-'}
                  </div>
                </div>
                <div>
                  <div className='text-xs text-gray-500'>Created At</div>
                  <div className='font-medium'>
                    {application.createdAt
                      ? new Date(application.createdAt).toLocaleString()
                      : '-'}
                  </div>
                </div>
                <div>
                  <div className='text-xs text-gray-500'>Updated At</div>
                  <div className='font-medium'>
                    {application.updatedAt
                      ? new Date(application.updatedAt).toLocaleString()
                      : '-'}
                  </div>
                </div>
              </div>
            </AccordionSection>

            {/* Personal Information Accordion */}
            <AccordionSection
              title='Personal Information'
              icon={<User className='h-4 w-4' />}
              defaultOpen
            >
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <div className='text-xs text-gray-500'>
                    Passed Life Insurance Exam
                  </div>
                  <div className='font-medium'>
                    {application.passedLifeInsuranceExam === true
                      ? 'Yes'
                      : application.passedLifeInsuranceExam === false
                        ? 'No'
                        : '-'}
                  </div>
                </div>
                <div>
                  <div className='text-xs text-gray-500'>
                    Has Life Insurance Company
                  </div>
                  <div className='font-medium'>
                    {application.hasLifeInsuranceCompany === true
                      ? 'Yes'
                      : application.hasLifeInsuranceCompany === false
                        ? 'No'
                        : '-'}
                  </div>
                </div>
                <div>
                  <div className='text-xs text-gray-500'>
                    Has Non-Life Insurance Company
                  </div>
                  <div className='font-medium'>
                    {application.hasNonLifeInsuranceCompany === true
                      ? 'Yes'
                      : application.hasNonLifeInsuranceCompany === false
                        ? 'No'
                        : '-'}
                  </div>
                </div>
                <div>
                  <div className='text-xs text-gray-500'>
                    Has Variable Insurance Company
                  </div>
                  <div className='font-medium'>
                    {application.hasVariableInsuranceCompany === true
                      ? 'Yes'
                      : application.hasVariableInsuranceCompany === false
                        ? 'No'
                        : '-'}
                  </div>
                </div>
                <div>
                  <div className='text-xs text-gray-500'>
                    Related To Employee
                  </div>
                  <div className='font-medium'>
                    {application.relatedToEmployee === true
                      ? 'Yes'
                      : application.relatedToEmployee === false
                        ? 'No'
                        : '-'}
                  </div>
                </div>
                <div>
                  <div className='text-xs text-gray-500'>
                    Has Life Insurance Company Name
                  </div>
                  <div className='font-medium'>
                    {application.hasLifeInsuranceCompanyName || '-'}
                  </div>
                </div>
                <div>
                  <div className='text-xs text-gray-500'>
                    Has Non-Life Insurance Company Name
                  </div>
                  <div className='font-medium'>
                    {application.hasNonLifeInsuranceCompanyName || '-'}
                  </div>
                </div>
                <div>
                  <div className='text-xs text-gray-500'>
                    Has Variable Insurance Company Name
                  </div>
                  <div className='font-medium'>
                    {application.hasVariableInsuranceCompanyName || '-'}
                  </div>
                </div>
                <div>
                  <div className='text-xs text-gray-500'>
                    Passed Life Insurance Exam Date Of Exam
                  </div>
                  <div className='font-medium'>
                    {application.passedLifeInsuranceExamDateOfExam || '-'}
                  </div>
                </div>
                <div>
                  <div className='text-xs text-gray-500'>
                    Passed Life Insurance Exam Rating
                  </div>
                  <div className='font-medium'>
                    {application.passedLifeInsuranceExamRating || '-'}
                  </div>
                </div>
                <div>
                  <div className='text-xs text-gray-500'>
                    Passed Life Insurance Exam Venue Of Exam
                  </div>
                  <div className='font-medium'>
                    {application.passedLifeInsuranceExamVenueOfExam || '-'}
                  </div>
                </div>
                <div>
                  <div className='text-xs text-gray-500'>Reject Remark</div>
                  <div className='font-medium'>
                    {application.rejectRemark || '-'}
                  </div>
                </div>
              </div>
            </AccordionSection>

            {/* Documents Accordion */}
            <AccordionSection
              title='Documents'
              icon={<FileText className='h-4 w-4' />}
              defaultOpen
            >
              {!documents || documents.length === 0 ? (
                <div className='text-center py-8 text-gray-500'>
                  <FileText className='h-12 w-12 mx-auto mb-4 text-gray-300' />
                  <p>No documents uploaded for this application</p>
                </div>
              ) : (
                <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
                  {documents.map((doc, index) => {
                    // Document processed
                    return (
                      <div
                        key={doc._id || index}
                        className='bg-gray-50 rounded p-2 flex flex-col items-center border'
                      >
                        <div className='flex items-center gap-2 mb-2 w-full justify-between'>
                          <span className='font-medium text-xs truncate'>
                            {doc.documentType || 'Unknown Document'}
                          </span>
                          <span className='bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded'>
                            {doc.documentStatus || 'uploaded'}
                          </span>
                        </div>
                        {doc.presignedS3Url &&
                        ['jpg', 'jpeg', 'png'].includes(
                          (doc.documentFormat || '').toLowerCase()
                        ) ? (
                          <img
                            src={doc.presignedS3Url}
                            alt={doc.documentName || doc.documentType}
                            className='rounded border w-full object-contain mb-2 cursor-pointer hover:opacity-80 transition-opacity'
                            style={{ maxHeight: 100 }}
                            onClick={() =>
                              setImageModal({
                                isOpen: true,
                                fileUrl: doc.presignedS3Url,
                                fileName:
                                  doc.documentName ||
                                  doc.documentType ||
                                  'Document',
                                fileFormat: doc.documentFormat || '',
                              })
                            }
                            onError={e => {
                              // Image failed to load
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <FileText className='h-12 w-12 text-gray-400 mb-2' />
                        )}
                        <div className='flex gap-2 mt-auto'>
                          <button
                            onClick={() =>
                              setImageModal({
                                isOpen: true,
                                fileUrl: doc.presignedS3Url,
                                fileName:
                                  doc.documentName ||
                                  doc.documentType ||
                                  'Document',
                                fileFormat: doc.documentFormat || '',
                              })
                            }
                            className='text-blue-600 hover:underline text-xs flex items-center gap-1'
                            disabled={!doc.presignedS3Url}
                          >
                            <Eye className='h-4 w-4' />
                            View
                          </button>
                          <a
                            href={doc.presignedS3Url}
                            download
                            className={`text-xs flex items-center gap-1 ${
                              doc.presignedS3Url
                                ? 'text-blue-600 hover:underline'
                                : 'text-gray-400 cursor-not-allowed'
                            }`}
                            onClick={e => {
                              if (!doc.presignedS3Url) {
                                e.preventDefault();
                                // No download URL available for document
                              }
                            }}
                          >
                            <Download className='h-4 w-4' />
                            Download
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </AccordionSection>
          </div>

          {/* Right side: QC Issues */}
          <div className='shadow p-0 md:col-span-1 bg-transparent text-black rounded-lg flex flex-col items-center'>
            <div className='font-semibold text-lg w-full px-4 py-3'>
              QC Issues
            </div>
            <div className='flex flex-col items-center p-4'>
              <CheckCircle className='h-12 w-12 text-black mb-2' />
              <div className='font-semibold'>No Quality Issues Found</div>
              <div className='text-xs text-black/80 text-center'>
                This application has passed all quality checks and has no
                reported issues.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      <ImagePreviewModal
        isOpen={imageModal.isOpen}
        onClose={() =>
          setImageModal({
            isOpen: false,
            fileUrl: '',
            fileName: '',
            fileFormat: '',
          })
        }
        fileUrl={imageModal.fileUrl}
        fileName={imageModal.fileName}
        fileFormat={imageModal.fileFormat}
      />
    </div>
  );
};

export default QCDiscrepancyDetailPage;
