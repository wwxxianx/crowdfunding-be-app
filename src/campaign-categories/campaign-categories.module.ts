import { Module } from '@nestjs/common';
import { CampaignCategoriesService } from './campaign-categories.service';
import { CampaignCategoriesController } from './campaign-categories.controller';
import { StorageModule } from 'src/storage/storage.module';

@Module({
  imports: [StorageModule],
  controllers: [CampaignCategoriesController],
  providers: [CampaignCategoriesService],
})
export class CampaignCategoriesModule {}
