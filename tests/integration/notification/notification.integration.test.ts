import request from 'supertest';
import type { Express } from 'express';
import { Types } from 'mongoose';
import { App } from '@/app';
import { DatabaseProvider } from '@/providers/database.provider';
import { generateObjectId } from 'tests/utils/test-utils';
import { Notification } from '@/models/notification.model';

// Mock configuration for testing
const testConfig = {
  port: 3001,
  environment: 'test',
  corsOrigin: ['http://localhost:5173'],
  database: {
    uri:
      process.env.TEST_DATABASE_URI ||
      'mongodb://localhost:27017/salesverse-test',
    dbName: 'salesverse-test',
  },
};

describe('Notification Integration Tests', () => {
  let app: Express;
  let appInstance: App;
  let databaseProvider: DatabaseProvider;

  const mockUser = {
    _id: new Types.ObjectId(),
    email: 'test@example.com',
    role: 'agent',
  };

  const mockNotificationData = {
    type: 'lead_created',
    title: 'Test Notification',
    message: 'Test notification message',
    recipients: [
      {
        recipientId: mockUser._id.toString(),
        recipientType: 'agent',
      },
    ],
    triggeredBy: mockUser._id.toString(),
    triggeredByType: 'agent',
    priority: 'medium',
  };

  beforeAll(async () => {
    // Create app instance
    appInstance = new App(testConfig);
    app = appInstance.getApp();
    databaseProvider = appInstance.getDatabaseProvider();

    // Connect to test database
    await databaseProvider.connect();
  });

  afterAll(async () => {
    // Clean up and close connections
    if (databaseProvider.isConnected()) {
      await databaseProvider.disconnect();
    }
    await appInstance.stop();
  });

  beforeEach(async () => {
    // Clear notifications collection before each test
    await Notification.deleteMany({});
  });

  describe('POST /api/notifications', () => {
    it('should create a notification successfully', async () => {
      const response = await request(app)
        .post('/api/notifications')
        .send(mockNotificationData)
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Notification created successfully',
        data: expect.objectContaining({
          type: mockNotificationData.type,
          title: mockNotificationData.title,
          message: mockNotificationData.message,
          priority: mockNotificationData.priority,
        }),
      });

      // Verify notification was saved to database
      const savedNotification = await Notification.findById(
        response.body.data._id,
      );
      expect(savedNotification).toBeTruthy();
      expect(savedNotification!.type).toBe(mockNotificationData.type);
    });

    it('should return 400 for invalid notification data', async () => {
      const invalidData = {
        ...mockNotificationData,
        type: 'invalid-type',
      };

      const response = await request(app)
        .post('/api/notifications')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for missing required fields', async () => {
      const incompleteData = {
        title: 'Test Notification',
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/notifications')
        .send(incompleteData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should create notification with optional fields', async () => {
      const notificationWithOptionals = {
        ...mockNotificationData,
        data: { leadId: generateObjectId() },
        actionUrl: '/leads/123',
        expiresAt: '2024-12-31T23:59:59.000Z',
        isGlobal: false,
        metadata: { source: 'test' },
      };

      const response = await request(app)
        .post('/api/notifications')
        .send(notificationWithOptionals)
        .expect(201);

      expect(response.body.data).toMatchObject({
        actionUrl: '/leads/123',
        isGlobal: false,
      });
    });
  });

  describe('GET /api/notifications', () => {
    let createdNotification: any;

    beforeEach(async () => {
      // Create a test notification
      const notification = new Notification({
        type: 'lead_created',
        title: 'Test Notification',
        message: 'Test notification message',
        recipients: [
          {
            recipientId: mockUser._id,
            recipientType: 'agent',
            status: 'unread',
          },
        ],
        triggeredBy: mockUser._id,
        triggeredByType: 'agent',
        priority: 'medium',
        data: {},
      });
      createdNotification = await notification.save();
    });

    it('should get all notifications without filters', async () => {
      const response = await request(app).get('/api/notifications').expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Notifications retrieved successfully',
        data: expect.arrayContaining([
          expect.objectContaining({
            _id: createdNotification._id.toString(),
            type: 'lead_created',
          }),
        ]),
        pagination: expect.objectContaining({
          total: 1,
          page: 1,
          totalPages: 1,
          limit: 10,
        }),
      });
    });

    it('should filter notifications by recipient', async () => {
      const response = await request(app)
        .get('/api/notifications')
        .query({
          recipientId: mockUser._id.toString(),
          recipientType: 'agent',
        })
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0]._id).toBe(
        createdNotification._id.toString(),
      );
    });

    it('should filter notifications by type', async () => {
      const response = await request(app)
        .get('/api/notifications')
        .query({ type: 'lead_created' })
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].type).toBe('lead_created');
    });

    it('should handle pagination correctly', async () => {
      // Create additional notifications
      for (let i = 0; i < 15; i++) {
        const notification = new Notification({
          type: 'lead_created',
          title: `Test Notification ${i}`,
          message: 'Test notification message',
          recipients: [
            {
              recipientId: mockUser._id,
              recipientType: 'agent',
              status: 'unread',
            },
          ],
          triggeredBy: mockUser._id,
          triggeredByType: 'agent',
          priority: 'medium',
          data: {},
        });
        await notification.save();
      }

      const response = await request(app)
        .get('/api/notifications')
        .query({
          page: 2,
          limit: 5,
        })
        .expect(200);

      expect(response.body.data).toHaveLength(5);
      expect(response.body.pagination).toMatchObject({
        total: 16, // 1 + 15 created
        page: 2,
        totalPages: 4, // Math.ceil(16 / 5)
        limit: 5,
      });
    });

    it('should handle date range filtering', async () => {
      const startDate = new Date('2024-01-01T00:00:00.000Z');
      const endDate = new Date('2024-12-31T23:59:59.000Z');

      const response = await request(app)
        .get('/api/notifications')
        .query({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('should handle sorting', async () => {
      const response = await request(app)
        .get('/api/notifications')
        .query({
          sortBy: 'createdAt',
          sortOrder: 'asc',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });
  });

  describe('GET /api/notifications/stats', () => {
    beforeEach(async () => {
      // Create test notifications with different statuses
      const notifications = [
        {
          type: 'lead_created',
          title: 'Unread Notification 1',
          message: 'Test message',
          recipients: [
            {
              recipientId: mockUser._id,
              recipientType: 'agent',
              status: 'unread',
            },
          ],
          triggeredBy: mockUser._id,
          triggeredByType: 'agent',
          priority: 'high',
        },
        {
          type: 'lead_allocated',
          title: 'Read Notification',
          message: 'Test message',
          recipients: [
            {
              recipientId: mockUser._id,
              recipientType: 'agent',
              status: 'read',
            },
          ],
          triggeredBy: mockUser._id,
          triggeredByType: 'agent',
          priority: 'medium',
        },
        {
          type: 'lead_status_updated',
          title: 'Archived Notification',
          message: 'Test message',
          recipients: [
            {
              recipientId: mockUser._id,
              recipientType: 'agent',
              status: 'archived',
            },
          ],
          triggeredBy: mockUser._id,
          triggeredByType: 'agent',
          priority: 'low',
        },
      ];

      for (const notificationData of notifications) {
        const notification = new Notification(notificationData);
        await notification.save();
      }
    });

    it('should get notification stats successfully', async () => {
      const response = await request(app)
        .get('/api/notifications/stats')
        .query({
          recipientId: mockUser._id.toString(),
          recipientType: 'agent',
        })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Notification stats retrieved successfully',
        data: expect.objectContaining({
          total: expect.any(Number),
          unread: expect.any(Number),
          read: expect.any(Number),
          archived: expect.any(Number),
          byType: expect.any(Object),
          byPriority: expect.any(Object),
        }),
      });
    });

    it('should return 400 for missing required parameters', async () => {
      const response = await request(app)
        .get('/api/notifications/stats')
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid recipient ID', async () => {
      const response = await request(app)
        .get('/api/notifications/stats')
        .query({
          recipientId: 'invalid-id',
          recipientType: 'agent',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/notifications/:id', () => {
    let createdNotification: any;

    beforeEach(async () => {
      const notification = new Notification({
        type: 'lead_created',
        title: 'Test Notification',
        message: 'Test notification message',
        recipients: [
          {
            recipientId: mockUser._id,
            recipientType: 'agent',
            status: 'unread',
          },
        ],
        triggeredBy: mockUser._id,
        triggeredByType: 'agent',
        priority: 'medium',
        data: {},
      });
      createdNotification = await notification.save();
    });

    it('should get notification by ID successfully', async () => {
      const response = await request(app)
        .get(`/api/notifications/${createdNotification._id}`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Notification retrieved successfully',
        data: expect.objectContaining({
          _id: createdNotification._id.toString(),
          type: 'lead_created',
        }),
      });
    });

    it('should return 400 for invalid notification ID', async () => {
      const response = await request(app)
        .get('/api/notifications/invalid-id')
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        message: 'Invalid notification ID',
      });
    });

    it('should return 404 for non-existent notification', async () => {
      const nonExistentId = new Types.ObjectId();
      const response = await request(app)
        .get(`/api/notifications/${nonExistentId}`)
        .expect(404);

      expect(response.body).toMatchObject({
        success: false,
        message: 'Notification not found',
      });
    });
  });

  describe('PATCH /api/notifications/:id/status', () => {
    let createdNotification: any;

    beforeEach(async () => {
      const notification = new Notification({
        type: 'lead_created',
        title: 'Test Notification',
        message: 'Test notification message',
        recipients: [
          {
            recipientId: mockUser._id,
            recipientType: 'agent',
            status: 'unread',
          },
        ],
        triggeredBy: mockUser._id,
        triggeredByType: 'agent',
        priority: 'medium',
        data: {},
      });
      createdNotification = await notification.save();
    });

    it('should update notification status successfully', async () => {
      const response = await request(app)
        .patch(`/api/notifications/${createdNotification._id}/status`)
        .send({
          status: 'read',
          recipientId: mockUser._id.toString(),
        })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Notification status updated successfully',
        data: expect.objectContaining({
          _id: createdNotification._id.toString(),
        }),
      });

      // Verify status was updated in database
      const updatedNotification = await Notification.findById(
        createdNotification._id,
      );
      expect(updatedNotification!.recipients[0].status).toBe('read');
      expect(updatedNotification!.recipients[0].readAt).toBeTruthy();
    });

    it('should return 400 for invalid status', async () => {
      const response = await request(app)
        .patch(`/api/notifications/${createdNotification._id}/status`)
        .send({
          status: 'invalid-status',
          recipientId: mockUser._id.toString(),
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid notification ID', async () => {
      const response = await request(app)
        .patch('/api/notifications/invalid-id/status')
        .send({
          status: 'read',
          recipientId: mockUser._id.toString(),
        })
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        message: 'Invalid notification ID or recipient ID',
      });
    });

    it('should return 404 when notification not found', async () => {
      const nonExistentId = new Types.ObjectId();
      const response = await request(app)
        .patch(`/api/notifications/${nonExistentId}/status`)
        .send({
          status: 'read',
          recipientId: mockUser._id.toString(),
        })
        .expect(404);

      expect(response.body).toMatchObject({
        success: false,
        message: 'Notification not found or recipient not authorized',
      });
    });
  });

  describe('PATCH /api/notifications/:id/read', () => {
    let createdNotification: any;

    beforeEach(async () => {
      const notification = new Notification({
        type: 'lead_created',
        title: 'Test Notification',
        message: 'Test notification message',
        recipients: [
          {
            recipientId: mockUser._id,
            recipientType: 'agent',
            status: 'unread',
          },
        ],
        triggeredBy: mockUser._id,
        triggeredByType: 'agent',
        priority: 'medium',
        data: {},
      });
      createdNotification = await notification.save();
    });

    it('should mark notification as read successfully', async () => {
      const response = await request(app)
        .patch(`/api/notifications/${createdNotification._id}/read`)
        .send({
          recipientId: mockUser._id.toString(),
        })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Notification marked as read successfully',
        data: expect.objectContaining({
          _id: createdNotification._id.toString(),
        }),
      });

      // Verify status was updated in database
      const updatedNotification = await Notification.findById(
        createdNotification._id,
      );
      expect(updatedNotification!.recipients[0].status).toBe('read');
    });

    it('should return 400 for invalid notification ID', async () => {
      const response = await request(app)
        .patch('/api/notifications/invalid-id/read')
        .send({
          recipientId: mockUser._id.toString(),
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 when notification not found', async () => {
      const nonExistentId = new Types.ObjectId();
      const response = await request(app)
        .patch(`/api/notifications/${nonExistentId}/read`)
        .send({
          recipientId: mockUser._id.toString(),
        })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/notifications/read-all', () => {
    beforeEach(async () => {
      // Create multiple unread notifications
      for (let i = 0; i < 3; i++) {
        const notification = new Notification({
          type: 'lead_created',
          title: `Test Notification ${i}`,
          message: 'Test notification message',
          recipients: [
            {
              recipientId: mockUser._id,
              recipientType: 'agent',
              status: 'unread',
            },
          ],
          triggeredBy: mockUser._id,
          triggeredByType: 'agent',
          priority: 'medium',
          data: {},
        });
        await notification.save();
      }
    });

    it('should mark all notifications as read successfully', async () => {
      const response = await request(app)
        .patch('/api/notifications/read-all')
        .send({
          recipientId: mockUser._id.toString(),
          recipientType: 'agent',
        })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: expect.stringContaining(
          'notifications marked as read successfully',
        ),
        data: expect.objectContaining({
          modifiedCount: expect.any(Number),
        }),
      });

      // Verify all notifications were marked as read
      const unreadCount = await Notification.countDocuments({
        'recipients.recipientId': mockUser._id,
        'recipients.status': 'unread',
      });
      expect(unreadCount).toBe(0);
    });

    it('should handle case when no unread notifications exist', async () => {
      // First mark all as read
      await request(app).patch('/api/notifications/read-all').send({
        recipientId: mockUser._id.toString(),
        recipientType: 'agent',
      });

      // Try to mark all as read again
      const response = await request(app)
        .patch('/api/notifications/read-all')
        .send({
          recipientId: mockUser._id.toString(),
          recipientType: 'agent',
        })
        .expect(200);

      expect(response.body.message).toContain('No unread notifications found');
    });

    it('should return 400 for invalid recipient type', async () => {
      const response = await request(app)
        .patch('/api/notifications/read-all')
        .send({
          recipientId: mockUser._id.toString(),
          recipientType: 'invalid-type',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/notifications/:id', () => {
    let createdNotification: any;

    beforeEach(async () => {
      const notification = new Notification({
        type: 'lead_created',
        title: 'Test Notification',
        message: 'Test notification message',
        recipients: [
          {
            recipientId: mockUser._id,
            recipientType: 'agent',
            status: 'unread',
          },
        ],
        triggeredBy: mockUser._id,
        triggeredByType: 'agent',
        priority: 'medium',
        data: {},
      });
      createdNotification = await notification.save();
    });

    it('should delete notification successfully', async () => {
      const response = await request(app)
        .delete(`/api/notifications/${createdNotification._id}`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Notification deleted successfully',
      });

      // Verify notification was deleted from database
      const deletedNotification = await Notification.findById(
        createdNotification._id,
      );
      expect(deletedNotification).toBeNull();
    });

    it('should return 400 for invalid notification ID', async () => {
      const response = await request(app)
        .delete('/api/notifications/invalid-id')
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 when notification not found', async () => {
      const nonExistentId = new Types.ObjectId();
      const response = await request(app)
        .delete(`/api/notifications/${nonExistentId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle server errors gracefully', async () => {
      // Mock a database error by using an invalid operation
      const response = await request(app)
        .post('/api/notifications')
        .send({
          // Send malformed data that might cause database errors
          type: 'lead_created',
          title: 'Test',
          message: 'Test',
          recipients: [
            {
              recipientId: 'not-a-valid-object-id',
              recipientType: 'agent',
            },
          ],
          triggeredBy: 'also-not-valid',
          triggeredByType: 'agent',
        });

      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/notifications/non-existent-endpoint')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});
