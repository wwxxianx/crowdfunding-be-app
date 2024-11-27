import { Module } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { CampaignsController } from './campaigns.controller';
import { StorageModule } from 'src/storage/storage.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { NotificationsService } from 'src/notifications/notifications.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    StorageModule,
    NotificationsModule,
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
  controllers: [CampaignsController],
  providers: [CampaignsService, NotificationsService],
})
export class CampaignsModule {}
