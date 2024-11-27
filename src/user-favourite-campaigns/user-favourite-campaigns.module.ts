import { Module } from '@nestjs/common';
import { UserFavouriteCampaignsService } from './user-favourite-campaigns.service';
import { UserFavouriteCampaignsController } from './user-favourite-campaigns.controller';

@Module({
  controllers: [UserFavouriteCampaignsController],
  providers: [UserFavouriteCampaignsService],
})
export class UserFavouriteCampaignsModule {}
