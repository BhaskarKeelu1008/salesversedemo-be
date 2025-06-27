import { AccessControlModel } from '@/models/access-control.model';
import { Types } from 'mongoose';

describe('AccessControlModel', () => {
  describe('schema validation', () => {
    it('should create a valid access control', () => {
      const validAccessControl = new AccessControlModel({
        projectId: new Types.ObjectId(),
        channelId: new Types.ObjectId(),
        moduleConfigs: [
          {
            moduleId: new Types.ObjectId(),
            roleConfigs: [
              {
                roleId: new Types.ObjectId(),
                status: true,
              },
            ],
          },
        ],
      });

      const validationError = validAccessControl.validateSync();
      expect(validationError).toBeUndefined();
    });

    it('should require projectId', () => {
      const invalidAccessControl = new AccessControlModel({
        channelId: new Types.ObjectId(),
        moduleConfigs: [
          {
            moduleId: new Types.ObjectId(),
            roleConfigs: [
              {
                roleId: new Types.ObjectId(),
                status: true,
              },
            ],
          },
        ],
      });

      const validationError = invalidAccessControl.validateSync();
      expect(validationError?.errors.projectId).toBeDefined();
      expect(validationError?.errors.projectId.message).toBe('Project ID is required');
    });

    it('should require channelId', () => {
      const invalidAccessControl = new AccessControlModel({
        projectId: new Types.ObjectId(),
        moduleConfigs: [
          {
            moduleId: new Types.ObjectId(),
            roleConfigs: [
              {
                roleId: new Types.ObjectId(),
                status: true,
              },
            ],
          },
        ],
      });

      const validationError = invalidAccessControl.validateSync();
      expect(validationError?.errors.channelId).toBeDefined();
      expect(validationError?.errors.channelId.message).toBe('Channel ID is required');
    });

    it('should require at least one module config', () => {
      const invalidAccessControl = new AccessControlModel({
        projectId: new Types.ObjectId(),
        channelId: new Types.ObjectId(),
        moduleConfigs: [],
      });

      const validationError = invalidAccessControl.validateSync();
      expect(validationError?.errors['moduleConfigs']).toBeDefined();
      expect(validationError?.errors['moduleConfigs'].message).toBe('At least one module configuration is required');
    });

    it('should require moduleId in module config', () => {
      const invalidAccessControl = new AccessControlModel({
        projectId: new Types.ObjectId(),
        channelId: new Types.ObjectId(),
        moduleConfigs: [
          {
            roleConfigs: [
              {
                roleId: new Types.ObjectId(),
                status: true,
              },
            ],
          },
        ],
      });

      const validationError = invalidAccessControl.validateSync();
      expect(validationError?.errors['moduleConfigs.0.moduleId']).toBeDefined();
      expect(validationError?.errors['moduleConfigs.0.moduleId'].message).toBe('Module ID is required');
    });

    it('should require at least one role config in module config', () => {
      const invalidAccessControl = new AccessControlModel({
        projectId: new Types.ObjectId(),
        channelId: new Types.ObjectId(),
        moduleConfigs: [
          {
            moduleId: new Types.ObjectId(),
            roleConfigs: [],
          },
        ],
      });

      const validationError = invalidAccessControl.validateSync();
      expect(validationError?.errors['moduleConfigs.0.roleConfigs']).toBeDefined();
      expect(validationError?.errors['moduleConfigs.0.roleConfigs'].message).toBe('At least one role configuration is required');
    });

    it('should require roleId in role config', () => {
      const invalidAccessControl = new AccessControlModel({
        projectId: new Types.ObjectId(),
        channelId: new Types.ObjectId(),
        moduleConfigs: [
          {
            moduleId: new Types.ObjectId(),
            roleConfigs: [
              {
                status: true,
              },
            ],
          },
        ],
      });

      const validationError = invalidAccessControl.validateSync();
      expect(validationError?.errors['moduleConfigs.0.roleConfigs.0.roleId']).toBeDefined();
      expect(validationError?.errors['moduleConfigs.0.roleConfigs.0.roleId'].message).toBe('Role ID is required');
    });

    it('should set default values correctly', () => {
      const accessControl = new AccessControlModel({
        projectId: new Types.ObjectId(),
        channelId: new Types.ObjectId(),
        moduleConfigs: [
          {
            moduleId: new Types.ObjectId(),
            roleConfigs: [
              {
                roleId: new Types.ObjectId(),
              },
            ],
          },
        ],
      });

      expect(accessControl.isDeleted).toBe(false);
      expect(accessControl.deletedAt).toBeNull();
      expect(accessControl.moduleConfigs[0].roleConfigs[0].status).toBe(false);
    });
  });
}); 