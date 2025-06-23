import * as dbHandler from 'tests/integration/setup';
import { ProjectModel } from '@/models/project.model';
import { Types } from 'mongoose';

jest.setTimeout(30000);

describe('Project Integration Tests', () => {
  beforeAll(async () => {
    await dbHandler.connect();
  });

  afterAll(async () => {
    await dbHandler.closeDatabase();
  });

  afterEach(async () => {
    await dbHandler.clearDatabase();
  });

  describe('Project Model', () => {
    it('should create a new project successfully', async () => {
      const projectData = {
        projectName: 'Test Project',
        projectCode: 'TEST_PROJ',
        description: 'Test project description',
        modules: [
          {
            moduleId: new Types.ObjectId(),
            isActive: true,
            config: {},
          },
        ],
        projectStatus: 'active',
      };

      const project = new ProjectModel(projectData);
      const savedProject = await project.save();

      expect(savedProject._id).toBeDefined();
      expect(savedProject.projectName).toBe(projectData.projectName);
      expect(savedProject.projectCode).toBe(projectData.projectCode);
      expect(savedProject.modules.length).toBe(1);
      expect(savedProject.projectStatus).toBe(projectData.projectStatus);
    });

    it('should not create a project without modules', async () => {
      const projectData = {
        projectName: 'Test Project',
        projectCode: 'TEST_PROJ',
        description: 'Test project description',
        modules: [],
        projectStatus: 'active',
      };

      const project = new ProjectModel(projectData);
      await expect(project.save()).rejects.toThrow();
    });

    it('should find a project by ID', async () => {
      const projectData = {
        projectName: 'Test Project',
        projectCode: 'TEST_PROJ',
        description: 'Test project description',
        modules: [
          {
            moduleId: new Types.ObjectId(),
            isActive: true,
            config: {},
          },
        ],
        projectStatus: 'active',
      };

      const savedProject = await new ProjectModel(projectData).save();
      const foundProject = await ProjectModel.findById(savedProject._id);

      expect(foundProject).not.toBeNull();
      expect(foundProject?.projectName).toBe(projectData.projectName);
    });

    it('should update a project', async () => {
      const projectData = {
        projectName: 'Test Project',
        projectCode: 'TEST_PROJ',
        description: 'Test project description',
        modules: [
          {
            moduleId: new Types.ObjectId(),
            isActive: true,
            config: {},
          },
        ],
        projectStatus: 'active',
      };

      const savedProject = await new ProjectModel(projectData).save();

      const updatedProject = await ProjectModel.findByIdAndUpdate(
        savedProject._id,
        {
          projectName: 'Updated Project Name',
          description: 'Updated description',
          projectStatus: 'inactive',
        },
        { new: true },
      );

      expect(updatedProject).not.toBeNull();
      expect(updatedProject?.projectName).toBe('Updated Project Name');
      expect(updatedProject?.description).toBe('Updated description');
      expect(updatedProject?.projectStatus).toBe('inactive');
    });

    it('should soft delete a project', async () => {
      const projectData = {
        projectName: 'Test Project',
        projectCode: 'TEST_PROJ',
        description: 'Test project description',
        modules: [
          {
            moduleId: new Types.ObjectId(),
            isActive: true,
            config: {},
          },
        ],
        projectStatus: 'active',
      };

      const savedProject = await new ProjectModel(projectData).save();

      const deletedProject = await ProjectModel.findByIdAndUpdate(
        savedProject._id,
        { isDeleted: true, deletedAt: new Date() },
        { new: true },
      );

      expect(deletedProject).not.toBeNull();
      expect(deletedProject?.isDeleted).toBe(true);
      expect(deletedProject?.deletedAt).toBeDefined();
    });
  });
});
