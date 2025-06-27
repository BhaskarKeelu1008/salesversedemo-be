import mongoose from 'mongoose';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { App } from '@/app';
import { AgentModel } from '@/models/agent.model';
import { DesignationModel } from '@/models/designation.model';
import { HierarchyModel } from '@/models/hierarchy.model';

describe('Hierarchy API Integration Tests', () => {
  let mongoServer: MongoMemoryServer;
  let app: App;
  let channelId: mongoose.Types.ObjectId;
  let hierarchyIds: mongoose.Types.ObjectId[];
  let designationIds: mongoose.Types.ObjectId[];
  let agentIds: mongoose.Types.ObjectId[];

  beforeAll(async () => {
    // Create in-memory MongoDB instance
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    // Connect to in-memory database
    await mongoose.connect(mongoUri);

    // Create app instance with in-memory database config
    const config = {
      port: 0,
      environment: 'test',
      database: {
        uri: mongoUri,
        dbName: 'test',
        options: {
          serverSelectionTimeoutMS: 1000,
          connectTimeoutMS: 1000,
        },
      },
      corsOrigin: '*',
    };

    app = new App(config);
    await app.start();
  });

  afterAll(async () => {
    if (app) {
      await app.stop();
    }
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  beforeEach(async () => {
    // Clear all collections
    await Promise.all([
      AgentModel.deleteMany({}),
      DesignationModel.deleteMany({}),
      HierarchyModel.deleteMany({}),
    ]);

    // Setup test data
    channelId = new mongoose.Types.ObjectId();

    // Create hierarchies
    const hierarchies = await HierarchyModel.create([
      {
        channelId,
        hierarchyName: 'Level 1',
        hierarchyLevelCode: '1',
        hierarchyLevel: 1,
        hierarchyStatus: 'active',
        hierarchyOrder: 1,
      },
      {
        channelId,
        hierarchyName: 'Level 3',
        hierarchyLevelCode: '3',
        hierarchyLevel: 3,
        hierarchyStatus: 'active',
        hierarchyOrder: 3,
      },
      {
        channelId,
        hierarchyName: 'Level 5',
        hierarchyLevelCode: '5',
        hierarchyLevel: 5,
        hierarchyStatus: 'active',
        hierarchyOrder: 5,
      },
    ]);

    hierarchyIds = hierarchies.map(h => new mongoose.Types.ObjectId(h._id));

    // Create designations
    const designations = await DesignationModel.create([
      {
        channelId,
        hierarchyId: hierarchyIds[0],
        designationName: 'Manager L1',
        designationCode: 'MGR_L1',
        roleId: new mongoose.Types.ObjectId(),
        designationStatus: 'active',
        designationOrder: 1,
      },
      {
        channelId,
        hierarchyId: hierarchyIds[1],
        designationName: 'Manager L3',
        designationCode: 'MGR_L3',
        roleId: new mongoose.Types.ObjectId(),
        designationStatus: 'active',
        designationOrder: 3,
      },
      {
        channelId,
        hierarchyId: hierarchyIds[2],
        designationName: 'Manager L5',
        designationCode: 'MGR_L5',
        roleId: new mongoose.Types.ObjectId(),
        designationStatus: 'active',
        designationOrder: 5,
      },
    ]);

    designationIds = designations.map(d => new mongoose.Types.ObjectId(d._id));

    // Create agents
    const agents = await AgentModel.create([
      {
        userId: new mongoose.Types.ObjectId(),
        channelId,
        designationId: designationIds[0],
        agentCode: 'AGT001',
        firstName: 'John',
        lastName: 'Doe',
        agentStatus: 'active',
        email: 'john.doe@example.com',
        phoneNumber: '91234567001',
      },
      {
        userId: new mongoose.Types.ObjectId(),
        channelId,
        designationId: designationIds[1],
        agentCode: 'AGT002',
        firstName: 'Jane',
        lastName: 'Smith',
        agentStatus: 'active',
        email: 'jane.smith@example.com',
        phoneNumber: '91234567002',
      },
      {
        userId: new mongoose.Types.ObjectId(),
        channelId,
        designationId: designationIds[2],
        agentCode: 'AGT003',
        firstName: 'Bob',
        lastName: 'Johnson',
        agentStatus: 'active',
        email: 'bob.johnson@example.com',
        phoneNumber: '91234567003',
      },
    ]);

    agentIds = agents.map(a => new mongoose.Types.ObjectId(a._id));
  });

  afterEach(async () => {
    // Clear all collections after each test
    await Promise.all([
      AgentModel.deleteMany({}),
      DesignationModel.deleteMany({}),
      HierarchyModel.deleteMany({}),
    ]);
  });

  describe('GET /api/hierarchies/agent/:agentId', () => {
    it('should return hierarchies for a valid agent ID', async () => {
      const response = await request(app.getApp())
        .get(`/api/hierarchies/agent/${agentIds[2].toString()}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('hierarchies');
      expect(Array.isArray(response.body.data.hierarchies)).toBe(true);
      expect(response.body.data.hierarchies).toHaveLength(2);
    });

    it('should return 404 for non-existent agent ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();

      const response = await request(app.getApp())
        .get(`/api/hierarchies/agent/${nonExistentId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid agent ID format', async () => {
      const response = await request(app.getApp())
        .get('/api/hierarchies/agent/invalid-id')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/hierarchies/channel/:channelId/designation', () => {
    it('should return agents under a designation hierarchy', async () => {
      const response = await request(app.getApp())
        .get(`/api/hierarchies/channel/${channelId.toString()}/designation`)
        .query({ designationName: 'Manager L5' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0]).toHaveProperty('agentId');
      expect(response.body.data[0]).toHaveProperty('fullName');
    });

    it('should return 404 for non-existent designation', async () => {
      const response = await request(app.getApp())
        .get(`/api/hierarchies/channel/${channelId.toString()}/designation`)
        .query({ designationName: 'Non Existent' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return empty array for designation with no lower hierarchies', async () => {
      const response = await request(app.getApp())
        .get(`/api/hierarchies/channel/${channelId.toString()}/designation`)
        .query({ designationName: 'Manager L1' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data).toHaveLength(0);
    });

    it('should return 400 for missing designation name', async () => {
      const response = await request(app.getApp())
        .get(`/api/hierarchies/channel/${channelId.toString()}/designation`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid channel ID format', async () => {
      const response = await request(app.getApp())
        .get('/api/hierarchies/channel/invalid-id/designation')
        .query({ designationName: 'Manager L5' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});
