import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bull';
import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CampaignsModule } from 'src/campaigns/campaigns.module';
import { CampaignsService } from 'src/campaigns/campaigns.service';
import { EmailModule } from 'src/email/email.module';
import { GiftCardsModule } from 'src/gift-cards/gift-cards.module';
import { GiftCardsService } from 'src/gift-cards/gift-cards.service';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { NotificationsService } from 'src/notifications/notifications.service';
import { StorageModule } from 'src/storage/storage.module';
import { ChallengeRewardProcessor } from 'src/webhooks/donations/donation-webhook.processor';
import { StripeController } from './stripe.controller';
import { StripeService } from './stripe.service';

@Module({
  imports: [
    CampaignsModule,
    GiftCardsModule,
    StorageModule,
    NotificationsModule,
    EmailModule,
    BullModule.registerQueue({
      name: 'donation-challenge-reward',
    }),
    HttpModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            Authorization: `Basic ${configService.get('ONESIGNAL_AUTH_TOKEN')}`,
          },
          baseURL: 'https://api.onesignal.com/notifications',
        };
      },
    }),
  ],
  controllers: [StripeController],
  providers: [
    StripeService,
    CampaignsService,
    GiftCardsService,
    NotificationsService,
    ChallengeRewardProcessor,
  ],
  exports: [StripeService],
})
export class StripeModule {
  static forRootAsync(): DynamicModule {
    return {
      module: StripeModule,
      controllers: [StripeController],
      imports: [ConfigModule.forRoot(), CampaignsModule, GiftCardsModule],
      providers: [
        StripeService,
        {
          provide: 'STRIPE_SECRET_KEY',
          useFactory: async (configService: ConfigService) =>
            configService.get('STRIPE_SECRET_KEY'),
          inject: [ConfigService],
        },
      ],
    };
  }
}
