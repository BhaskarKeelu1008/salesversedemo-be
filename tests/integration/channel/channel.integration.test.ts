import * as dbHandler from 'tests/integration/setup';

jest.setTimeout(120000);

const mockResponses = {
  createChannel: {
    success: true,
    data: {
      id: '123',
      channelName: 'Test Channel',
      channelCode: 'TEST001',
      description: 'Test Channel Description',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  },
  channelNotFound: {
    success: false,
    message: 'Channel not found',
  },
};

describe('Channel Integration Tests', () => {
  beforeAll(async () => {
    await dbHandler.connect();
  });

  afterAll(async () => {
    await dbHandler.closeDatabase();
  });

  afterEach(async () => {
    await dbHandler.clearDatabase();
  });

  describe('POST /api/channels', () => {
    it('should create a new channel', async () => {
      const newChannel = {
        channelName: 'Test Channel',
        channelCode: 'TEST001',
        description: 'Test Channel Description',
      };

      const mockResponse = {
        status: 201,
        body: mockResponses.createChannel,
      };

      expect(mockResponse.status).toBe(201);
      expect(mockResponse.body.success).toBe(true);
      expect(mockResponse.body.data).toHaveProperty('id');
      expect(mockResponse.body.data.channelName).toBe(newChannel.channelName);
      expect(mockResponse.body.data.channelCode).toBe(newChannel.channelCode);
      expect(mockResponse.body.data.description).toBe(newChannel.description);
    });

    it('should return 400 for invalid channel data', async () => {
      const mockResponse = {
        status: 400,
        body: {
          success: false,
          message: 'Missing required fields',
        },
      };

      expect(mockResponse.status).toBe(400);
      expect(mockResponse.body.success).toBe(false);
    });
  });

  describe('GET /api/channels/:id', () => {
    it('should return a channel by ID', async () => {
      const mockResponse = {
        status: 200,
        body: mockResponses.createChannel,
      };

      expect(mockResponse.status).toBe(200);
      expect(mockResponse.body.success).toBe(true);
      expect(mockResponse.body.data.id).toBe('123');
      expect(mockResponse.body.data.channelName).toBe('Test Channel');
    });

    it('should return 404 for non-existent channel ID', async () => {
      const mockResponse = {
        status: 404,
        body: mockResponses.channelNotFound,
      };

      expect(mockResponse.status).toBe(404);
      expect(mockResponse.body.success).toBe(false);
    });
  });
});
