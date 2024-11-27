import { Test, TestingModule } from '@nestjs/testing';
import { CampaignCategoriesController } from '../campaign-categories.controller';
import { CampaignCategoriesService } from '../campaign-categories.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { PrismaService } from 'src/common/data/prisma.service';
import { mockReset } from 'jest-mock-extended';
import { cacheMock, prismaMock } from 'src/test/mock';

describe('CampaignCategoriesController', () => {
  let campaignCategoriesController: CampaignCategoriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CampaignCategoriesController],
      providers: [CampaignCategoriesService, {
        provide: CACHE_MANAGER,
        useValue: cacheMock,
      },
      {
        provide: PrismaService,
        useValue: prismaMock,
      },],
    }).compile();

    campaignCategoriesController = module.get<CampaignCategoriesController>(
      CampaignCategoriesController,
    );
  });

  beforeEach(() => {
    mockReset(prismaMock);
    mockReset(cacheMock);
  });

  it('should be defined', () => {
    expect(campaignCategoriesController).toBeDefined();
  });

  describe('findAll', () => {
    it('should return cached data if available', async () => {
      const cachedData = [{ id: '1', title: 'Category 1' }];
      jest.spyOn(cacheMock, 'get').mockResolvedValue(cachedData);
      const result = await campaignCategoriesController.findAll();
      expect(result).toEqual(cachedData);
    });

    it('should fetch data from database and cache it if not available', async () => {
      const mockData = [{ id: '1', title: 'Category 1' }];
      jest.spyOn(prismaMock.campaignCategory, 'findMany').mockResolvedValue(mockData);
      jest.spyOn(cacheMock, 'get').mockResolvedValue(null);
      jest.spyOn(cacheMock, 'set').mockResolvedValue(null);

      const result = await campaignCategoriesController.findAll();
      expect(result).toEqual(mockData);
      expect(cacheMock.set).toHaveBeenCalledWith('campaign-categories', mockData);
    });
  });
});
