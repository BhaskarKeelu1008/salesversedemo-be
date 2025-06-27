import { ProjectController } from '@/modules/project/project.controller';
import { ProjectService } from '@/modules/project/project.service';
import { ValidationPipe } from '@/common/pipes/validation.pipe';
import { HTTP_STATUS } from '@/common/constants/http-status.constants';
import type { Request, Response } from 'express';
import { mockRequest, mockResponse } from 'tests/utils/test-utils';
import { Types } from 'mongoose';
import { CreateProjectDto } from '@/modules/project/dto/create-project.dto';
import { ProjectQueryDto } from '@/modules/project/dto/project-query.dto';
import { ProjectResponseDto } from '@/modules/project/dto/project-response.dto';

jest.mock('@/modules/project/project.service');
jest.mock('@/common/pipes/validation.pipe');

describe('ProjectController', () => {
  let projectController: ProjectController;
  let mockProjectService: jest.Mocked<ProjectService>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockProjectService = new ProjectService() as jest.Mocked<ProjectService>;
    projectController = new ProjectController();
    (projectController as any).projectService = mockProjectService;
  });

  describe('createProject', () => {
    const mockProjectData = {
      projectName: 'Test Project',
      projectCode: 'TEST_PROJ',
      description: 'Test Description',
      modules: [
        {
          moduleId: new Types.ObjectId().toString(),
          isActive: true,
          config: {},
        },
      ],
      projectStatus: 'active' as const,
    };

    it('should create project successfully', async () => {
      const mockCreatedProject = {
        _id: new Types.ObjectId(),
        ...mockProjectData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (ValidationPipe.validateBody as jest.Mock).mockReturnValue(jest.fn());
      mockProjectService.createProject.mockResolvedValue(mockCreatedProject);

      const req = mockRequest(mockProjectData) as Request;
      const res = mockResponse() as Response;

      await projectController.createProject(req, res);

      expect(ValidationPipe.validateBody).toHaveBeenCalledWith(CreateProjectDto);
      expect(mockProjectService.createProject).toHaveBeenCalledWith(mockProjectData);
      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.CREATED);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: expect.any(ProjectResponseDto),
      });
    });

    it('should handle validation error', async () => {
      const error = new Error('Validation failed');
      (ValidationPipe.validateBody as jest.Mock).mockImplementation(() => {
        throw error;
      });

      const req = mockRequest(mockProjectData) as Request;
      const res = mockResponse() as Response;

      await projectController.createProject(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: error.message,
      });
    });

    it('should handle internal server error', async () => {
      (ValidationPipe.validateBody as jest.Mock).mockReturnValue(jest.fn());
      mockProjectService.createProject.mockRejectedValue('Some error');

      const req = mockRequest(mockProjectData) as Request;
      const res = mockResponse() as Response;

      await projectController.createProject(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Internal server error',
      });
    });
  });

  describe('getProjects', () => {
    const mockQuery: ProjectQueryDto = {
      page: 1,
      limit: 10,
      projectStatus: 'active',
    };

    it('should get projects successfully', async () => {
      const mockProjects = [
        {
          _id: new Types.ObjectId(),
          projectName: 'Test Project',
          projectCode: 'TEST_PROJ',
          modules: [],
          projectStatus: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (ValidationPipe.validateQuery as jest.Mock).mockReturnValue(jest.fn());
      mockProjectService.getProjects.mockResolvedValue({
        projects: mockProjects,
        total: 1,
        page: mockQuery.page,
        limit: mockQuery.limit,
      });

      const req = mockRequest({}, {}, mockQuery) as Request;
      const res = mockResponse() as Response;

      await projectController.getProjects(req, res);

      expect(ValidationPipe.validateQuery).toHaveBeenCalledWith(ProjectQueryDto);
      expect(mockProjectService.getProjects).toHaveBeenCalledWith(mockQuery);
      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          projects: expect.arrayContaining([expect.any(ProjectResponseDto)]),
          total: 1,
          page: mockQuery.page,
          limit: mockQuery.limit,
        },
      });
    });

    it('should handle validation error', async () => {
      const error = new Error('Validation failed');
      (ValidationPipe.validateQuery as jest.Mock).mockImplementation(() => {
        throw error;
      });

      const req = mockRequest({}, {}, mockQuery) as Request;
      const res = mockResponse() as Response;

      await projectController.getProjects(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: error.message,
      });
    });

    it('should handle internal server error', async () => {
      (ValidationPipe.validateQuery as jest.Mock).mockReturnValue(jest.fn());
      mockProjectService.getProjects.mockRejectedValue('Some error');

      const req = mockRequest({}, {}, mockQuery) as Request;
      const res = mockResponse() as Response;

      await projectController.getProjects(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Internal server error',
      });
    });
  });

  describe('getProjectById', () => {
    const mockId = new Types.ObjectId().toString();

    it('should get project by id successfully', async () => {
      const mockProject = {
        _id: new Types.ObjectId(mockId),
        projectName: 'Test Project',
        projectCode: 'TEST_PROJ',
        modules: [],
        projectStatus: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockProjectService.getProjectById.mockResolvedValue(mockProject);

      const req = mockRequest({}, { id: mockId }) as Request;
      const res = mockResponse() as Response;

      await projectController.getProjectById(req, res);

      expect(mockProjectService.getProjectById).toHaveBeenCalledWith(mockId);
      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: expect.any(ProjectResponseDto),
      });
    });

    it('should handle error when project not found', async () => {
      const error = new Error('Project not found');
      mockProjectService.getProjectById.mockRejectedValue(error);

      const req = mockRequest({}, { id: mockId }) as Request;
      const res = mockResponse() as Response;

      await projectController.getProjectById(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: error.message,
      });
    });

    it('should handle internal server error', async () => {
      mockProjectService.getProjectById.mockRejectedValue('Some error');

      const req = mockRequest({}, { id: mockId }) as Request;
      const res = mockResponse() as Response;

      await projectController.getProjectById(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Internal server error',
      });
    });
  });

  describe('updateProject', () => {
    const mockId = new Types.ObjectId().toString();
    const mockUpdateData = {
      projectName: 'Updated Project',
      projectCode: 'UPD_PROJ',
      modules: [],
      projectStatus: 'active' as const,
    };

    it('should update project successfully', async () => {
      const mockUpdatedProject = {
        _id: new Types.ObjectId(mockId),
        ...mockUpdateData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (ValidationPipe.validateBody as jest.Mock).mockReturnValue(jest.fn());
      mockProjectService.updateProject.mockResolvedValue(mockUpdatedProject);

      const req = mockRequest(mockUpdateData, { id: mockId }) as Request;
      const res = mockResponse() as Response;

      await projectController.updateProject(req, res);

      expect(ValidationPipe.validateBody).toHaveBeenCalledWith(CreateProjectDto);
      expect(mockProjectService.updateProject).toHaveBeenCalledWith(mockId, mockUpdateData);
      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: expect.any(ProjectResponseDto),
      });
    });

    it('should handle validation error', async () => {
      const error = new Error('Validation failed');
      (ValidationPipe.validateBody as jest.Mock).mockImplementation(() => {
        throw error;
      });

      const req = mockRequest(mockUpdateData, { id: mockId }) as Request;
      const res = mockResponse() as Response;

      await projectController.updateProject(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: error.message,
      });
    });

    it('should handle internal server error', async () => {
      (ValidationPipe.validateBody as jest.Mock).mockReturnValue(jest.fn());
      mockProjectService.updateProject.mockRejectedValue('Some error');

      const req = mockRequest(mockUpdateData, { id: mockId }) as Request;
      const res = mockResponse() as Response;

      await projectController.updateProject(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Internal server error',
      });
    });
  });

  describe('deleteProject', () => {
    const mockId = new Types.ObjectId().toString();

    it('should delete project successfully', async () => {
      mockProjectService.deleteProject.mockResolvedValue(undefined);

      const req = mockRequest({}, { id: mockId }) as Request;
      const res = mockResponse() as Response;

      await projectController.deleteProject(req, res);

      expect(mockProjectService.deleteProject).toHaveBeenCalledWith(mockId);
      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
      expect(res.send).toHaveBeenCalled();
    });

    it('should handle error when project not found', async () => {
      const error = new Error('Project not found');
      mockProjectService.deleteProject.mockRejectedValue(error);

      const req = mockRequest({}, { id: mockId }) as Request;
      const res = mockResponse() as Response;

      await projectController.deleteProject(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: error.message,
      });
    });

    it('should handle internal server error', async () => {
      mockProjectService.deleteProject.mockRejectedValue('Some error');

      const req = mockRequest({}, { id: mockId }) as Request;
      const res = mockResponse() as Response;

      await projectController.deleteProject(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Internal server error',
      });
    });
  });
}); 