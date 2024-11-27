import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { EmailService } from 'src/email/email.service';
import { ChallengeRewardProcessor } from './donation-webhook.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'donation-challenge-reward',
    }),
    EmailService,
  ],
  controllers: [DonationWebhookModule],
  providers: [EmailService, ChallengeRewardProcessor],
})
export class DonationWebhookModule {}
