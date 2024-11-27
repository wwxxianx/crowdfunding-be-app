import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { CampaignCategoriesModule } from '../campaign-categories.module';
import { CampaignCategoriesService } from '../campaign-categories.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { cacheMock, prismaMock } from 'src/test/mock';
import { PrismaService } from 'src/common/data/prisma.service';
import * as request from 'supertest';

describe('Campaign categories api', () => {
  let app: INestApplication;
  let campaignCategoriesService: CampaignCategoriesService;

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
    return request(app.getHttpServer())
        .get('/campaign-categories')
        .expect(200)
  });

  afterAll(async () => {
    await app.close();
  });
});
