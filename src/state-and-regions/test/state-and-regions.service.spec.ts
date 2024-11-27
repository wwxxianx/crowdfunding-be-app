import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Test, TestingModule } from '@nestjs/testing';
import { Cache } from 'cache-manager';
import { PrismaService } from 'src/common/data/prisma.service';
import { StateAndRegionsService } from '../state-and-regions.service';
import { mockReset } from 'jest-mock-extended';
import { State } from '@prisma/client';
import { redisConstants } from 'src/common/constants/redis';
import { cacheMock, prismaMock } from 'src/test/mock';

describe('StateAndRegionsService', () => {
  let service: StateAndRegionsService;
  let cacheService: Cache;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StateAndRegionsService,
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

    service = module.get<StateAndRegionsService>(StateAndRegionsService);
    cacheService = module.get<Cache>(CACHE_MANAGER);
  });

  beforeEach(() => {
    mockReset(prismaMock);
    mockReset(cacheMock);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return cached data if available', async () => {
      const cachedData: State[] = [{ id: '1', name: 'State 1' }];
      jest.spyOn(cacheService, 'get').mockResolvedValue(cachedData);

      const result = await service.findAll();
      expect(result.data).toEqual(cachedData);
      expect(result.error).toBeUndefined();
    });

    it('should fetch data from Prisma and cache it if not available', async () => {
      const mockData: State[] = [{ id: '1', name: 'State 1' }];
      jest.spyOn(cacheService, 'get').mockResolvedValue(null);
      jest.spyOn(prismaMock.state, 'findMany').mockResolvedValue(mockData);

      const result = await service.findAll();
      expect(result.data).toEqual(mockData);
      expect(result.error).toBeUndefined();
      expect(cacheService.set).toHaveBeenCalledWith(redisConstants.STATE_REGION_KEY, mockData);
    });

    it('should return an error if fetching from Prisma fails', async () => {
      jest.spyOn(cacheService, 'get').mockResolvedValue(null);
      jest.spyOn(prismaMock.state, 'findMany').mockRejectedValue(new Error('Fetch error'));

      const result = await service.findAll();
      expect(result.data).toBeNull();
      expect(result.error).toBe('Failed to fetch state and regions');
    });
  });
});
