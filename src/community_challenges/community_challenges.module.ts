import { Module } from '@nestjs/common';
import { CommunityChallengesService } from './community_challenges.service';
import { CommunityChallengesController } from './community_challenges.controller';
import { StorageModule } from 'src/storage/storage.module';

@Module({
  imports: [StorageModule],
  controllers: [CommunityChallengesController],
  providers: [CommunityChallengesService],
})
export class CommunityChallengesModule {}
