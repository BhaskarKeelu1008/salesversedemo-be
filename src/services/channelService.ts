import { getApiUrl } from '../config';
import { PaginatedResponse, PaginationParams } from '../types';
import { paginateData } from './paginationUtils';

export interface Channel {
  _id: string;
  id: string;
  name: string;
  code: string;
  status: 'active' | 'inactive';
  projectId?: string;
  projectName?: string;
  projectCode?: string;
  createdAt: string;
  updatedAt: string;
}

// Mock data for channels
export const mockChannels: Channel[] = [
  {
    _id: '1',
    id: '1',
    name: 'Direct Sales',
    code: 'DS',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '2',
    id: '2',
    name: 'Online Sales',
    code: 'OS',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '3',
    id: '3',
    name: 'Partner Sales',
    code: 'PS',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const API_URL = getApiUrl('api');

const defaultHeaders = {
  Accept: '*/*',
  'Accept-Language': 'en-US,en;q=0.9,ta;q=0.8',
  Connection: 'keep-alive',
  'Content-Type': 'application/json',
  DNT: '1',
  Origin: API_URL,
  Referer: API_URL,
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

export const getChannels = async (
  search?: string,
  pagination?: PaginationParams
): Promise<PaginatedResponse<Channel>> => {
  const response = await fetch(`${API_URL}/channels`, {
    method: 'GET',
    headers: defaultHeaders,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to fetch channels');
  }

  const responseData = await response.json();
  let channels = responseData.data.channels.map((channel: any) => ({
    _id: channel._id,
    id: channel._id,
    name: channel.channelName,
    code: channel.channelCode,
    status: channel.channelStatus.toLowerCase(),
    createdAt: channel.createdAt,
    updatedAt: channel.updatedAt,
  }));

  if (search) {
    const searchLower = search.toLowerCase();
    channels = channels.filter(
      (channel: Channel) =>
        channel.name.toLowerCase().includes(searchLower) ||
        channel.code.toLowerCase().includes(searchLower)
    );
  }

  if (pagination) {
    return paginateData(channels, pagination);
  }

  return {
    data: channels,
    pagination: responseData.data.pagination,
  };
};

export const createChannel = async (
  channelData: Partial<Channel>
): Promise<Channel> => {
  const payload: any = {
    channelName: channelData.name,
    channelCode: channelData.code,
    channelStatus: 'active',
  };

  // Only include projectId if it's provided
  if (channelData.projectId) {
    payload.projectId = channelData.projectId;
  }

  const response = await fetch(`${API_URL}/channels`, {
    method: 'POST',
    headers: defaultHeaders,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to create channel');
  }

  const { data } = await response.json();
  return {
    _id: data._id,
    id: data._id,
    name: data.channelName,
    code: data.channelCode,
    status: data.channelStatus.toLowerCase(),
    projectId: data.projectId,
    projectName: data.projectName,
    projectCode: data.projectCode,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
};

export const updateChannel = async (
  channelId: string,
  channelData: Partial<Channel>
): Promise<Channel> => {
  const response = await fetch(`${API_URL}/channels/${channelId}/status`, {
    method: 'PATCH',
    headers: defaultHeaders,
    body: JSON.stringify({
      status: channelData.status
        ? channelData.status.charAt(0).toUpperCase() +
          channelData.status.slice(1)
        : channelData.status,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to update channel status');
  }

  const data = await response.json();
  return {
    _id: data._id,
    id: data._id,
    name: data.channelName,
    code: data.channelCode,
    status: data.status,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
};

export const getActiveChannels = async (): Promise<Channel[]> => {
  const response = await fetch(`${API_URL}/channels/active`, {
    method: 'GET',
    headers: defaultHeaders,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to fetch active channels');
  }

  const data = await response.json();
  return data.data.map((channel: any) => ({
    _id: channel._id,
    id: channel._id,
    name: channel.channelName,
    code: channel.channelCode,
    status: channel.channelStatus.toLowerCase(),
    createdAt: channel.createdAt,
    updatedAt: channel.updatedAt,
  }));
};

export const deleteChannel = async (
  channelId: string,
  reason: string
): Promise<void> => {
  const response = await fetch(`${API_URL}/channels/${channelId}/delete`, {
    method: 'DELETE',
    headers: defaultHeaders,
    body: JSON.stringify({
      reason: reason,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to delete channel');
  }
};

export const deactivateChannel = async (
  channelId: string,
  reason: string
): Promise<void> => {
  const response = await fetch(`${API_URL}/channels/${channelId}/deactivate`, {
    method: 'DELETE',
    headers: defaultHeaders,
    body: JSON.stringify({
      reason: reason,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to deactivate channel');
  }
};
