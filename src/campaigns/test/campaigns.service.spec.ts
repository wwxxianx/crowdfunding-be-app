import { Test, TestingModule } from '@nestjs/testing';
import { Campaign, CampaignPublishStatus } from '@prisma/client';
import { mockReset } from 'jest-mock-extended';
import { PrismaService } from 'src/common/data/prisma.service';
import { StorageService } from 'src/storage/storage.service';
import { cacheMock, prismaMock, storageMock } from 'src/test/mock';
import {
  campaignCategorySamples,
  campaignSamples,
  communityChallengeSamples,
  stateAndRegionSamples,
  userSamples,
} from 'src/test/mock/mock-data';
import { CampaignsService } from '../campaigns.service';
import { CreateCampaignDto } from '../dto/create-campaign.dto';
import { CampaignFilters } from '../types/fetch-campaigns-filters';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

describe('CampaignsService', () => {
  let service: CampaignsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CampaignsService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: StorageService,
          useValue: storageMock,
        },
        {
          provide: CACHE_MANAGER,
          useValue: cacheMock,
        },
      ],
    }).compile();

    service = module.get<CampaignsService>(CampaignsService);
  });

  beforeEach(() => {
    mockReset(prismaMock);
    mockReset(storageMock);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new campaign successfully', async () => {
      const userId = userSamples[0].id;
      const createCampaignDto: CreateCampaignDto = {
        beneficiaryName: 'Beneficiary Name',
        title: 'Campaign Title',
        description: 'Description',
        targetAmount: 1000,
        contactPhoneNumber: '123456789',
        categoryId: 'category-id',
        stateId: 'state-id',
      };
      const campaignImages = [
        {
          originalname: 'image1.jpg',
          buffer: Buffer.from(''),
          mimetype: 'image/jpeg',
        } as Express.Multer.File,
      ];

      const mockUploadResponse = {
        data: { publicUrl: 'http://example.com/thumbnail.jpg' },
        error: null,
      };
      const mockCampaignData = campaignSamples[0];

      storageMock.uploadFile.mockResolvedValue(mockUploadResponse);
      prismaMock.campaign.create.mockResolvedValue(mockCampaignData);

      const result = await service.create(
        userId,
        createCampaignDto,
        campaignImages,
      );

      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockCampaignData);
    });

    it('should return an error if thumbnail upload fails', async () => {
      const userId = userSamples[0].id;
      const createCampaignDto: CreateCampaignDto = {
        beneficiaryName: 'Beneficiary Name',
        title: 'Campaign Title',
        description: 'Description',
        targetAmount: 1000,
        contactPhoneNumber: '123456789',
        categoryId: 'category-id',
        stateId: 'state-id',
      };
      const campaignImages = [
        {
          originalname: 'image1.jpg',
          buffer: Buffer.from(''),
          mimetype: 'image/jpeg',
        } as Express.Multer.File,
      ];

      storageMock.uploadFile.mockResolvedValueOnce({
        data: null,
        error: 'Upload failed',
      });

      const result = await service.create(
        userId,
        createCampaignDto,
        campaignImages,
      );

      expect(result.error).toEqual('Failed to upload thumbnail image');
      expect(result.data).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should fetch all campaigns successfully', async () => {
      const mockData = campaignSamples;

      prismaMock.campaign.findMany.mockResolvedValue(mockData);
      const filters: CampaignFilters = {
        categoryIds: [],
        stateIds: [],
      };
      const result: any = (await service.findAll(filters)) as any;
      expect(result).toEqual(mockData);
      // expect(result).toBeNull();
    });

    it('should return all campaigns with matched categoryIds filter', async () => {
      const filters: CampaignFilters = {
        categoryIds: [campaignCategorySamples[0].id],
        stateIds: [],
      };
      const expectedData = campaignSamples.filter((campaign) =>
        filters.categoryIds.includes(campaign.campaignCategoryId),
      );

      prismaMock.campaign.findMany.mockResolvedValue(expectedData);
      const result = await service.findAll(filters);
      expect(result).toEqual(expectedData);
    });

    it('should return all campaigns with matched stateIds filter', async () => {
      const filters: CampaignFilters = {
        categoryIds: [],
        stateIds: [stateAndRegionSamples[0].id],
      };
      const expectedData = campaignSamples.filter((campaign) =>
        filters.stateIds.includes(campaign.stateId),
      );

      prismaMock.campaign.findMany.mockResolvedValue(expectedData);
      const result = await service.findAll(filters);
      expect(result).toEqual(expectedData);
    });

    it('should return all campaigns with matched stateIds and categoryIds filter', async () => {
      const filters: CampaignFilters = {
        categoryIds: [campaignCategorySamples[0].id],
        stateIds: [stateAndRegionSamples[0].id],
      };
      const expectedData = campaignSamples.filter((campaign) =>
        filters.stateIds.includes(campaign.stateId) || filters.categoryIds.includes(campaign.campaignCategoryId),
      );

      prismaMock.campaign.findMany.mockResolvedValue(expectedData);
      const result = await service.findAll(filters);
      expect(result).toEqual(expectedData);
    });

    it('should return all campaigns with matched userId filter', async () => {
      const filters: CampaignFilters = {
        categoryIds: [],
        stateIds: [],
        userId: userSamples[0].id,
      };
      const expectedData = campaignSamples.filter((campaign) =>
        filters.userId === campaign.userId,
      );

      prismaMock.campaign.findMany.mockResolvedValue(expectedData);
      const result = await service.findAll(filters);
      expect(result).toEqual(expectedData);
    });

    it('should return all campaigns with matched searchQuery filter', async () => {
      const filters: CampaignFilters = {
        categoryIds: [],
        stateIds: [],
        searchQuery: campaignSamples[0].title,
      };
      const expectedData = campaignSamples.filter((campaign) =>
        campaign.title.toLowerCase().includes(filters.searchQuery.toLowerCase()),
      );

      prismaMock.campaign.findMany.mockResolvedValue(expectedData);
      const result = await service.findAll(filters);
      expect(result).toEqual(expectedData);
    });

    it('should return all campaigns with matched status filter', async () => {
      const filters: CampaignFilters = {
        categoryIds: [],
        stateIds: [],
        isPublished: true,
      };
      const statusFilter: CampaignPublishStatus = filters.isPublished ? 'PUBLISHED' : 'PENDING';
      const expectedData = campaignSamples.filter((campaign) =>
        campaign.status === statusFilter,
      );

      prismaMock.campaign.findMany.mockResolvedValue(expectedData);
      const result = await service.findAll(filters);
      expect(result).toEqual(expectedData);
    });
    
    it('should return all campaigns with matched identificationStatus filter', async () => {
      const filters: CampaignFilters = {
        categoryIds: [],
        stateIds: [],
        identificationStatus: 'UNDER_REVIEW',
      };
      const expectedData = campaignSamples.filter((campaign) =>
        campaign.fundraiserIdentificationStatus === filters.identificationStatus,
      );

      prismaMock.campaign.findMany.mockResolvedValue(expectedData);
      const result = await service.findAll(filters);
      expect(result).toEqual(expectedData);
    });
  });

  describe('findOne', () => {
    it('should fetch a campaign successfully', async () => {
      const campaignId = campaignSamples[0].id;
      const mockData = {
        ...campaignSamples[0],
        firstMatchedCommunityChallenge: communityChallengeSamples[0],
        raisedAmount: undefined,
        recentThreeDonations: undefined,
        topThreeDonations: undefined,
      };

      prismaMock.campaign.findUnique.mockResolvedValue(mockData);
      cacheMock.get.mockResolvedValue(null);
      prismaMock.communityChallenge.findFirst.mockResolvedValue(communityChallengeSamples[0]);

      const result = await service.findOne(campaignId);
      expect(result.data).toEqual(mockData);
      expect(result.error).toBeNull();
    });
  });
});
