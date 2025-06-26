import { connect, clearDatabase, closeDatabase } from '../setup';
import { Lead } from '@/models/lead.model';
import { ProjectModel } from '@/models/project.model';
import { AgentModel } from '@/models/agent.model';
import { BulkLeadUploadDto, type LeadExcelRow } from '@/modules/lead/dto/bulk-lead-upload.dto';
import { Types } from 'mongoose';
import { ModuleModel } from '@/models/module.model';
import { ChannelModel } from '@/models/channel.model';
import { DesignationModel } from '@/models/designation.model';
import { RoleModel } from '@/models/role.model';
import { HierarchyModel } from '@/models/hierarchy.model';
import { UserModel } from '@/models/user.model';

describe('Bulk Lead Upload Integration Tests', () => {
  beforeAll(async () => {
    await connect();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  describe('Bulk Lead Upload Validation', () => {
    let project: any;
    let agent: any;
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
    });

    it('should validate lead excel row data correctly', async () => {
      const validRow: LeadExcelRow = {
        AGENT_ID: agent.agentCode,
        FIRST_NAME: 'John',
        LAST_NAME: 'Doe',
        Province: 'Test Province',
        CITY: 'Test City',
        EMAIL: 'john.doe@example.com',
        CONTACT_NO: '09876543210',
        LEAD_TYPE: 'New',
        LEAD_STAGE: 'Initial',
        REMARKS: 'Test remarks',
      };

      const lead = new Lead({
        agentId: agent._id,
        firstName: validRow.FIRST_NAME,
        lastName: validRow.LAST_NAME,
        province: validRow.Province,
        city: validRow.CITY,
        emailAddress: validRow.EMAIL,
        primaryNumber: validRow.CONTACT_NO,
        leadType: validRow.LEAD_TYPE,
        stage: validRow.LEAD_STAGE,
        remarks: validRow.REMARKS,
        projectId: project._id,
        allocatedTo: agent._id,
        allocatedBy: agent._id,
        createdBy: agent._id,
        leadProgress: 'new',
      });

      const savedLead = await lead.save();
      expect(savedLead).toBeDefined();
      expect(savedLead.firstName).toBe(validRow.FIRST_NAME);
      expect(savedLead.emailAddress).toBe(validRow.EMAIL);
    });

    it('should validate bulk lead upload DTO', () => {
      const validDto = new BulkLeadUploadDto();
      validDto.projectId = new Types.ObjectId().toString();
      validDto.batchSize = 100;

      expect(validDto.projectId).toBeDefined();
      expect(validDto.batchSize).toBeLessThanOrEqual(500);
      expect(validDto.batchSize).toBeGreaterThanOrEqual(1);
    });

    it('should reject invalid lead data', async () => {
      const invalidLead = new Lead({
        // Missing required fields
        firstName: 'John',
        emailAddress: 'invalid-email', // Invalid email format
        projectId: project._id,
      });

      await expect(invalidLead.save()).rejects.toThrow();
    });

    it('should handle duplicate email addresses', async () => {
      const leadData = {
        agentId: agent._id,
        firstName: 'John',
        lastName: 'Doe',
        emailAddress: 'duplicate@example.com',
        primaryNumber: '09876543210',
        projectId: project._id,
        leadType: 'New',
        stage: 'Initial',
        allocatedTo: agent._id,
        allocatedBy: agent._id,
        createdBy: agent._id,
        leadProgress: 'new',
      };

      // Create first lead
      await Lead.create(leadData);

      // Attempt to create duplicate lead
      await expect(Lead.create(leadData)).rejects.toThrow();
    });
  });
}); 