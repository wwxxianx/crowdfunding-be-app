import { Test, TestingModule } from '@nestjs/testing';
import { CampaignUpdatesService } from './campaign-updates.service';

describe('CampaignUpdatesService', () => {
  let service: CampaignUpdatesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CampaignUpdatesService],
    }).compile();

    service = module.get<CampaignUpdatesService>(CampaignUpdatesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
