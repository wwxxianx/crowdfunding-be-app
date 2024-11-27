import { Module } from '@nestjs/common';
import { CampaignUpdatesService } from './campaign-updates.service';
import { CampaignUpdatesController } from './campaign-updates.controller';
import { StorageModule } from 'src/storage/storage.module';
import { OpenAIModule } from 'src/openai/openai.module';

@Module({
  imports: [StorageModule, OpenAIModule],
  controllers: [CampaignUpdatesController],
  providers: [CampaignUpdatesService],
})
export class CampaignUpdatesModule {}
