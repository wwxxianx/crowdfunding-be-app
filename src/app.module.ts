import { CacheModule } from '@nestjs/cache-manager';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AsyncLocalStorage } from 'async_hooks';
import * as redisStore from 'cache-manager-redis-yet';
import * as crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';
import { AlsModule } from './als.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CampaignCategoriesModule } from './campaign-categories/campaign-categories.module';
import { CampaignCommentsModule } from './campaign-comments/campaign-comments.module';
import { CampaignUpdatesModule } from './campaign-updates/campaign-updates.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { CollaborationsModule } from './collaborations/collaborations.module';
import { PrismaModule } from './common/data/prisma.module';
import { CommunityChallengesModule } from './community_challenges/community_challenges.module';
import redisConfig from './config/redis.config';
import { DonationsModule } from './donations/donations.module';
import { GiftCardsModule } from './gift-cards/gift-cards.module';
import { NotificationsModule } from './notifications/notifications.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { ScamReportsModule } from './scam-reports/scam-reports.module';
import { StateAndRegionsModule } from './state-and-regions/state-and-regions.module';
import { StripeModule } from './stripe/stripe.module';
import { UserFavouriteCampaignsModule } from './user-favourite-campaigns/user-favourite-campaigns.module';
import { UsersModule } from './users/users.module';
import { BullModule } from '@nestjs/bull';
import { EmailModule } from './email/email.module';
import { OpenAIModule } from './openai/openai.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [redisConfig] }),
    AlsModule,
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const redisHost = configService.get('redis.host');
        const redisPort = configService.get('redis.port');
        const redisPassword = configService.get('redis.password');
        return {
          store: await redisStore.redisStore({
            socket: {
              host: redisHost,
              port: redisPort,
            },
            password: redisPassword,
          }),
        };
      },
    }),
    OpenAIModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const redisHost = configService.get('redis.host');
        const redisPort = configService.get('redis.port');
        const redisPassword = configService.get('redis.password');
        return {
          redis: {
            host: redisHost,
            port: redisPort,
            password: redisPassword,
          }
        }
      }
    }),
    AuthModule,
    PrismaModule,
    StripeModule.forRootAsync(),
    CampaignsModule,
    UsersModule,
    StateAndRegionsModule,
    CampaignCategoriesModule,
    CampaignCommentsModule,
    UserFavouriteCampaignsModule,
    CampaignUpdatesModule,
    GiftCardsModule,
    OrganizationsModule,
    DonationsModule,
    NotificationsModule,
    CollaborationsModule,
    CommunityChallengesModule,
    ScamReportsModule,
    EmailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  constructor(
    // inject the AsyncLocalStorage in the module constructor,
    private readonly als: AsyncLocalStorage<Map<string, any>>,
  ) {}

  configure(consumer: MiddlewareConsumer) {
    // bind the middleware,
    consumer
      .apply((req: Request, res: Response, next: NextFunction) => {
        const reqHash = this._createRequestHash(req.originalUrl, {});
        this.als.run(new Map<string, any>().set('url', reqHash), () => next());
      })
      // and register it for all routes (in case of Fastify use '(.*)')
      .forRoutes('*');
  }

  _createRequestHash(url: string, options: Record<string, any>): string {
    return crypto
      .createHash('sha256')
      .update(url + JSON.stringify(options))
      .digest('hex');
  }
}
