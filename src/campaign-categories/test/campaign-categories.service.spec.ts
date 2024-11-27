// campaign-categories/campaign-categories.service.spec.ts
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Test, TestingModule } from '@nestjs/testing';
import { Cache } from 'cache-manager';
import { PrismaService } from 'src/common/data/prisma.service';
import { CampaignCategoriesService } from '../campaign-categories.service';
import { mockReset } from 'jest-mock-extended';
import { redisConstants } from 'src/common/constants/redis';
import { cacheMock, prismaMock } from 'src/test/mock';

describe('CampaignCategoriesService', () => {
  let campaignCategoriesService: CampaignCategoriesService;
  let cacheService: Cache;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CampaignCategoriesService,
        {
          provide: CACHE_MANAGER,
          useValue: cacheMock,
        },
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();
    campaignCategoriesService = module.get<CampaignCategoriesService>(
      CampaignCategoriesService,
    );
    cacheService = module.get<Cache>(CACHE_MANAGER);
  });

  beforeEach(() => {
    mockReset(prismaMock);
    mockReset(cacheMock);
  });

  it('should be defined', () => {
    expect(campaignCategoriesService).toBeDefined();
  });

  describe('findAll', () => {
    it('should return cached data if available', async () => {
      const cachedData = [{ id: '1', title: 'Category 1' }];
      jest.spyOn(cacheService, 'get').mockResolvedValue(cachedData);
      const result = await campaignCategoriesService.findAll();
      expect(result).toEqual(cachedData);
    });

    it('should fetch data from database and cache it if not available', async () => {
      const mockData = [{ id: '1', title: 'Category 1' }];
      jest
        .spyOn(prismaMock.campaignCategory, 'findMany')
        .mockResolvedValue(mockData);
      const result = await campaignCategoriesService.findAll();
      expect(result).toEqual(mockData);
      expect(cacheService.set).toHaveBeenCalledWith(redisConstants.CAMPAIGN_CATEGORIES_KEY, mockData);
    });
  });
});
