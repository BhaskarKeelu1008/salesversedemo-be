import { getApiUrl } from '../config';
import { PaginatedResponse, PaginationParams } from '../types';
import { paginateData } from './paginationUtils';

export interface Role {
  id: string;
  name: string;
  code: string;
  status: 'active' | 'inactive';
  channelId: string;
  channelName: string;
  channelCode: string;
  createdAt: string;
  updatedAt: string;
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

export const getRoles = async (
  search?: string,
  pagination?: PaginationParams
): Promise<PaginatedResponse<Role>> => {
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

  const response = await fetch(`${API_URL}/roles${queryString}`, {
    method: 'GET',
    headers: defaultHeaders,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to fetch roles');
  }

  const responseData = await response.json();
  let roles = responseData.data.roles.map((role: any) => ({
    id: role._id,
    name: role.roleName,
    code: role.roleCode,
    status: role.status,
    channelId: role.channel._id,
    channelName: role.channel.channelName,
    channelCode: role.channel.channelCode,
    createdAt: role.createdAt,
    updatedAt: role.updatedAt,
  }));

  // If API doesn't support search, filter locally
  if (search && !queryParams.has('search')) {
    const searchLower = search.toLowerCase();
    roles = roles.filter(
      (role: Role) =>
        role.name.toLowerCase().includes(searchLower) ||
        role.code.toLowerCase().includes(searchLower) ||
        role.channelName.toLowerCase().includes(searchLower)
    );
  }

  // If API doesn't support pagination, paginate locally
  if (pagination && !queryParams.has('page')) {
    return paginateData(roles, pagination);
  }

  return {
    data: roles,
    pagination: responseData.data.pagination || {
      currentPage: 1,
      totalPages: 1,
      totalItems: roles.length,
      itemsPerPage: roles.length,
      showingFrom: 1,
      showingTo: roles.length,
    },
  };
};

export const createRole = async (
  channelId: string,
  name: string,
  code: string
): Promise<Role> => {
  const response = await fetch(`${API_URL}/roles`, {
    method: 'POST',
    headers: defaultHeaders,
    body: JSON.stringify({
      roleName: name,
      roleCode: code,
      status: 'active',
      channelId: channelId,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to create role');
  }

  const { data } = await response.json();

  // Get channel details
  const channelResponse = await fetch(
    `${API_URL}/channels/${data.channel._id}`,
    {
      method: 'GET',
      headers: defaultHeaders,
    }
  );

  if (!channelResponse.ok) {
    throw new Error('Failed to fetch channel details');
  }

  const channelData = await channelResponse.json();

  return {
    id: data._id,
    name: data.roleName,
    code: data.roleCode.toString(),
    status: data.status.toLowerCase(),
    channelId: data.channel._id,
    channelName: channelData.data.channelName,
    channelCode: channelData.data.channelCode,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
};

export const updateRoleStatus = async (
  id: string,
  status: 'active' | 'inactive'
): Promise<Role> => {
  const response = await fetch(`${API_URL}/roles/${id}/status`, {
    method: 'PATCH',
    headers: defaultHeaders,
    body: JSON.stringify({
      status: status.charAt(0).toUpperCase() + status.slice(1),
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to update role status');
  }

  const data = await response.json();
  return {
    id: data._id,
    name: data.roleName,
    code: data.roleCode,
    status: data.status,
    channelId: data.channel._id,
    channelName: data.channel.channelName,
    channelCode: data.channel.channelCode,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
};
