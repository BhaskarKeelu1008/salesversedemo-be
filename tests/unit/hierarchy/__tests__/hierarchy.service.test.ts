import { HierarchyService } from '@/modules/hierarchy/hierarchy.service';
import { HierarchyRepository } from '@/modules/hierarchy/hierarchy.repository';
import { Types } from 'mongoose';
import { NotFoundException } from '@/common/exceptions/not-found.exception';
import { DatabaseValidationException } from '@/common/exceptions/database.exception';
import type { IHierarchy } from '@/models/hierarchy.model';
import type { CreateHierarchyDto } from '@/modules/hierarchy/dto/create-hierarchy.dto';
import type { HierarchyResponseDto } from '@/modules/hierarchy/dto/hierarchy-response.dto';
import { ChannelModel } from '@/models/channel.model';
import { AgentModel } from '@/models/agent.model';

jest.mock('@/modules/hierarchy/hierarchy.repository');
jest.mock('@/models/channel.model', () => ({
  ChannelModel: {
    findById: jest.fn().mockResolvedValue({ isDeleted: false }),
  },
}));
jest.mock('@/models/agent.model', () => ({
  AgentModel: {
    aggregate: jest.fn().mockResolvedValue([]),
  },
}));

// Define the exact shape we need for tests
interface HierarchyData {
  _id: string;
  channelId: Types.ObjectId;
  hierarchyName: string;
  hierarchyLevelCode: string;
  hierarchyLevel: number;
  hierarchyOrder: number;
  hierarchyStatus: 'active' | 'inactive';
  hierarchyParentId?: Types.ObjectId;
  hierarchyDescription?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

// Extend the repository interface to include missing methods
interface MockHierarchyRepository extends HierarchyRepository {
  getTeamMemberList(channelId: string, userId: string, isTeamMembers: boolean): Promise<unknown[]>;
}

function createMockHierarchyDocument(data: Partial<HierarchyData> = {}): IHierarchy {
  const now = new Date('2025-06-27T10:39:42.068Z');
  const doc = {
    _id: data._id?.toString() || new Types.ObjectId().toString(),
    channelId: data.channelId || new Types.ObjectId(),
    hierarchyName: data.hierarchyName || 'Test Hierarchy',
    hierarchyLevelCode: data.hierarchyLevelCode || 'TEST_LEVEL',
    hierarchyLevel: data.hierarchyLevel || 1,
    hierarchyOrder: data.hierarchyOrder || 0,
    hierarchyStatus: data.hierarchyStatus || 'active',
    hierarchyParentId: data.hierarchyParentId,
    hierarchyDescription: data.hierarchyDescription,
    isDeleted: false,
    createdAt: data.createdAt || now,
    updatedAt: data.updatedAt || now,
    deletedAt: data.deletedAt || null,
  };

  // Cast to unknown first to avoid direct type assertion
  return doc as unknown as IHierarchy;
}

describe('HierarchyService', () => {
  let hierarchyService: HierarchyService;
  let mockHierarchyRepository: jest.Mocked<MockHierarchyRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockHierarchyRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByChannelAndLevel: jest.fn(),
      findByChannel: jest.fn(),
      findChildren: jest.fn(),
      findRootHierarchies: jest.fn(),
      findByLevelCode: jest.fn(),
      findWithPagination: jest.fn(),
      updateById: jest.fn(),
      getTeamMemberList: jest.fn(),
    } as unknown as jest.Mocked<MockHierarchyRepository>;
    
    hierarchyService = new HierarchyService();
    (hierarchyService as any).hierarchyRepository = mockHierarchyRepository;
  });

  describe('createHierarchy', () => {
    const mockHierarchyData: CreateHierarchyDto = {
      channelId: new Types.ObjectId().toString(),
      hierarchyName: 'Test Hierarchy',
      hierarchyLevelCode: 'TEST_LEVEL',
      hierarchyLevel: 1,
      hierarchyStatus: 'active' as const,
    };

    it('should create hierarchy successfully', async () => {
      const mockCreatedHierarchy = createMockHierarchyDocument({
        channelId: new Types.ObjectId(mockHierarchyData.channelId),
        hierarchyName: mockHierarchyData.hierarchyName,
        hierarchyLevelCode: mockHierarchyData.hierarchyLevelCode,
        hierarchyLevel: mockHierarchyData.hierarchyLevel,
        hierarchyStatus: mockHierarchyData.hierarchyStatus,
      });

      mockHierarchyRepository.create.mockResolvedValue(mockCreatedHierarchy);

      const result = await hierarchyService.createHierarchy(mockHierarchyData);

      expect(mockHierarchyRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        channelId: expect.any(Types.ObjectId),
        hierarchyName: mockHierarchyData.hierarchyName,
        hierarchyLevelCode: mockHierarchyData.hierarchyLevelCode,
        hierarchyLevel: mockHierarchyData.hierarchyLevel,
        hierarchyStatus: mockHierarchyData.hierarchyStatus,
      }));
      expect(result).toEqual(expect.objectContaining({
        hierarchyName: mockHierarchyData.hierarchyName,
        hierarchyLevelCode: mockHierarchyData.hierarchyLevelCode,
        hierarchyLevel: mockHierarchyData.hierarchyLevel,
        hierarchyStatus: mockHierarchyData.hierarchyStatus,
      }));
    });

    it('should handle validation error', async () => {
      const error = new DatabaseValidationException('Validation failed');
      mockHierarchyRepository.create.mockRejectedValue(error);

      await expect(hierarchyService.createHierarchy(mockHierarchyData)).rejects.toThrow('Validation failed');
    });
  });

  describe('getHierarchyById', () => {
    const mockId = new Types.ObjectId().toString();

    it('should get hierarchy by id successfully', async () => {
      const mockHierarchy = createMockHierarchyDocument({
        _id: new Types.ObjectId(mockId).toString(),
      });

      mockHierarchyRepository.findById.mockResolvedValue(mockHierarchy);

      const result = await hierarchyService.getHierarchyById(mockId);

      expect(mockHierarchyRepository.findById).toHaveBeenCalledWith(mockId);
      expect(result).toEqual(expect.objectContaining({
        hierarchyName: mockHierarchy.hierarchyName,
        hierarchyLevelCode: mockHierarchy.hierarchyLevelCode,
        hierarchyLevel: mockHierarchy.hierarchyLevel,
        hierarchyStatus: mockHierarchy.hierarchyStatus,
      }));
    });

    it('should return null when hierarchy not found', async () => {
      mockHierarchyRepository.findById.mockResolvedValue(null);

      const result = await hierarchyService.getHierarchyById(mockId);

      expect(result).toBeNull();
    });
  });

  describe('getHierarchiesByChannelAndLevel', () => {
    const mockChannelId = new Types.ObjectId().toString();
    const mockLevel = 1;

    it('should get hierarchies by channel and level successfully', async () => {
      const mockHierarchies = [
        createMockHierarchyDocument({
          channelId: new Types.ObjectId(mockChannelId),
          hierarchyLevel: mockLevel,
        }),
      ];

      mockHierarchyRepository.findByChannelAndLevel.mockResolvedValue(mockHierarchies);

      const result = await hierarchyService.getHierarchiesByChannelAndLevel(mockChannelId, mockLevel);

      expect(mockHierarchyRepository.findByChannelAndLevel).toHaveBeenCalledWith(mockChannelId, mockLevel);
      expect(result).toEqual(expect.arrayContaining([
        expect.objectContaining({
          hierarchyName: mockHierarchies[0].hierarchyName,
          hierarchyLevelCode: mockHierarchies[0].hierarchyLevelCode,
          hierarchyLevel: mockHierarchies[0].hierarchyLevel,
          hierarchyStatus: mockHierarchies[0].hierarchyStatus,
        }),
      ]));
    });

    it('should return empty array when no hierarchies found', async () => {
      mockHierarchyRepository.findByChannelAndLevel.mockResolvedValue([]);

      const result = await hierarchyService.getHierarchiesByChannelAndLevel(mockChannelId, mockLevel);

      expect(result).toEqual([]);
    });
  });

  describe('getHierarchyTeamMemberList', () => {
    const mockChannelId = new Types.ObjectId().toString();
    const mockUserId = new Types.ObjectId().toString();

    it('should get team member list successfully', async () => {
      const mockTeamMembers = [
        {
          _id: new Types.ObjectId().toString() as unknown as Types.ObjectId,
          name: 'Team Member 1',
        },
      ];

      mockHierarchyRepository.getTeamMemberList = jest.fn().mockResolvedValue(mockTeamMembers as any);

      const result = await hierarchyService.getHierarchyTeamMemberList(mockChannelId, mockUserId, true);

      expect(mockHierarchyRepository.getTeamMemberList).toHaveBeenCalledWith(mockChannelId, mockUserId, true);
      expect(result).toEqual(mockTeamMembers);
    });

    it('should handle repository error', async () => {
      const error = new Error('Repository error');
      mockHierarchyRepository.getTeamMemberList = jest.fn().mockRejectedValue(error);

      await expect(
        hierarchyService.getHierarchyTeamMemberList(mockChannelId, mockUserId, true),
      ).rejects.toThrow('Repository error');
    });
  });

  describe('updateHierarchy', () => {
    const mockId = new Types.ObjectId().toString();
    const mockUpdateData = {
      hierarchyName: 'Updated Hierarchy',
      hierarchyStatus: 'inactive' as const,
    };

    it('should update hierarchy successfully', async () => {
      const mockUpdatedHierarchy = createMockHierarchyDocument({
        _id: new Types.ObjectId(mockId).toString(),
        ...mockUpdateData,
      });

      mockHierarchyRepository.findById.mockResolvedValue(mockUpdatedHierarchy);
      mockHierarchyRepository.updateById.mockResolvedValue(mockUpdatedHierarchy);

      const result = await hierarchyService.updateHierarchy(mockId, mockUpdateData);

      expect(mockHierarchyRepository.findById).toHaveBeenCalledWith(mockId);
      expect(mockHierarchyRepository.updateById).toHaveBeenCalledWith(mockId, expect.objectContaining({
        hierarchyName: mockUpdateData.hierarchyName,
        hierarchyStatus: mockUpdateData.hierarchyStatus,
      }));
      expect(result).toEqual(expect.objectContaining({
        hierarchyName: mockUpdateData.hierarchyName,
        hierarchyStatus: mockUpdateData.hierarchyStatus,
      }));
    });

    it('should return null when hierarchy not found', async () => {
      mockHierarchyRepository.findById.mockResolvedValue(null);

      const result = await hierarchyService.updateHierarchy(mockId, mockUpdateData);

      expect(result).toBeNull();
      expect(mockHierarchyRepository.updateById).not.toHaveBeenCalled();
    });

    it('should handle repository error', async () => {
      const mockHierarchy = createMockHierarchyDocument({
        _id: new Types.ObjectId(mockId).toString(),
      });

      mockHierarchyRepository.findById.mockResolvedValue(mockHierarchy);

      const error = new Error('Repository error');
      mockHierarchyRepository.updateById.mockRejectedValue(error);

      await expect(hierarchyService.updateHierarchy(mockId, mockUpdateData)).rejects.toThrow('Repository error');
    });
  });

  describe('getAllHierarchies', () => {
    const mockPage = 1;
    const mockLimit = 10;
    const mockChannelId = new Types.ObjectId().toString();
    const mockLevel = 1;
    const mockStatus = 'active' as const;

    it('should get all hierarchies with pagination successfully', async () => {
      const mockHierarchies = [
        createMockHierarchyDocument({
          channelId: new Types.ObjectId(mockChannelId),
          hierarchyLevel: mockLevel,
          hierarchyStatus: mockStatus,
        }),
      ];

      const mockTotal = 1;

      mockHierarchyRepository.findWithPagination.mockResolvedValue({
        hierarchies: mockHierarchies,
        total: mockTotal,
        totalPages: 1,
      });

      const result = await hierarchyService.getAllHierarchies(
        mockPage,
        mockLimit,
        mockChannelId,
        mockLevel,
        mockStatus,
      );

      expect(mockHierarchyRepository.findWithPagination).toHaveBeenCalledWith(
        expect.objectContaining({
          channelId: expect.any(Types.ObjectId),
          hierarchyLevel: mockLevel,
          hierarchyStatus: mockStatus,
        }),
        mockPage,
        mockLimit,
      );

      expect(result).toEqual({
        hierarchies: expect.arrayContaining([
          expect.objectContaining({
            hierarchyName: mockHierarchies[0].hierarchyName,
            hierarchyLevelCode: mockHierarchies[0].hierarchyLevelCode,
            hierarchyLevel: mockHierarchies[0].hierarchyLevel,
            hierarchyStatus: mockHierarchies[0].hierarchyStatus,
          }),
        ]),
        pagination: {
          total: mockTotal,
          page: mockPage,
          limit: mockLimit,
          totalPages: 1,
        },
      });
    });

    it('should handle empty result', async () => {
      mockHierarchyRepository.findWithPagination.mockResolvedValue({
        hierarchies: [],
        total: 0,
        totalPages: 0,
      });

      const result = await hierarchyService.getAllHierarchies(
        mockPage,
        mockLimit,
        mockChannelId,
        mockLevel,
        mockStatus,
      );

      expect(result).toEqual({
        hierarchies: [],
        pagination: {
          total: 0,
          page: mockPage,
          limit: mockLimit,
          totalPages: 0,
        },
      });
    });
  });
}); 