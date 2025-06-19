import { getApiUrl } from '../../../config';

export interface Module {
  _id: string;
  name: string;
  code: string;
  description: string;
  defaultConfig: {
    maxUsers?: number;
    allowRegistration?: boolean;
    [key: string]: any;
  };
  isActive: boolean;
  isCore: boolean;
  version: string;
  dependencies: string[];
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ModuleResponse {
  modules: Module[];
  total: number;
  page: string;
  limit: string;
}

export interface ModuleApiResponse {
  status: string;
  data: ModuleResponse;
}

export const fetchModules = async (
  page: number = 1,
  limit: number = 10,
  sortBy: string = 'createdAt',
  sortOrder: string = 'desc'
): Promise<ModuleResponse> => {
  const url = getApiUrl(
    `api/modules?page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`
  );

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch modules');
  }

  const data: ModuleApiResponse = await response.json();
  return data.data;
};

export interface CreateModulePayload {
  name: string;
  code: string;
  description: string;
  icon?: string;
  isActive: boolean;
  isCore: boolean;
  version: string;
  defaultConfig: {
    [key: string]: any;
  };
  permissions: string[];
}

export const createModule = async (
  moduleData: CreateModulePayload
): Promise<any> => {
  const url = getApiUrl('api/modules');

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(moduleData),
  });

  if (!response.ok) {
    throw new Error('Failed to create module');
  }

  return await response.json();
};
