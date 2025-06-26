import { clearDatabase } from '../setup';
import { AccessControlModel } from '@/models/access-control.model';
import { ProjectModel } from '@/models/project.model';
import { ChannelModel } from '@/models/channel.model';
import { ModuleModel } from '@/models/module.model';
import { RoleModel } from '@/models/role.model';
import { Types } from 'mongoose';

describe('Access Control Integration Tests', () => {
  afterEach(async () => {
    await clearDatabase();
  });

  describe('Access Control Configuration', () => {
    it('should create access control configuration', async () => {
      // Create test project with all required fields
      const module = await ModuleModel.create({
        name: 'Test Module',
        code: 'TEST_MOD',
        defaultConfig: [],
        version: '1.0.0',
      });

      const project = await ProjectModel.create({
        projectName: 'Test Project',
        projectCode: 'TEST_PROJ',
        projectStatus: 'active',
        modules: [{
          moduleId: module._id,
          isActive: true,
          config: {},
        }],
      });

      const channel = await ChannelModel.create({
        channelName: 'Test Channel',
        channelCode: 'TEST_CHAN',
        projectId: project._id,
        channelStatus: 'active',
      });

      const role = await RoleModel.create({
        channelId: channel._id,
        roleName: 'Test Role',
        roleCode: 1001,
        status: 'active',
      });

      // Create access control configuration
      const accessControlData = {
        projectId: project._id,
        channelId: channel._id,
        moduleConfigs: [
          {
            moduleId: module._id,
            roleConfigs: [
              {
                roleId: role._id,
                status: true,
              },
            ],
          },
        ],
      };

      const accessControl = await AccessControlModel.create(accessControlData);

      // Verify the created configuration
      expect(accessControl).toBeDefined();
      expect(accessControl.projectId.toString()).toBe(project._id.toString());
      expect(accessControl.channelId.toString()).toBe(channel._id.toString());
      expect(accessControl.moduleConfigs).toHaveLength(1);
      expect(accessControl.moduleConfigs[0].moduleId.toString()).toBe(module._id.toString());
      expect(accessControl.moduleConfigs[0].roleConfigs).toHaveLength(1);
      expect(accessControl.moduleConfigs[0].roleConfigs[0].roleId.toString()).toBe(role._id.toString());
      expect(accessControl.moduleConfigs[0].roleConfigs[0].status).toBe(true);
    });

    it('should enforce unique project and channel combination', async () => {
      // Create test project with all required fields
      const module = await ModuleModel.create({
        name: 'Test Module',
        code: 'TEST_MOD',
        defaultConfig: [],
        version: '1.0.0',
      });

      const project = await ProjectModel.create({
        projectName: 'Test Project',
        projectCode: 'TEST_PROJ',
        projectStatus: 'active',
        modules: [{
          moduleId: module._id,
          isActive: true,
          config: {},
        }],
      });

      const channel = await ChannelModel.create({
        channelName: 'Test Channel',
        channelCode: 'TEST_CHAN',
        projectId: project._id,
        channelStatus: 'active',
      });

      const role = await RoleModel.create({
        channelId: channel._id,
        roleName: 'Test Role',
        roleCode: 1001,
        status: 'active',
      });

      const accessControlData = {
        projectId: project._id,
        channelId: channel._id,
        moduleConfigs: [
          {
            moduleId: module._id,
            roleConfigs: [
              {
                roleId: role._id,
                status: true,
              },
            ],
          },
        ],
      };

      // Create first configuration
      await AccessControlModel.create(accessControlData);

      // Attempt to create duplicate configuration
      await expect(AccessControlModel.create(accessControlData)).rejects.toThrow();
    });

    it('should validate required module configurations', async () => {
      // Create test project with all required fields
      const module = await ModuleModel.create({
        name: 'Test Module',
        code: 'TEST_MOD',
        defaultConfig: [],
        version: '1.0.0',
      });

      const project = await ProjectModel.create({
        projectName: 'Test Project',
        projectCode: 'TEST_PROJ',
        projectStatus: 'active',
        modules: [{
          moduleId: module._id,
          isActive: true,
          config: {},
        }],
      });

      const channel = await ChannelModel.create({
        channelName: 'Test Channel',
        channelCode: 'TEST_CHAN',
        projectId: project._id,
        channelStatus: 'active',
      });

      const invalidAccessControlData = {
        projectId: project._id,
        channelId: channel._id,
        moduleConfigs: [], // Empty module configs should fail validation
      };

      await expect(AccessControlModel.create(invalidAccessControlData)).rejects.toThrow();
    });
  });
}); 