import { ModuleModel } from '@/models/module.model';
import * as dbHandler from 'tests/integration/setup';

jest.setTimeout(30000);

describe('Module Integration Tests', () => {
  beforeAll(async () => {
    await dbHandler.connect();
  });

  afterAll(async () => {
    await dbHandler.closeDatabase();
  });

  afterEach(async () => {
    await dbHandler.clearDatabase();
  });

  describe('Module Model', () => {
    const defaultModuleData = {
      name: 'Test Module',
      code: 'TEST_MOD',
      description: 'Test module description',
      defaultConfig: [
        {
          fieldName: 'testField',
          fieldType: 'string',
          description: 'Test field description',
          values: ['value1', 'value2'],
        },
      ],
      isActive: true,
      isCore: false,
      version: '1.0.0',
      dependencies: [],
      permissions: ['test.view', 'test.edit'],
    };

    it('should create a new module successfully', async () => {
      const module = new ModuleModel(defaultModuleData);
      const savedModule = await module.save();

      expect(savedModule._id).toBeDefined();
      expect(savedModule.name).toBe(defaultModuleData.name);
      expect(savedModule.code).toBe(defaultModuleData.code);
      expect(savedModule.version).toBe(defaultModuleData.version);
      expect(savedModule.permissions).toEqual(defaultModuleData.permissions);
      expect(savedModule.defaultConfig[0].fieldName).toBe(
        defaultModuleData.defaultConfig[0].fieldName,
      );
      expect(savedModule.defaultConfig[0].fieldType).toBe(
        defaultModuleData.defaultConfig[0].fieldType,
      );
    });

    it('should not create a module with duplicate code', async () => {
      await ModuleModel.create(defaultModuleData);

      // Try to create another module with the same code
      await expect(
        ModuleModel.create({
          ...defaultModuleData,
          name: 'Another Module',
        }),
      ).rejects.toThrow(/E11000 duplicate key error/);
    });

    it('should find a module by ID', async () => {
      const savedModule = await new ModuleModel(defaultModuleData).save();
      const foundModule = await ModuleModel.findById(savedModule._id);

      expect(foundModule).not.toBeNull();
      expect(foundModule?.name).toBe(defaultModuleData.name);
      expect(foundModule?.defaultConfig[0].fieldName).toBe(
        defaultModuleData.defaultConfig[0].fieldName,
      );
    });

    it('should update a module', async () => {
      const savedModule = await new ModuleModel(defaultModuleData).save();

      const updatedModule = await ModuleModel.findByIdAndUpdate(
        savedModule._id,
        {
          name: 'Updated Module Name',
          version: '1.1.0',
          defaultConfig: [
            {
              fieldName: 'updatedField',
              fieldType: 'number',
              description: 'Updated field description',
              values: [1, 2, 3],
            },
          ],
        },
        { new: true },
      );

      expect(updatedModule).not.toBeNull();
      expect(updatedModule?.name).toBe('Updated Module Name');
      expect(updatedModule?.version).toBe('1.1.0');
      expect(updatedModule?.defaultConfig[0].fieldName).toBe('updatedField');
      expect(updatedModule?.defaultConfig[0].fieldType).toBe('number');
    });

    it('should soft delete a module', async () => {
      const savedModule = await new ModuleModel(defaultModuleData).save();

      const deletedModule = await ModuleModel.findByIdAndUpdate(
        savedModule._id,
        { isDeleted: true, deletedAt: new Date() },
        { new: true },
      );

      expect(deletedModule).not.toBeNull();
      expect(deletedModule?.isDeleted).toBe(true);
      expect(deletedModule?.deletedAt).toBeDefined();
    });
  });
});
