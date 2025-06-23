import * as dbHandler from 'tests/integration/setup';
import { ModuleModel } from '@/models/module.model';

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
    it('should create a new module successfully', async () => {
      const moduleData = {
        name: 'Test Module',
        code: 'TEST_MOD', // Shortened to fit within 10 characters
        description: 'Test module description',
        defaultConfig: {},
        isActive: true,
        isCore: false,
        version: '1.0.0',
        dependencies: [],
        permissions: ['test.view', 'test.edit'],
      };

      const module = new ModuleModel(moduleData);
      const savedModule = await module.save();

      expect(savedModule._id).toBeDefined();
      expect(savedModule.name).toBe(moduleData.name);
      expect(savedModule.code).toBe(moduleData.code);
      expect(savedModule.version).toBe(moduleData.version);
      expect(savedModule.permissions).toEqual(moduleData.permissions);
    });
    console.log('test 1');
    it('should not create a module with duplicate code', async () => {
      const moduleData = {
        name: 'Test Module',
        code: 'TEST_MOD',
        description: 'Test module description',
        defaultConfig: {},
        isActive: true,
        isCore: false,
        version: '1.0.0',
      };

      await ModuleModel.create(moduleData);

      // Try to create another module with the same code
      await expect(
        ModuleModel.create({
          ...moduleData,
          name: 'Another Module',
        }),
      ).rejects.toThrow(/E11000 duplicate key error/);
    });

    it('should find a module by ID', async () => {
      const moduleData = {
        name: 'Test Module',
        code: 'TEST_MOD', // Shortened to fit within 10 characters
        description: 'Test module description',
        defaultConfig: {},
        isActive: true,
        isCore: false,
        version: '1.0.0',
      };

      const savedModule = await new ModuleModel(moduleData).save();
      const foundModule = await ModuleModel.findById(savedModule._id);

      expect(foundModule).not.toBeNull();
      expect(foundModule?.name).toBe(moduleData.name);
    });

    it('should update a module', async () => {
      const moduleData = {
        name: 'Test Module',
        code: 'TEST_MOD', // Shortened to fit within 10 characters
        description: 'Test module description',
        defaultConfig: {},
        isActive: true,
        isCore: false,
        version: '1.0.0',
      };

      const savedModule = await new ModuleModel(moduleData).save();

      const updatedModule = await ModuleModel.findByIdAndUpdate(
        savedModule._id,
        { name: 'Updated Module Name', version: '1.1.0' },
        { new: true },
      );

      expect(updatedModule).not.toBeNull();
      expect(updatedModule?.name).toBe('Updated Module Name');
      expect(updatedModule?.version).toBe('1.1.0');
    });

    it('should soft delete a module', async () => {
      const moduleData = {
        name: 'Test Module',
        code: 'TEST_MOD', // Shortened to fit within 10 characters
        description: 'Test module description',
        defaultConfig: {},
        isActive: true,
        isCore: false,
        version: '1.0.0',
      };

      const savedModule = await new ModuleModel(moduleData).save();

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
