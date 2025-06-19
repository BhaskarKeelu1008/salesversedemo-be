import { getApiUrl } from '../config';
import { PaginatedResponse, PaginationParams } from '../types';
import { paginateData } from './paginationUtils';

export interface Designation {
  id: string;
  channelId: string;
  channelName: string;
  hierarchyId: string;
  hierarchyName: string;
  roleId: string;
  roleName: string;
  name: string;
  code: string;
  order: number;
  description: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface DesignationResponse {
  success: boolean;
  message: string;
  data: {
    _id: string;
    channel: string;
    role: string;
    hierarchy: string;
    designationName: string;
    designationCode: string;
    designationStatus: string;
    designationDescription: string;
    designationOrder: number;
    createdAt: string;
    updatedAt: string;
  };
  timestamp: string;
}

const API_URL = getApiUrl('api');

const defaultHeaders = {
  Accept: '*/*',
  'Accept-Language': 'en-US,en;q=0.9,ta;q=0.8',
  Connection: 'keep-alive',
  'Content-Type': 'application/json',
  DNT: '1',
  Origin: 'http://localhost:5173',
  Referer: 'http://localhost:5173/',
  'Sec-Fetch-Dest': 'empty',
  'Sec-Fetch-Mode': 'cors',
  'Sec-Fetch-Site': 'same-site',
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
  'sec-ch-ua':
    '"Chromium";v="136", "Google Chrome";v="136", "Not.A/Brand";v="99"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"Windows"',
};

export const getDesignations = async (
  filters: {
    channelId?: string;
    hierarchyId?: string;
    roleId?: string;
  } = {},
  pagination?: PaginationParams
): Promise<PaginatedResponse<Designation>> => {
  const response = await fetch(`${API_URL}/designations`, {
    method: 'GET',
    headers: defaultHeaders,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to fetch designations');
  }

  const responseData = await response.json();
  let designations = responseData.data.designations.map((designation: any) => ({
    id: designation._id,
    name: designation.designationName,
    code: designation.designationCode,
    status: designation.designationStatus.toLowerCase(),
    description: designation.designationDescription,
    order: designation.designationOrder,
    channelId: designation.channel?._id || '',
    channelName: designation.channel?.channelName || '',
    hierarchyId: designation.hierarchy?._id || '',
    hierarchyName: designation.hierarchy?.hierarchyName || '',
    roleId: designation.role?._id || '',
    roleName: designation.role?.roleName || '',
    createdAt: designation.createdAt,
    updatedAt: designation.updatedAt,
  }));

  // Apply filters
  if (filters.channelId) {
    designations = designations.filter(
      (d: Designation) => d.channelId === filters.channelId
    );
  }
  if (filters.hierarchyId) {
    designations = designations.filter(
      (d: Designation) => d.hierarchyId === filters.hierarchyId
    );
  }
  if (filters.roleId) {
    designations = designations.filter(
      (d: Designation) => d.roleId === filters.roleId
    );
  }

  if (pagination) {
    return paginateData(designations, pagination);
  }

  return {
    data: designations,
    pagination: responseData.data.pagination,
  };
};

export const createDesignation = async (
  channelId: string,
  hierarchyId: string,
  roleId: string,
  name: string,
  status: 'active' | 'inactive',
  description: string = '',
  order: number = 0,
  code: string = ''
): Promise<DesignationResponse> => {
  const response = await fetch(`${API_URL}/designations`, {
    method: 'POST',
    headers: defaultHeaders,
    body: JSON.stringify({
      channelId,
      roleId,
      hierarchyId,
      designationName: name,
      designationCode: code,
      designationStatus: status,
      designationDescription: description,
      designationOrder: order,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to create designation');
  }

  return await response.json();
};

export const updateDesignationStatus = async (
  id: string,
  status: 'active' | 'inactive'
): Promise<Designation> => {
  const response = await fetch(`${API_URL}/designations/${id}/status`, {
    method: 'PATCH',
    headers: defaultHeaders,
    body: JSON.stringify({
      status: status.charAt(0).toUpperCase() + status.slice(1),
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to update designation status');
  }

  const { data } = await response.json();

  // Get related details
  const [channelResponse, hierarchyResponse, roleResponse] = await Promise.all([
    fetch(`${API_URL}/channels/${data.channelId}`, { headers: defaultHeaders }),
    fetch(`${API_URL}/hierarchies/${data.hierarchyId}`, {
      headers: defaultHeaders,
    }),
    fetch(`${API_URL}/roles/${data.roleId}`, { headers: defaultHeaders }),
  ]);

  if (!channelResponse.ok || !hierarchyResponse.ok || !roleResponse.ok) {
    throw new Error('Failed to fetch related details');
  }

  const [channelData, hierarchyData, roleData] = await Promise.all([
    channelResponse.json(),
    hierarchyResponse.json(),
    roleResponse.json(),
  ]);

  return {
    id: data._id,
    name: data.designationName,
    code: data.designationCode,
    order: data.designationOrder,
    description: data.designationDescription,
    status: data.status.toLowerCase(),
    channelId: data.channelId,
    channelName: channelData.data.channelName,
    hierarchyId: data.hierarchyId,
    hierarchyName: hierarchyData.data.hierarchyName,
    roleId: data.roleId,
    roleName: roleData.data.roleName,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
};

// Validate designation relationships
export const validateDesignationRelationships = async (
  _channelId: string,
  _hierarchyId: string,
  _roleId: string
): Promise<{ valid: boolean; message?: string }> => {
  // For now, return valid true - validation can be implemented later
  return { valid: true };
};
