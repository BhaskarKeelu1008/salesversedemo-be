import { AccessControlResponseDto } from '@/modules/accessControl/dto/access-control-response.dto';
import type { IAccessControl } from '@/models/access-control.model';
import { Types } from 'mongoose';

describe('AccessControlResponseDto', () => {
  describe('constructor', () => {
    it('should transform access control data correctly', () => {
      const mockAccessControl = {
        _id: new Types.ObjectId('507f1f77bcf86cd799439013'),
        projectId: new Types.ObjectId('507f1f77bcf86cd799439011'),
        channelId: new Types.ObjectId('507f1f77bcf86cd799439012'),
        moduleConfigs: [
          {
            moduleId: {
              _id: new Types.ObjectId('507f1f77bcf86cd799439014'),
              name: 'Test Module',
              code: 'TEST_MOD',
            },
            roleConfigs: [
              {
                roleId: {
                  _id: new Types.ObjectId('507f1f77bcf86cd799439015'),
                  roleName: 'Test Role',
                  roleCode: 101,
                },
                status: true,
              },
            ],
          },
        ],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
        isDeleted: false,
        deletedAt: null,
      } as unknown as IAccessControl;

      const dto = new AccessControlResponseDto(mockAccessControl);

      expect(dto).toEqual({
        id: '507f1f77bcf86cd799439013',
        projectId: '507f1f77bcf86cd799439011',
        channelId: '507f1f77bcf86cd799439012',
        moduleConfigs: [
          {
            moduleId: '507f1f77bcf86cd799439014',
            moduleName: 'Test Module',
            moduleCode: 'TEST_MOD',
            roleConfigs: [
              {
                roleId: '507f1f77bcf86cd799439015',
                roleName: 'Test Role',
                roleCode: 101,
                status: true,
              },
            ],
          },
        ],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-02T00:00:00.000Z',
      });
    });

    it('should handle missing optional fields', () => {
      const mockAccessControl = {
        _id: new Types.ObjectId('507f1f77bcf86cd799439013'),
        projectId: new Types.ObjectId('507f1f77bcf86cd799439011'),
        channelId: new Types.ObjectId('507f1f77bcf86cd799439012'),
        moduleConfigs: [
          {
            moduleId: {
              _id: new Types.ObjectId('507f1f77bcf86cd799439014'),
            },
            roleConfigs: [
              {
                roleId: {
                  _id: new Types.ObjectId('507f1f77bcf86cd799439015'),
                },
                status: true,
              },
            ],
          },
        ],
        isDeleted: false,
        deletedAt: null,
      } as unknown as IAccessControl;

      const dto = new AccessControlResponseDto(mockAccessControl);

      expect(dto).toEqual({
        id: '507f1f77bcf86cd799439013',
        projectId: '507f1f77bcf86cd799439011',
        channelId: '507f1f77bcf86cd799439012',
        moduleConfigs: [
          {
            moduleId: '507f1f77bcf86cd799439014',
            moduleName: undefined,
            moduleCode: undefined,
            roleConfigs: [
              {
                roleId: '507f1f77bcf86cd799439015',
                roleName: undefined,
                roleCode: undefined,
                status: true,
              },
            ],
          },
        ],
        createdAt: undefined,
        updatedAt: undefined,
      });
    });

    it('should handle empty module configs array', () => {
      const mockAccessControl = {
        _id: new Types.ObjectId('507f1f77bcf86cd799439013'),
        projectId: new Types.ObjectId('507f1f77bcf86cd799439011'),
        channelId: new Types.ObjectId('507f1f77bcf86cd799439012'),
        moduleConfigs: [],
        isDeleted: false,
        deletedAt: null,
      } as unknown as IAccessControl;

      const dto = new AccessControlResponseDto(mockAccessControl);

      expect(dto).toEqual({
        id: '507f1f77bcf86cd799439013',
        projectId: '507f1f77bcf86cd799439011',
        channelId: '507f1f77bcf86cd799439012',
        moduleConfigs: [],
        createdAt: undefined,
        updatedAt: undefined,
      });
    });

    it('should handle null values in nested objects', () => {
      const mockAccessControl = {
        _id: new Types.ObjectId('507f1f77bcf86cd799439013'),
        projectId: new Types.ObjectId('507f1f77bcf86cd799439011'),
        channelId: new Types.ObjectId('507f1f77bcf86cd799439012'),
        moduleConfigs: [
          {
            moduleId: null,
            roleConfigs: [
              {
                roleId: null,
                status: true,
              },
            ],
          },
        ],
        isDeleted: false,
        deletedAt: null,
      } as unknown as IAccessControl;

      const dto = new AccessControlResponseDto(mockAccessControl);

      expect(dto).toEqual({
        id: '507f1f77bcf86cd799439013',
        projectId: '507f1f77bcf86cd799439011',
        channelId: '507f1f77bcf86cd799439012',
        moduleConfigs: [
          {
            moduleId: null,
            moduleName: undefined,
            moduleCode: undefined,
            roleConfigs: [
              {
                roleId: null,
                roleName: undefined,
                roleCode: undefined,
                status: true,
              },
            ],
          },
        ],
        createdAt: undefined,
        updatedAt: undefined,
      });
    });
  });
}); 