import { Router } from 'express';
import { HierarchyController } from '@/modules/hierarchy/hierarchy.controller';
import { ValidationPipe } from '@/common/pipes/validation.pipe';
import { Types } from 'mongoose';
import { mockRequest, mockResponse } from 'tests/utils/test-utils';

jest.mock('@/modules/hierarchy/hierarchy.controller');
jest.mock('@/common/pipes/validation.pipe');

describe('Hierarchy Routes', () => {
  let mockRouter: jest.Mocked<Router>;
  let mockHierarchyController: jest.Mocked<HierarchyController>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockHierarchyController = new HierarchyController() as jest.Mocked<HierarchyController>;
    mockRouter = {
      get: jest.fn().mockReturnThis(),
      post: jest.fn().mockReturnThis(),
      put: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
    } as unknown as jest.Mocked<Router>;

    // Mock the Router constructor to return our mock router
    (Router as jest.Mock) = jest.fn().mockReturnValue(mockRouter);

    // Mock ValidationPipe.validateBody and validateQuery
    (ValidationPipe.validateBody as jest.Mock) = jest.fn().mockReturnValue(jest.fn());
    (ValidationPipe.validateQuery as jest.Mock) = jest.fn().mockReturnValue(jest.fn());

    // Reset modules to ensure we get a fresh instance
    jest.isolateModules(() => {
      require('@/modules/hierarchy/hierarchy.routes');
    });
  });

  it('should configure routes correctly', () => {
    // Assert POST routes
    expect(mockRouter.post).toHaveBeenCalledWith(
      '/',
      expect.any(Function), // ValidationPipe.validateBody
      expect.any(Function), // hierarchyController.createHierarchy
    );

    // Assert GET routes
    expect(mockRouter.get).toHaveBeenCalledWith(
      '/',
      expect.any(Function), // ValidationPipe.validateQuery
      expect.any(Function), // hierarchyController.getAllHierarchies
    );
    expect(mockRouter.get).toHaveBeenCalledWith(
      '/hierarchyTeamMemberList',
      expect.any(Function), // hierarchyController.getHierarchyTeamMemberList
    );
    expect(mockRouter.get).toHaveBeenCalledWith(
      '/:id',
      expect.any(Function), // hierarchyController.getHierarchyById
    );
    expect(mockRouter.get).toHaveBeenCalledWith(
      '/channel/:channelId',
      expect.any(Function), // hierarchyController.getHierarchiesByChannel
    );

    // Assert PUT routes
    expect(mockRouter.put).toHaveBeenCalledWith(
      '/:id',
      expect.any(Function), // ValidationPipe.validateBody
      expect.any(Function), // hierarchyController.updateHierarchy
    );

    // Assert DELETE routes
    expect(mockRouter.delete).toHaveBeenCalledWith(
      '/:id',
      expect.any(Function), // hierarchyController.deleteHierarchy
    );
  });

  it('should use validation middleware correctly', () => {
    // Assert validation middleware for POST /
    expect(ValidationPipe.validateBody).toHaveBeenCalledWith(expect.any(Function));
    expect(mockRouter.post).toHaveBeenCalledWith(
      '/',
      expect.any(Function),
      expect.any(Function),
    );

    // Assert validation middleware for GET /
    expect(ValidationPipe.validateQuery).toHaveBeenCalledWith(expect.any(Function));
    expect(mockRouter.get).toHaveBeenCalledWith(
      '/',
      expect.any(Function),
      expect.any(Function),
    );

    // Assert validation middleware for PUT /:id
    expect(ValidationPipe.validateBody).toHaveBeenCalledWith(expect.any(Function));
    expect(mockRouter.put).toHaveBeenCalledWith(
      '/:id',
      expect.any(Function),
      expect.any(Function),
    );
  });

  it('should bind controller methods to routes', () => {
    // Get the route handlers
    const createHandler = (mockRouter.post as jest.Mock).mock.calls[0][2];
    const getAllHandler = (mockRouter.get as jest.Mock).mock.calls[0][2];
    const getByIdHandler = (mockRouter.get as jest.Mock).mock.calls[2][1];
    const updateHandler = (mockRouter.put as jest.Mock).mock.calls[0][2];
    const deleteHandler = (mockRouter.delete as jest.Mock).mock.calls[0][1];

    // Assert that the handlers are bound methods from the controller
    expect(createHandler.name).toBe('bound createHierarchy');
    expect(getAllHandler.name).toBe('bound getAllHierarchies');
    expect(getByIdHandler.name).toBe('bound getHierarchyById');
    expect(updateHandler.name).toBe('bound updateHierarchy');
    expect(deleteHandler.name).toBe('bound deleteHierarchy');
  });
}); 