import { Test, TestingModule } from '@nestjs/testing';
import { CampaignCommentsService } from '../campaign-comments.service';

describe('CampaignCommentsService', () => {
  let service: CampaignCommentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CampaignCommentsService],
    }).compile();

    service = module.get<CampaignCommentsService>(CampaignCommentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
