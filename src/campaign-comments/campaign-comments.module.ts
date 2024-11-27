import { Module } from '@nestjs/common';
import { CampaignCommentsService } from './campaign-comments.service';
import { CampaignCommentsController } from './campaign-comments.controller';

@Module({
  controllers: [CampaignCommentsController],
  providers: [CampaignCommentsService],
})
export class CampaignCommentsModule {}
