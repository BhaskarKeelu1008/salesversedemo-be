import { Router } from 'express';
import { AccessControlController } from '@/modules/accessControl/access-control.controller';
import type { Request, Response } from 'express';

jest.mock('@/modules/accessControl/access-control.controller');

describe('AccessControl Routes', () => {
  let mockAccessControlController: jest.Mocked<AccessControlController>;
  let mockRouter: jest.Mocked<Router>;
  let mockGetHandler: jest.Mock;
  let mockPostHandler: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock handlers
    mockGetHandler = jest.fn();
    mockPostHandler = jest.fn();

    // Create mock controller with bound methods
    mockAccessControlController = {
      getAccessControlsByProjectAndChannel: mockGetHandler,
      createOrUpdateAccessControl: mockPostHandler,
    } as unknown as jest.Mocked<AccessControlController>;

    // Mock the controller constructor
    (AccessControlController as jest.Mock).mockImplementation(() => mockAccessControlController);

    // Create mock router
    mockRouter = {
      get: jest.fn().mockReturnThis(),
      post: jest.fn().mockReturnThis(),
    } as unknown as jest.Mocked<Router>;

    // Mock the Router constructor
    (Router as jest.Mock) = jest.fn().mockReturnValue(mockRouter);

    // Import routes to test
    jest.isolateModules(() => {
      require('@/modules/accessControl/access-control.routes');
    });
  });

  it('should configure routes correctly', () => {
    // Assert route paths are correct
    expect(mockRouter.get).toHaveBeenCalledWith(
      '/project/:projectId/channel/:channelId',
      mockGetHandler,
    );

    expect(mockRouter.post).toHaveBeenCalledWith(
      '/project/:projectId/channel/:channelId/createOrUpdate',
      mockPostHandler,
    );
  });

  it('should call controller methods with correct parameters', async () => {
    // Get the route handlers
    const getHandler = (mockRouter.get as jest.Mock).mock.calls[0][1];
    const postHandler = (mockRouter.post as jest.Mock).mock.calls[0][1];

    // Mock request and response
    const mockReq = {
      params: {
        projectId: '123',
        channelId: '456',
      },
    } as unknown as Request;

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    // Call handlers
    await getHandler(mockReq, mockRes);
    await postHandler(mockReq, mockRes);

    // Assert controller methods were called
    expect(mockGetHandler).toHaveBeenCalledWith(mockReq, mockRes);
    expect(mockPostHandler).toHaveBeenCalledWith(mockReq, mockRes);
  });
});
