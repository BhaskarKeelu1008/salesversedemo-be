import { getApiUrl } from '../../../config';

export interface ModuleDetails {
  name: string;
  code: string;
  description: string;
  version: string;
  isCore: boolean;
  permissions: string[];
}

export interface ProjectModule {
  moduleId: string;
  moduleDetails: ModuleDetails;
  isActive: boolean;
}

export interface Project {
  id: string;
  projectName: string;
  projectCode: string;
  description: string;
  modules: ProjectModule[];
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

export const fetchProjects = async (
  page: number = 1,
  limit: number = 10,
  sortBy: string = 'createdAt',
  sortOrder: string = 'desc'
): Promise<ProjectResponse> => {
  const url = getApiUrl(
    `api/projects?page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`
  );

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

export interface CreateProjectPayload {
  projectName: string;
  projectCode: string;
  description: string;
  modules: Array<{
    moduleId: string;
    isActive: boolean;
  }>;
  projectStatus: string;
}

export const createProject = async (
  projectData: CreateProjectPayload
): Promise<any> => {
  const url = getApiUrl('api/projects');

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(projectData),
  });

  if (!response.ok) {
    throw new Error('Failed to create project');
  }

  return await response.json();
};
