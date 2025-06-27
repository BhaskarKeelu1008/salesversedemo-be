import { ModuleModel, type IModule } from '@/models/module.model';
import { VALIDATION } from '@/common/constants/http-status.constants';
import mongoose from 'mongoose';

describe('ModuleModel', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await ModuleModel.deleteMany({});
  });

  describe('schema validation', () => {
    it('should create a valid module', async () => {
      const validModule = {
        name: 'Test Module',
        code: 'TEST_MOD',
        description: 'Test Description',
        accessControl: true,
        defaultConfig: [
          {
            fieldName: 'testField',
            fieldType: 'string',
            description: 'Test field',
            values: ['value1', 'value2'],
          },
        ],
        isActive: true,
        isCore: false,
        version: '1.0.0',
        dependencies: ['dep1', 'dep2'],
        permissions: ['read', 'write'],
      };

      const module = new ModuleModel(validModule);
      const validationError = module.validateSync();
      expect(validationError).toBeUndefined();

      const savedModule = await module.save();
      expect(savedModule._id).toBeDefined();
      expect(savedModule.name).toBe(validModule.name);
      expect(savedModule.code).toBe(validModule.code);
      expect(savedModule.description).toBe(validModule.description);
      expect(savedModule.accessControl).toBe(validModule.accessControl);
      expect(savedModule.defaultConfig).toEqual(validModule.defaultConfig);
      expect(savedModule.isActive).toBe(validModule.isActive);
      expect(savedModule.isCore).toBe(validModule.isCore);
      expect(savedModule.version).toBe(validModule.version);
      expect(savedModule.dependencies).toEqual(validModule.dependencies);
      expect(savedModule.permissions).toEqual(validModule.permissions);
      expect(savedModule.isDeleted).toBe(false);
      expect(savedModule.deletedAt).toBeNull();
      expect(savedModule.createdAt).toBeDefined();
      expect(savedModule.updatedAt).toBeDefined();
    });

    it('should require name field', async () => {
      const moduleWithoutName = new ModuleModel({
        code: 'TEST_MOD',
        defaultConfig: [
          {
            fieldName: 'testField',
            fieldType: 'string',
            values: ['value1'],
          },
        ],
        version: '1.0.0',
      });

      const validationError = moduleWithoutName.validateSync();
      expect(validationError?.errors.name).toBeDefined();
      expect(validationError?.errors.name.message).toBe('Module name is required');
    });

    it('should require code field', async () => {
      const moduleWithoutCode = new ModuleModel({
        name: 'Test Module',
        defaultConfig: [
          {
            fieldName: 'testField',
            fieldType: 'string',
            values: ['value1'],
          },
        ],
        version: '1.0.0',
      });

      const validationError = moduleWithoutCode.validateSync();
      expect(validationError?.errors.code).toBeDefined();
      expect(validationError?.errors.code.message).toBe('Module code is required');
    });

    it('should enforce code format', async () => {
      const moduleWithInvalidCode = new ModuleModel({
        name: 'Test Module',
        code: 'invalid-code',
        defaultConfig: [
          {
            fieldName: 'testField',
            fieldType: 'string',
            values: ['value1'],
          },
        ],
        version: '1.0.0',
      });

      const validationError = moduleWithInvalidCode.validateSync();
      expect(validationError?.errors.code).toBeDefined();
      expect(validationError?.errors.code.message).toBe(
        'Module code can only contain uppercase letters, numbers, and underscores',
      );
    });

    it('should enforce name length limit', async () => {
      const moduleWithLongName = new ModuleModel({
        name: 'a'.repeat(VALIDATION.MAX_NAME_LENGTH + 1),
        code: 'TEST_MOD',
        defaultConfig: [
          {
            fieldName: 'testField',
            fieldType: 'string',
            values: ['value1'],
          },
        ],
        version: '1.0.0',
      });

      const validationError = moduleWithLongName.validateSync();
      expect(validationError?.errors.name).toBeDefined();
      expect(validationError?.errors.name.message).toBe(
        `Module name cannot exceed ${VALIDATION.MAX_NAME_LENGTH} characters`,
      );
    });

    it('should enforce code length limit', async () => {
      const moduleWithLongCode = new ModuleModel({
        name: 'Test Module',
        code: 'A'.repeat(VALIDATION.MAX_CODE_LENGTH + 1),
        defaultConfig: [
          {
            fieldName: 'testField',
            fieldType: 'string',
            values: ['value1'],
          },
        ],
        version: '1.0.0',
      });

      const validationError = moduleWithLongCode.validateSync();
      expect(validationError?.errors.code).toBeDefined();
      expect(validationError?.errors.code.message).toBe(
        `Module code cannot exceed ${VALIDATION.MAX_CODE_LENGTH} characters`,
      );
    });

    it('should enforce description length limit', async () => {
      const moduleWithLongDescription = new ModuleModel({
        name: 'Test Module',
        code: 'TEST_MOD',
        description: 'a'.repeat(VALIDATION.MAX_DESCRIPTION_LENGTH + 1),
        defaultConfig: [
          {
            fieldName: 'testField',
            fieldType: 'string',
            values: ['value1'],
          },
        ],
        version: '1.0.0',
      });

      const validationError = moduleWithLongDescription.validateSync();
      expect(validationError?.errors.description).toBeDefined();
      expect(validationError?.errors.description.message).toBe(
        `Description cannot exceed ${VALIDATION.MAX_DESCRIPTION_LENGTH} characters`,
      );
    });

    it('should require defaultConfig field', async () => {
      const moduleWithoutConfig = new ModuleModel({
        name: 'Test Module',
        code: 'TEST_MOD',
        version: '1.0.0',
      });

      const validationError = moduleWithoutConfig.validateSync();
      expect(validationError?.errors.defaultConfig).toBeDefined();
    });

    it('should require version field', async () => {
      const moduleWithoutVersion = new ModuleModel({
        name: 'Test Module',
        code: 'TEST_MOD',
        defaultConfig: [
          {
            fieldName: 'testField',
            fieldType: 'string',
            values: ['value1'],
          },
        ],
      });

      const validationError = moduleWithoutVersion.validateSync();
      expect(validationError?.errors.version).toBeDefined();
      expect(validationError?.errors.version.message).toBe('Module version is required');
    });

    it('should set default values correctly', async () => {
      const moduleWithDefaults = new ModuleModel({
        name: 'Test Module',
        code: 'TEST_MOD',
        defaultConfig: [
          {
            fieldName: 'testField',
            fieldType: 'string',
            values: ['value1'],
          },
        ],
        version: '1.0.0',
      });

      expect(moduleWithDefaults.accessControl).toBe(false);
      expect(moduleWithDefaults.isActive).toBe(true);
      expect(moduleWithDefaults.isCore).toBe(false);
      expect(moduleWithDefaults.version).toBe('1.0.0');
      expect(moduleWithDefaults.isDeleted).toBe(false);
      expect(moduleWithDefaults.deletedAt).toBeNull();
    });

    it('should enforce unique code constraint', async () => {
      const module1 = new ModuleModel({
        name: 'Test Module 1',
        code: 'TEST_MOD',
        defaultConfig: [
          {
            fieldName: 'testField',
            fieldType: 'string',
            values: ['value1'],
          },
        ],
        version: '1.0.0',
      });

      await module1.save();

      const module2 = new ModuleModel({
        name: 'Test Module 2',
        code: 'TEST_MOD', // Same code as module1
        defaultConfig: [
          {
            fieldName: 'testField',
            fieldType: 'string',
            values: ['value1'],
          },
        ],
        version: '1.0.0',
      });

      await expect(module2.save()).rejects.toThrow();
    });

    it('should validate config field structure', async () => {
      const moduleWithInvalidConfig = new ModuleModel({
        name: 'Test Module',
        code: 'TEST_MOD',
        defaultConfig: [
          {
            // Missing required fields
            description: 'Test field',
          },
        ],
        version: '1.0.0',
      });

      const validationError = moduleWithInvalidConfig.validateSync();
      expect(validationError?.errors['defaultConfig.0.fieldName']).toBeDefined();
      expect(validationError?.errors['defaultConfig.0.fieldType']).toBeDefined();
      expect(validationError?.errors['defaultConfig.0.values']).toBeDefined();
    });

    it('should allow flexible config field values', async () => {
      const moduleWithFlexibleConfig = new ModuleModel({
        name: 'Test Module',
        code: 'TEST_MOD',
        defaultConfig: [
          {
            fieldName: 'stringField',
            fieldType: 'string',
            values: ['value1', 'value2'],
          },
          {
            fieldName: 'numberField',
            fieldType: 'number',
            values: [1, 2, 3],
          },
          {
            fieldName: 'objectField',
            fieldType: 'object',
            values: [{ key: 'value' }],
          },
          {
            fieldName: 'arrayField',
            fieldType: 'array',
            values: [[1, 2, 3]],
          },
        ],
        version: '1.0.0',
      });

      const validationError = moduleWithFlexibleConfig.validateSync();
      expect(validationError).toBeUndefined();

      const savedModule = await moduleWithFlexibleConfig.save();
      expect(savedModule.defaultConfig).toHaveLength(4);
      expect(savedModule.defaultConfig[0].values).toEqual(['value1', 'value2']);
      expect(savedModule.defaultConfig[1].values).toEqual([1, 2, 3]);
      expect(savedModule.defaultConfig[2].values).toEqual([{ key: 'value' }]);
      expect(savedModule.defaultConfig[3].values).toEqual([[1, 2, 3]]);
    });
  });
}); 