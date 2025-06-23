import { connect, clearDatabase, closeDatabase } from '../setup';
import { AgentModel } from '@/models/agent.model';
import { ProjectModel } from '@/models/project.model';
import { ChannelModel } from '@/models/channel.model';
import { DesignationModel } from '@/models/designation.model';
import { UserModel } from '@/models/user.model';
import { Types } from 'mongoose';

describe('Database Test Setup', () => {
  it('MongoDB memory server functions should be defined', () => {
    expect(connect).toBeDefined();
    expect(clearDatabase).toBeDefined();
    expect(closeDatabase).toBeDefined();
  });
});

describe('Agent Integration Tests', () => {
  beforeAll(async () => {
    await connect();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  describe('Agent Model', () => {
    let projectId: Types.ObjectId;
    let channelId: Types.ObjectId;
    let designationId: Types.ObjectId;
    let userId: Types.ObjectId;

    beforeEach(async () => {
      // Create required dependencies
      const project = await ProjectModel.create({
        projectName: 'Test Project',
        projectCode: 'TEST_PROJ',
        projectStatus: 'active',
        modules: [
          { moduleId: new Types.ObjectId(), isActive: true, config: {} },
        ],
        isDeleted: false,
      });
      projectId = project._id as unknown as Types.ObjectId;

      const channel = await ChannelModel.create({
        channelName: 'Test Channel',
        channelCode: 'TEST_CH',
        channelStatus: 'active',
        projectId: projectId,
      });
      channelId = channel._id as unknown as Types.ObjectId;

      const designation = await DesignationModel.create({
        designationName: 'Test Designation',
        designationCode: 'TEST_DES',
        designationStatus: 'active',
        channelId: channelId,
        roleId: new Types.ObjectId(),
        hierarchyId: new Types.ObjectId(),
        designationOrder: 1,
      });
      designationId = designation._id as unknown as Types.ObjectId;

      // Create a user
      const user = await UserModel.create({
        password: 'password',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        phoneNumber: '09876543210',
        status: 'active',
        projectId: projectId,
      });
      userId = user._id as unknown as Types.ObjectId;
    });

    it('should create a new agent successfully', async () => {
      const agentData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phoneNumber: '09123456789',
        agentCode: 'AGT001',
        channelId,
        designationId,
        projectId,
        userId,
        agentStatus: 'active',
        joiningDate: new Date(),
      };

      const agent = await AgentModel.create(agentData);

      expect(agent._id).toBeDefined();
      expect(agent.firstName).toBe(agentData.firstName);
      expect(agent.lastName).toBe(agentData.lastName);
      expect(agent.email).toBe(agentData.email);
      expect(agent.phoneNumber).toBe(agentData.phoneNumber);
      expect(agent.agentCode).toBe(agentData.agentCode);
      expect(agent.channelId!.toString()).toBe(channelId.toString());
      expect(agent.designationId!.toString()).toBe(designationId.toString());
      expect(agent.projectId!.toString()).toBe(projectId.toString());
      expect(agent.userId!.toString()).toBe(userId.toString());
      expect(agent.agentStatus).toBe(agentData.agentStatus);
      expect(agent.isDeleted).toBe(false);
    });

    it('should not create an agent with duplicate agent code', async () => {
      const agentData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password',
        phoneNumber: '09123456789',
        agentCode: 'AGT001',
        channelId,
        designationId,
        projectId,
        userId,
        agentStatus: 'active',
        joiningDate: new Date(),
      };

      await AgentModel.create(agentData);

      // Create another user for the duplicate test
      const anotherUser = await UserModel.create({
        password: 'password',
        email: 'another@example.com',
        firstName: 'Another',
        lastName: 'User',
        phoneNumber: '09876543211',
        status: 'active',
        projectId: projectId,
      });

      // Try to create another agent with the same code
      await expect(async () => {
        await AgentModel.create({
          ...agentData,
          email: 'different.email@example.com',
          phoneNumber: '09987654321',
          userId: anotherUser._id,
        });
      }).rejects.toThrow(/duplicate key error/);
    });

    it('should find an agent by ID', async () => {
      const agentData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password',
        phoneNumber: '09123456789',
        agentCode: 'AGT001',
        channelId,
        designationId,
        projectId,
        userId,
        agentStatus: 'active',
        joiningDate: new Date(),
      };

      const createdAgent = await AgentModel.create(agentData);
      const foundAgent = await AgentModel.findById(createdAgent._id);

      expect(foundAgent).toBeDefined();
      expect(foundAgent?.firstName).toBe(agentData.firstName);
      expect(foundAgent?.lastName).toBe(agentData.lastName);
      expect(foundAgent?.email).toBe(agentData.email);
      expect(foundAgent?.phoneNumber).toBe(agentData.phoneNumber);
      expect(foundAgent?.agentCode).toBe(agentData.agentCode);
      expect(foundAgent?.userId.toString()).toBe(userId.toString());
    });

    it('should update an agent', async () => {
      const agentData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password',
        phoneNumber: '09123456789',
        agentCode: 'AGT001',
        channelId,
        designationId,
        projectId,
        userId,
        agentStatus: 'active',
        joiningDate: new Date(),
      };

      const agent = await AgentModel.create(agentData);
      const updatedFirstName = 'Jane';

      await AgentModel.findByIdAndUpdate(
        agent._id,
        { firstName: updatedFirstName },
        { new: true },
      );

      const updatedAgent = await AgentModel.findById(agent._id);
      expect(updatedAgent?.firstName).toBe(updatedFirstName);
    });

    it('should soft delete an agent', async () => {
      const agentData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password',
        phoneNumber: '09123456789',
        agentCode: 'AGT001',
        channelId,
        designationId,
        projectId,
        userId,
        agentStatus: 'active',
        joiningDate: new Date(),
      };

      const agent = await AgentModel.create(agentData);

      await AgentModel.findByIdAndUpdate(
        agent._id,
        {
          isDeleted: true,
          deletedAt: new Date(),
        },
        { new: true },
      );

      const deletedAgent = await AgentModel.findById(agent._id);
      expect(deletedAgent?.isDeleted).toBe(true);
      expect(deletedAgent?.deletedAt).toBeDefined();
    });
  });
});
