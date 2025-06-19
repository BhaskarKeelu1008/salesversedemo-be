export interface Agent {
  _id: string;
  userId: string;
  channelId: string;
  channelName: string;
  channelCode: string;
  designationId: string;
  designationName: string;
  designationCode: string;
  agentCode: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  agentStatus: 'active' | 'inactive';
  joiningDate: string;
  targetAmount: number;
  commissionPercentage: number;
  isTeamLead: boolean;
  teamLeadId?: string;
  reportingManagerId?: string;
  projectId?: string;
  projectName?: string;
  projectCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface AgentsResponse {
  agents: Agent[];
  pagination: PaginationInfo;
}

export interface CreateAgentPayload {
  userId?: string;
  channelId: string;
  designationId: string;
  agentCode: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  agentStatus: 'active' | 'inactive';
  joiningDate: string;
  targetAmount: number;
  commissionPercentage: number;
  isTeamLead: boolean;
  teamLeadId?: string;
  reportingManagerId?: string;
  projectId?: string;
  generateAgentCode?: boolean;
}

export interface Channel {
  _id: string;
  name: string;
  code: string;
}

export interface Designation {
  _id: string;
  name: string;
  code: string;
}

export const getUsers = async (
  page: number = 1,
  limit: number = 10,
  search = '',
  channelName = ''
): Promise<ApiResponse<AgentsResponse>> => {
  const baseUrl =
    import.meta.env.VITE_API_URL ||
    'https://salesverse-dev-api.inxtuniverse.com/api';
  const queryParams = new URLSearchParams();

  // Always set initial page and limit
  queryParams.set('page', page.toString());
  queryParams.set('limit', limit.toString());

  // Add optional parameters
  if (search) queryParams.set('search', search);
  if (channelName) queryParams.set('channelName', channelName);

  const response = await fetch(`${baseUrl}/agents?${queryParams.toString()}`, {
    method: 'GET',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to fetch agents');
  }

  const data = await response.json();
  return data;
};

export const createUser = async (agent: CreateAgentPayload) => {
  const baseUrl =
    import.meta.env.VITE_API_URL ||
    'https://salesverse-dev-api.inxtuniverse.com/api';
  const response = await fetch(`${baseUrl}/agents`, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(agent),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to create agent');
  }

  const data = await response.json();
  return data.data;
};

export const updateUser = async (id: string, updates: Partial<Agent>) => {
  const baseUrl =
    import.meta.env.VITE_API_URL ||
    'https://salesverse-dev-api.inxtuniverse.com/api';
  const response = await fetch(`${baseUrl}/agents/${id}`, {
    method: 'PUT',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to update agent');
  }

  const data = await response.json();
  return data.data;
};
