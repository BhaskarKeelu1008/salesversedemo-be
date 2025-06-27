import { Router } from 'express';
import { AccessControlController } from '@/modules/accessControl/access-control.controller';

jest.mock('@/modules/accessControl/access-control.controller');

describe('AccessControl Routes', () => {
  let mockAccessControlController: jest.Mocked<AccessControlController>;
  let mockRouter: jest.Mocked<Router>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockAccessControlController = new AccessControlController() as jest.Mocked<AccessControlController>;
    mockRouter = {
      get: jest.fn().mockReturnThis(),
      post: jest.fn().mockReturnThis(),
    } as unknown as jest.Mocked<Router>;

    // Mock the Router constructor to return our mock router
    (Router as jest.Mock) = jest.fn().mockReturnValue(mockRouter);

    // Reset modules to ensure we get a fresh instance
    jest.isolateModules(() => {
      require('@/modules/accessControl/access-control.routes');
    });
  });

  it('should configure routes correctly', () => {
    // Assert
    expect(mockRouter.get).toHaveBeenCalledWith(
      '/project/:projectId/channel/:channelId',
      expect.any(Function),
    );
    expect(mockRouter.post).toHaveBeenCalledWith(
      '/project/:projectId/channel/:channelId/createOrUpdate',
      expect.any(Function),
    );
  });

  it('should bind controller methods to routes', () => {
    // Get the route handlers
    const getHandler = (mockRouter.get as jest.Mock).mock.calls[0][1];
    const postHandler = (mockRouter.post as jest.Mock).mock.calls[0][1];

    // Assert that the handlers are bound methods from the controller
    expect(getHandler.name).toBe('bound getAccessControlsByProjectAndChannel');
    expect(postHandler.name).toBe('bound createOrUpdateAccessControl');
  });
});
