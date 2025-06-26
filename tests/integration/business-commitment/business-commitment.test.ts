import { connect, clearDatabase, closeDatabase } from '../setup';
import {
  BusinessCommitment,
  type IBusinessCommitment,
} from '@/models/business-commitment.model';
import { AgentModel } from '@/models/agent.model';
import { ProjectModel } from '@/models/project.model';
import { ModuleModel } from '@/models/module.model';
import { ChannelModel } from '@/models/channel.model';
import { DesignationModel } from '@/models/designation.model';
import { RoleModel } from '@/models/role.model';
import { HierarchyModel } from '@/models/hierarchy.model';
import { UserModel } from '@/models/user.model';
import { Types } from 'mongoose';
import type { Response } from 'express';
import { mockRequest, mockResponse } from 'tests/utils/test-utils';
import { BusinessCommitmentController } from '@/modules/business-commitment/business-commitment.controller';
import { plainToClass } from 'class-transformer';
import { CreateBusinessCommitmentDto } from '@/modules/business-commitment/dto/create-business-commitment.dto';
import { UpdateBusinessCommitmentDto } from '@/modules/business-commitment/dto/update-business-commitment.dto';

describe('Business Commitment Integration Tests', () => {
  beforeAll(async () => {
    await connect();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  describe('Business Commitment Operations', () => {
    let project: any;
    let agent: any;
    let channel: any;
    let designation: any;
    let user: any;
    let controller: BusinessCommitmentController;

    beforeEach(async () => {
      // Create test project with all required fields
      const module = await ModuleModel.create({
        name: 'Test Module',
        code: 'TEST_MOD',
        defaultConfig: [],
        version: '1.0.0',
      });

      project = await ProjectModel.create({
        projectName: 'Test Project',
        projectCode: 'TEST_PROJ',
        projectStatus: 'active',
        modules: [{
          moduleId: module._id,
          isActive: true,
          config: {},
        }],
      });

      // Create test channel
      channel = await ChannelModel.create({
        channelName: 'Test Channel',
        channelCode: 'TEST_CHAN',
        projectId: project._id,
        channelStatus: 'active',
      });

      // Create test role
      const role = await RoleModel.create({
        channelId: channel._id,
        roleName: 'Test Role',
        roleCode: 1001,
        status: 'active',
      });

      // Create test hierarchy
      const hierarchy = await HierarchyModel.create({
        channelId: channel._id,
        hierarchyName: 'Test Hierarchy',
        hierarchyLevelCode: 'TEST_LEVEL',
        hierarchyLevel: 1,
        hierarchyOrder: 1,
        hierarchyStatus: 'active',
      });

      // Create test designation
      designation = await DesignationModel.create({
        channelId: channel._id,
        roleId: role._id,
        hierarchyId: hierarchy._id,
        designationName: 'Test Designation',
        designationCode: 'TEST_DESIG',
        designationStatus: 'active',
        designationOrder: 1,
      });

      // Create test user
      user = await UserModel.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        status: 'active',
      });

      // Create test agent with all required fields
      agent = await AgentModel.create({
        agentCode: 'TEST001',
        firstName: 'Test',
        lastName: 'Agent',
        email: 'test@example.com',
        phoneNumber: '09876543210',
        projectId: project._id,
        channelId: channel._id,
        designationId: designation._id,
        userId: user._id,
        agentStatus: 'active',
      });

      controller = new BusinessCommitmentController();
    });

    it('should create a business commitment', async () => {
      const commitmentData = {
        agentId: agent._id,
        commitmentDate: new Date(),
        commitmentCount: 10,
        achievedCount: 0,
        createdBy: agent._id,
      };

      const commitment = await BusinessCommitment.create(commitmentData);

      expect(commitment).toBeDefined();
      expect(commitment.agentId.toString()).toBe(agent._id.toString());
      expect(commitment.commitmentCount).toBe(10);
      expect(commitment.achievedCount).toBe(0);
    });

    it('should update commitment count', async () => {
      const commitment = await BusinessCommitment.create({
        agentId: agent._id,
        commitmentDate: new Date(),
        commitmentCount: 10,
        achievedCount: 0,
        createdBy: agent._id,
      });

      const updatedCommitment = await BusinessCommitment.findByIdAndUpdate(
        commitment._id,
        { $set: { achievedCount: 5 } },
        { new: true },
      );

      expect(updatedCommitment).toBeDefined();
      expect(updatedCommitment?.achievedCount).toBe(5);
    });

    it('should filter commitments by date range', async () => {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      await BusinessCommitment.create({
        agentId: agent._id,
        commitmentDate: today,
        commitmentCount: 10,
        achievedCount: 5,
        createdBy: agent._id,
      });

      await BusinessCommitment.create({
        agentId: agent._id,
        commitmentDate: tomorrow,
        commitmentCount: 15,
        achievedCount: 0,
        createdBy: agent._id,
      });

      const req = mockRequest(
        {},
        {},
        {
          agentId: agent._id.toString(),
          fromDate: today.toISOString().split('T')[0],
          toDate: tomorrow.toISOString().split('T')[0],
        },
      );
      const res = mockResponse();

      await controller.filter(req as any, res as Response);

      expect(res.json).toHaveBeenCalled();
      const response = (res.json as jest.Mock).mock.calls[0][0];
      expect(response.success).toBe(true);
      expect(response.data).toHaveLength(2);
    });

    it('should export commitments to Excel', async () => {
      const today = new Date();
      
      await BusinessCommitment.create({
        agentId: agent._id,
        commitmentDate: today,
        commitmentCount: 10,
        achievedCount: 5,
        createdBy: agent._id,
      });

      const req = mockRequest(
        {},
        {},
        {
          agentId: agent._id.toString(),
          fromDate: today.toISOString().split('T')[0],
          toDate: today.toISOString().split('T')[0],
        },
      );
      const res = mockResponse();

      await controller.exportToExcel(req as any, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalled();
    });

    it('should handle invalid date range for export', async () => {
      const req = mockRequest(
        {},
        {},
        {
          agentId: agent._id.toString(),
          fromDate: 'invalid-date',
          toDate: 'invalid-date',
        },
      );
      const res = mockResponse();

      await controller.exportToExcel(req as any, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.any(String),
        }),
      );
    });

    it('should validate create business commitment DTO', async () => {
      const createDto = plainToClass(CreateBusinessCommitmentDto, {
        agentId: agent._id.toString(),
        commitmentDate: new Date(),
        commitmentCount: 10,
      });

      const req = mockRequest(
        {
          ...createDto,
          createdBy: agent._id.toString(),
        },
      );
      const res = mockResponse();

      await controller.create(req as any, res as Response);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalled();
    });

    it('should validate update business commitment DTO', async () => {
      const commitment = await BusinessCommitment.create({
        agentId: agent._id,
        commitmentDate: new Date(),
        commitmentCount: 10,
        achievedCount: 0,
        createdBy: agent._id,
      });

      const updateDto = plainToClass(UpdateBusinessCommitmentDto, {
        achievedCount: 5,
      });

      const req = mockRequest(
        {
          ...updateDto,
          id: commitment._id.toString(),
        },
        { id: commitment._id.toString() },
      );
      const res = mockResponse();

      await controller.update(req as any, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });
  });
}); 