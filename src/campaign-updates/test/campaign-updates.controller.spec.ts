import { Test, TestingModule } from '@nestjs/testing';
import { CampaignUpdatesController } from './campaign-updates.controller';
import { CampaignUpdatesService } from './campaign-updates.service';

describe('CampaignUpdatesController', () => {
  let controller: CampaignUpdatesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CampaignUpdatesController],
      providers: [CampaignUpdatesService],
    }).compile();

    controller = module.get<CampaignUpdatesController>(CampaignUpdatesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
