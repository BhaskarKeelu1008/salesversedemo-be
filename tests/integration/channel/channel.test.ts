import { connect, clearDatabase, closeDatabase } from '../setup';
import { ChannelModel } from '@/models/channel.model';
import { Types } from 'mongoose';
import { ProjectModel, type IProject } from '@/models/project.model';

describe('Database Test Setup', () => {
  it('MongoDB memory server functions should be defined', () => {
    expect(connect).toBeDefined();
    expect(clearDatabase).toBeDefined();
    expect(closeDatabase).toBeDefined();
  });
});

describe('Channel Integration Tests', () => {
  beforeAll(async () => {
    await connect();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  describe('Channel Model', () => {
    let projectId: Types.ObjectId;

    beforeEach(async () => {
      // Create a project first since it's required for channel
      const moduleId = new Types.ObjectId();
      const project = await ProjectModel.create({
        projectName: 'Test Project',
        projectCode: 'TEST_PROJ',
        projectStatus: 'active',
        modules: [{ moduleId, isActive: true, config: {} }],
        isDeleted: false,
      } as IProject);
      projectId = project._id as unknown as Types.ObjectId;
    });

    it('should create a new channel successfully', async () => {
      const channelData = {
        channelName: 'Test Channel',
        channelCode: 'TEST_CH',
        channelStatus: 'active',
        projectId: projectId,
      };

      const channel = await ChannelModel.create(channelData);

      expect(channel._id).toBeDefined();
      expect(channel.channelName).toBe(channelData.channelName);
      expect(channel.channelCode).toBe(channelData.channelCode);
      expect(channel.channelStatus).toBe(channelData.channelStatus);
      expect(channel.projectId.toString()).toBe(projectId.toString());
      expect(channel.isDeleted).toBe(false);
      expect(channel.createdAt).toBeDefined();
      expect(channel.updatedAt).toBeDefined();
    });

    it('should not create a channel with duplicate code', async () => {
      const channelData = {
        channelName: 'Test Channel',
        channelCode: 'TEST_CH',
        channelStatus: 'active',
        projectId: projectId,
      };

      await ChannelModel.create(channelData);

      // Try to create another channel with the same code
      await expect(async () => {
        await ChannelModel.create({
          ...channelData,
          channelName: 'Different Name',
        });
      }).rejects.toThrow(/duplicate key error/);
    });

    it('should find a channel by ID', async () => {
      const channelData = {
        channelName: 'Test Channel',
        channelCode: 'TEST_CH',
        channelStatus: 'active',
        projectId: projectId,
      };

      const createdChannel = await ChannelModel.create(channelData);
      const foundChannel = await ChannelModel.findById(createdChannel._id);

      expect(foundChannel).toBeDefined();
      expect(foundChannel?.channelName).toBe(channelData.channelName);
      expect(foundChannel?.channelCode).toBe(channelData.channelCode);
    });

    it('should update a channel', async () => {
      const channelData = {
        channelName: 'Test Channel',
        channelCode: 'TEST_CH',
        channelStatus: 'active',
        projectId: projectId,
      };

      const channel = await ChannelModel.create(channelData);
      const updatedName = 'Updated Channel Name';

      await ChannelModel.findByIdAndUpdate(
        channel._id,
        { channelName: updatedName },
        { new: true },
      );

      const updatedChannel = await ChannelModel.findById(channel._id);
      expect(updatedChannel?.channelName).toBe(updatedName);
    });

    it('should soft delete a channel', async () => {
      const channelData = {
        channelName: 'Test Channel',
        channelCode: 'TEST_CH',
        channelStatus: 'active',
        projectId: projectId,
      };

      const channel = await ChannelModel.create(channelData);

      await ChannelModel.findByIdAndUpdate(
        channel._id,
        {
          isDeleted: true,
          deletedAt: new Date(),
        },
        { new: true },
      );

      const deletedChannel = await ChannelModel.findById(channel._id);
      expect(deletedChannel?.isDeleted).toBe(true);
      expect(deletedChannel?.deletedAt).toBeDefined();
    });
  });
});
