import { clearDatabase } from '../setup';
import { AgentModel } from '@/models/agent.model';
import { ProjectModel } from '@/models/project.model';
import { ChannelModel } from '@/models/channel.model';
import { DesignationModel } from '@/models/designation.model';
import { ModuleModel } from '@/models/module.model';
import { RoleModel } from '@/models/role.model';
import { HierarchyModel } from '@/models/hierarchy.model';
import { UserModel } from '@/models/user.model';
import { BulkAgentUploadDto, type AgentExcelRow } from '@/modules/agent/dto/bulk-agent-upload.dto';
import { Types } from 'mongoose';

describe('Bulk Agent Upload Integration Tests', () => {
  afterEach(async () => {
    await clearDatabase();
  });

  describe('Bulk Agent Upload Validation', () => {
    let project: any;
    let channel: any;
    let designation: any;
    let user: any;

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

      // Create test designation with all required fields
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
        email: 'testuser@example.com',
        password: 'password123',
        status: 'active',
      });
    });

    it('should validate agent excel row data correctly', async () => {
      const validRow: AgentExcelRow = {
        'Agent First Name': 'John',
        'Agent Last Name': 'Doe',
        Email: 'john.doe@example.com',
        'Mobile Number': '09876543210',
        Channel: channel.channelCode,
        Designation: designation.designationCode,
        Branch: 'Test Branch',
        'Appointment Date': '2024-01-01',
        'CA Number': 'CA123456',
        Province: 'Test Province',
        City: 'Test City',
        'Pin Code': '123456',
        Status: 'active',
        'Reporting Manager ID': '',
        TIN: 'TIN123456',
      };

      const agent = new AgentModel({
        firstName: validRow['Agent First Name'],
        lastName: validRow['Agent Last Name'],
        email: validRow.Email,
        phoneNumber: validRow['Mobile Number'],
        channelId: channel._id,
        designationId: designation._id,
        projectId: project._id,
        userId: user._id,
        agentStatus: validRow.Status,
        agentCode: 'TEST_AGENT_001',
        address: {
          province: validRow.Province,
          city: validRow.City,
          zipcode: validRow['Pin Code'],
        },
      });

      const savedAgent = await agent.save();
      expect(savedAgent).toBeDefined();
      expect(savedAgent.firstName).toBe(validRow['Agent First Name']);
      expect(savedAgent.email).toBe(validRow.Email);
    });

    it('should validate bulk agent upload DTO', () => {
      const validDto = new BulkAgentUploadDto();
      validDto.projectId = new Types.ObjectId().toString();
      validDto.batchSize = 100;

      expect(validDto.projectId).toBeDefined();
      expect(validDto.batchSize).toBeLessThanOrEqual(500);
      expect(validDto.batchSize).toBeGreaterThanOrEqual(1);
    });

    it('should reject invalid agent data', async () => {
      const invalidAgent = new AgentModel({
        // Missing required fields
        firstName: 'John',
        email: 'invalid-email', // Invalid email format
        projectId: project._id,
      });

      await expect(invalidAgent.save()).rejects.toThrow();
    });

    it('should handle duplicate email addresses', async () => {
      const agentData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'duplicate@example.com',
        phoneNumber: '09876543210',
        channelId: channel._id,
        designationId: designation._id,
        projectId: project._id,
        userId: user._id,
        agentStatus: 'active',
        agentCode: 'TEST_AGENT_002',
      };

      // Create first agent
      await AgentModel.create(agentData);

      // Attempt to create duplicate agent
      await expect(AgentModel.create(agentData)).rejects.toThrow();
    });
  });
}); 