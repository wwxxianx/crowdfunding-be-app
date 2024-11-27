import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import * as request from 'supertest';
import { CampaignCategoriesService } from 'src/campaign-categories/campaign-categories.service';
import { CampaignCategoriesModule } from 'src/campaign-categories/campaign-categories.module';
import { PrismaClient } from '@prisma/client';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { StorageService } from 'src/storage/storage.service';
import { PrismaService } from 'src/common/data/prisma.service';

describe('Campaign categories api', () => {
  let app: INestApplication;
  let campaignCategoriesService: CampaignCategoriesService;
  const prismaMock = mockDeep<PrismaClient>() as unknown as DeepMockProxy<{
    // this is needed to resolve the issue with circular types definition
    // https://github.com/prisma/prisma/issues/10203
    [K in keyof PrismaClient]: Omit<PrismaClient[K], 'groupBy'>;
  }>;
  const cacheMock = mockDeep<Cache>() as unknown as DeepMockProxy<Cache>;
  const storageMock =
    mockDeep<StorageService>() as unknown as DeepMockProxy<StorageService>;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CampaignCategoriesModule],
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
    campaignCategoriesService = moduleRef.get<CampaignCategoriesService>(
      CampaignCategoriesService,
    );
    app = moduleRef.createNestApplication();
    await app.init();
  });

  it(`/GET campaign-categories`, () => {
    return request(app.getHttpServer()).get('/campaign-categories').expect(200);
  });

  afterAll(async () => {
    await app.close();
  });
});
