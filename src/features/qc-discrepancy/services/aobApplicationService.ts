import { getApiUrl } from '../../../config';

export interface AobApplication {
  _id: string;
  applicationId: string;
  applicantName?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  emailAddress?: string;
  mobileNumber?: string;
  address?: string;
  status?: string; // fallback if applicationStatus is not present
  applicationStatus?: string;
  createdAt: string;
  updatedAt?: string;
  documents?: Array<{
    _id: string;
    documentType: string;
    presignedS3Url: string;
    documentName?: string;
    documentStatus?: string;
    documentFormat?: string;
    createdAt?: string;
    updatedAt?: string;
  }>;
  // Additional fields for detail page
  passedLifeInsuranceExam?: boolean;
  hasLifeInsuranceCompany?: boolean;
  hasNonLifeInsuranceCompany?: boolean;
  hasVariableInsuranceCompany?: boolean;
  relatedToEmployee?: boolean;
  hasLifeInsuranceCompanyName?: string;
  hasNonLifeInsuranceCompanyName?: string;
  hasVariableInsuranceCompanyName?: string;
  passedLifeInsuranceExamDateOfExam?: string;
  passedLifeInsuranceExamRating?: string;
  passedLifeInsuranceExamVenueOfExam?: string;
  rejectRemark?: string;
  // ...add more fields as needed
}

export const fetchAobApplications = async (): Promise<AobApplication[]> => {
  const url = getApiUrl('api/aob/application');
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch AOB applications');
  }
  const data = await response.json();
  return data.data || data;
};

// Fetch a single application by applicationId
export const fetchAobApplicationById = async (
  applicationId: string
): Promise<AobApplication> => {
  const url = getApiUrl(
    `api/aob/getApplication?applicationId=${applicationId}`
  );
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch AOB application');
  }
  const data = await response.json();
  return data.data || data;
};

export const approveApplicationToQC = async (
  applicationId: string,
  status: string = 'approved',
  remarks: string = ''
): Promise<any> => {
  try {
    const response = await fetch(
      `https://salesverse-dev-api.inxtuniverse.com/api/aob/application/${applicationId}`,
      {
        method: 'PATCH',
        headers: {
          accept: '*/*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'application',
          status: status,
          remarks: remarks,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error approving application to QC:', error);
    throw error;
  }
};

export const updateApplicationToUnderReview = async (
  applicationId: string,
  remarks: string = 'Application is being reviewed'
): Promise<any> => {
  try {
    const response = await fetch(
      `https://salesverse-dev-api.inxtuniverse.com/api/aob/application/${applicationId}`,
      {
        method: 'PATCH',
        headers: {
          accept: '*/*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'application',
          status: 'underReview',
          remarks: remarks,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating application to under review:', error);
    throw error;
  }
};
