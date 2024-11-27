import { Test, TestingModule } from '@nestjs/testing';
import { CampaignCommentsController } from '../campaign-comments.controller';
import { CampaignCommentsService } from '../campaign-comments.service';

describe('CampaignCommentsController', () => {
  let controller: CampaignCommentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CampaignCommentsController],
      providers: [CampaignCommentsService],
    }).compile();

    controller = module.get<CampaignCommentsController>(
      CampaignCommentsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
