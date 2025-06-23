import * as dbHandler from 'tests/integration/setup';
import { ModuleConfigModel } from '@/models/module-config.model';
import { ModuleModel } from '@/models/module.model';
import { Types } from 'mongoose';

jest.setTimeout(30000);

describe('Module Config Integration Tests', () => {
  beforeAll(async () => {
    await dbHandler.connect();
  });

  afterAll(async () => {
    await dbHandler.closeDatabase();
  });

  afterEach(async () => {
    await dbHandler.clearDatabase();
  });

  describe('Module Config Model', () => {
    // Create a module first to use as a reference
    let moduleId: Types.ObjectId;

    beforeEach(async () => {
      // Create a module to use for the module config tests
      const moduleData = {
        name: 'Test Module',
        code: 'TEST_MOD', // Shortened to fit within 10 characters
        description: 'Test module description',
        defaultConfig: {},
        isActive: true,
        isCore: false,
        version: '1.0.0',
      };

      const module = await new ModuleModel(moduleData).save();
      moduleId = module._id as unknown as Types.ObjectId;
    });

    it('should create a new module config successfully', async () => {
      const configData = {
        moduleId: moduleId,
        configName: 'Test Config',
        description: 'Test configuration for module',
        fields: [
          {
            fieldName: 'testField',
            fieldType: 'string',
            description: 'A test field',
            values: ['value1', 'value2'],
          },
        ],
        metadata: {
          version: '1.0.0',
        },
      };

      const moduleConfig = new ModuleConfigModel(configData);
      const savedConfig = await moduleConfig.save();

      expect(savedConfig._id).toBeDefined();
      expect(savedConfig.configName).toBe(configData.configName);
      expect(savedConfig.fields.length).toBe(1);
      expect(savedConfig.fields[0].fieldName).toBe('testField');
      expect(savedConfig.metadata).toEqual(configData.metadata);
    });

    it('should find a module config by ID', async () => {
      const configData = {
        moduleId: moduleId,
        configName: 'Test Config',
        description: 'Test configuration for module',
        fields: [
          {
            fieldName: 'testField',
            fieldType: 'string',
            description: 'A test field',
            values: ['value1', 'value2'],
          },
        ],
      };

      const savedConfig = await new ModuleConfigModel(configData).save();
      const foundConfig = await ModuleConfigModel.findById(savedConfig._id);

      expect(foundConfig).not.toBeNull();
      expect(foundConfig?.configName).toBe(configData.configName);
    });

    it('should update a module config', async () => {
      const configData = {
        moduleId: moduleId,
        configName: 'Test Config',
        description: 'Test configuration for module',
        fields: [
          {
            fieldName: 'testField',
            fieldType: 'string',
            description: 'A test field',
            values: ['value1', 'value2'],
          },
        ],
      };

      const savedConfig = await new ModuleConfigModel(configData).save();

      const updatedConfig = await ModuleConfigModel.findByIdAndUpdate(
        savedConfig._id,
        {
          description: 'Updated description',
          fields: [
            {
              fieldName: 'updatedField',
              fieldType: 'number',
              description: 'An updated field',
              values: [1, 2, 3],
            },
          ],
        },
        { new: true },
      );

      expect(updatedConfig).not.toBeNull();
      expect(updatedConfig?.description).toBe('Updated description');
      expect(updatedConfig?.fields.length).toBe(1);
      expect(updatedConfig?.fields[0].fieldName).toBe('updatedField');
    });

    it('should soft delete a module config', async () => {
      const configData = {
        moduleId: moduleId,
        configName: 'Test Config',
        description: 'Test configuration for module',
        fields: [
          {
            fieldName: 'testField',
            fieldType: 'string',
            description: 'A test field',
            values: ['value1', 'value2'],
          },
        ],
      };

      const savedConfig = await new ModuleConfigModel(configData).save();

      const deletedConfig = await ModuleConfigModel.findByIdAndUpdate(
        savedConfig._id,
        { isDeleted: true, deletedAt: new Date() },
        { new: true },
      );

      expect(deletedConfig).not.toBeNull();
      expect(deletedConfig?.isDeleted).toBe(true);
      expect(deletedConfig?.deletedAt).toBeDefined();
    });
  });
});
