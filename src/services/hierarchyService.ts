import { getApiUrl } from '../config';
import { PaginatedResponse, PaginationParams } from '../types';
import { paginateData } from './paginationUtils';

export interface Hierarchy {
  id: string;
  name: string;
  level: number;
  status: string;
  channelId: string;
  channelName: string;
  createdAt: string;
  updatedAt: string;
}

export interface HierarchyResponse {
  success: boolean;
  message: string;
  data: {
    _id: string;
    hierarchyName: string;
    hierarchyLevelCode: string;
    hierarchyLevel: number;
    hierarchyDescription: string;
    hierarchyOrder: number;
    hierarchyStatus: string;
    isActive: boolean;
    isRoot: boolean;
    hasParent: boolean;
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

export const getHierarchies = async (
  search?: string,
  pagination?: PaginationParams
): Promise<PaginatedResponse<Hierarchy>> => {
  // Build query parameters
  const queryParams = new URLSearchParams();

  if (search) {
    queryParams.append('search', search);
  }

  if (pagination) {
    queryParams.append('page', pagination.page.toString());
    queryParams.append('limit', pagination.limit.toString());
  }

  const queryString = queryParams.toString()
    ? `?${queryParams.toString()}`
    : '';

  const response = await fetch(`${API_URL}/hierarchies${queryString}`, {
    method: 'GET',
    headers: defaultHeaders,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to fetch hierarchies');
  }

  const responseData = await response.json();
  let hierarchies = responseData.data.hierarchies.map((hierarchy: any) => ({
    id: hierarchy._id,
    name: hierarchy.hierarchyName,
    level: hierarchy.hierarchyLevelCode,
    status: hierarchy.hierarchyStatus.toLowerCase(),
    channelId: hierarchy.channelId,
    channelName: hierarchy.channelName || '',
    createdAt: hierarchy.createdAt,
    updatedAt: hierarchy.updatedAt,
  }));

  // If API doesn't support search, filter locally
  if (search && !queryParams.has('search')) {
    const searchLower = search.toLowerCase();
    hierarchies = hierarchies.filter(
      (hierarchy: Hierarchy) =>
        hierarchy.name.toLowerCase().includes(searchLower) ||
        hierarchy.channelName.toLowerCase().includes(searchLower)
    );
  }

  // If API doesn't support pagination, paginate locally
  if (pagination && !queryParams.has('page')) {
    return paginateData(hierarchies, pagination);
  }

  return {
    data: hierarchies,
    pagination: responseData.data.pagination,
  };
};

export const createHierarchy = async (
  channelId: string,
  name: string,
  level: number,
  description: string = '',
  order: number = 0
): Promise<HierarchyResponse> => {
  const response = await fetch(`${API_URL}/hierarchies`, {
    method: 'POST',
    headers: defaultHeaders,
    body: JSON.stringify({
      hierarchyName: name,
      channelId: channelId,
      hierarchyLevelCode: level.toString(),
      hierarchyLevel: 1,
      hierarchyDescription: description,
      hierarchyOrder: order,
      hierarchyStatus: 'active',
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to create hierarchy');
  }

  return await response.json();
};

export const updateHierarchyStatus = async (
  id: string,
  status: 'active' | 'inactive'
): Promise<Hierarchy> => {
  const response = await fetch(`${API_URL}/hierarchies/${id}/status`, {
    method: 'PATCH',
    headers: defaultHeaders,
    body: JSON.stringify({
      status: status.charAt(0).toUpperCase() + status.slice(1),
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to update hierarchy status');
  }

  const { data } = await response.json();

  // Get channel details
  const channelResponse = await fetch(`${API_URL}/channels/${data.channelId}`, {
    method: 'GET',
    headers: defaultHeaders,
  });

  if (!channelResponse.ok) {
    throw new Error('Failed to fetch channel details');
  }

  const channelData = await channelResponse.json();

  return {
    id: data._id,
    name: data.hierarchyName,
    level: data.levelCode,
    status: data.status,
    channelId: data.channelId,
    channelName: channelData.data.channelName,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
};
