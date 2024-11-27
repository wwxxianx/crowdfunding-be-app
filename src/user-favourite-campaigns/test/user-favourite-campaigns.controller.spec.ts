import { Test, TestingModule } from '@nestjs/testing';
import { UserFavouriteCampaignsController } from '../user-favourite-campaigns.controller';
import { UserFavouriteCampaignsService } from '../user-favourite-campaigns.service';

describe('UserFavouriteCampaignsController', () => {
  let controller: UserFavouriteCampaignsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserFavouriteCampaignsController],
      providers: [UserFavouriteCampaignsService],
    }).compile();

    controller = module.get<UserFavouriteCampaignsController>(
      UserFavouriteCampaignsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
