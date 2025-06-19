import { getApiUrl } from '../config';

// Interfaces to match the actual API response
export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUserPagination {
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

export interface AdminUserResponse {
  users: AdminUser[];
  pagination: AdminUserPagination;
}

export interface AdminUserApiResponse {
  success: boolean;
  message: string;
  data: AdminUserResponse;
  timestamp: string;
}

export interface CreateAdminUserPayload {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role?: string;
  isActive?: boolean;
  projectId?: string;
}

export interface UpdateAdminUserPayload {
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
  role?: string;
  projectId?: string;
}

// Project interfaces
export interface Project {
  id: string;
  projectName: string;
  projectCode: string;
  description: string;
  projectStatus: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectResponse {
  projects: Project[];
  total: number;
  page: string;
  limit: string;
}

export interface ProjectApiResponse {
  status: string;
  data: ProjectResponse;
}

export const fetchAdminUsers = async (
  page: number = 1,
  limit: number = 10
): Promise<AdminUserResponse> => {
  const url = getApiUrl(`api/users?page=${page}&limit=${limit}`);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch admin users');
  }

  const data: AdminUserApiResponse = await response.json();
  return data.data;
};

export const fetchProjects = async (
  page: number = 1,
  limit: number = 10
): Promise<ProjectResponse> => {
  const url = getApiUrl(`api/projects?page=${page}&limit=${limit}`);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch projects');
  }

  const data: ProjectApiResponse = await response.json();
  return data.data;
};

export const createAdminUser = async (
  userData: Partial<AdminUser>
): Promise<AdminUser> => {
  const url = getApiUrl('api/users');

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    throw new Error('Failed to create admin user');
  }

  return await response.json();
};

export const updateAdminUser = async (
  userId: string,
  userData: Partial<AdminUser>
): Promise<AdminUser> => {
  const url = getApiUrl(`api/users/${userId}`);

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    throw new Error('Failed to update admin user');
  }

  return await response.json();
};

export const deactivateAdminUser = async (
  userId: string,
  _reason: string
): Promise<void> => {
  const url = getApiUrl(`api/users/${userId}`);

  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to delete admin user');
  }

  return await response.json();
};

export const toggleAdminUserStatus = async (
  userId: string,
  status: boolean
): Promise<void> => {
  const url = getApiUrl(`api/users/${userId}/status`);

  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ isActive: status }),
  });

  if (!response.ok) {
    throw new Error('Failed to update admin user status');
  }

  return await response.json();
};
