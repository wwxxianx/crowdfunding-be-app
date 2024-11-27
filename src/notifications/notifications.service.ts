import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CommunityChallenge,
  Notification,
  NotificationType,
  User,
} from '@prisma/client';
import { dbConstants } from 'src/common/constants/constants';
import { PrismaService } from 'src/common/data/prisma.service';
import {
  CampaignStatusChangedNotificationDto,
  CreateNotificationDto,
  ScamNotificationDto,
} from './dto/create-notification.dto';
import { lastValueFrom } from 'rxjs';

type CampaignUpdateNotificationPayload = Pick<
  Notification,
  'actorId' | 'description' | 'entityId' | 'receiverId' | 'title'
>;

type ReceiveDonationNotificationDto = {
  donationId: string;
};

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async createChallengeRewardNotification(payload: {
    challenge: CommunityChallenge;
    receiver: User;
  }) {
    try {
      // TODO: Replace the email to send to the target users
      const onesignalEmailData = {
        app_id: this.configService.get<string>('ONESIGNAL_APP_ID'),
        template_id: payload.challenge.rewardTemplateId,
        include_email_tokens: ['testing@gmail.com'],
      };
      this.httpService.post('/notification?c=email', onesignalEmailData);
    } catch (e) {
      return;
    }
  }

  async getEmailTemplates() {
    try {
      const observable = this.httpService.get(
        `/templates?app_id=${this.configService.get<string>('ONESIGNAL_APP_ID')}`,
      );
      const response = await lastValueFrom(observable);
      return { data: response.data };
    } catch (err) {
      return { error: 'Failed to fetch templates' };
    }
  }

  async createReceiveDonationNotification(dto: ReceiveDonationNotificationDto) {
    const donation = await this.prisma.campaignDonation.findUnique({
      where: {
        id: dto.donationId,
      },
      include: {
        user: true,
        campaign: {
          include: {
            user: true,
          },
        },
      },
    });

    await this.prisma.notification.create({
      data: {
        receiverId: donation.campaign.userId,
        actorId: donation.userId,
        description: `${donation.isAnonymous ? 'A kind donor' : donation.user.fullName} just donated RM${donation.amount} to your campaign.`,
        title: `Received RM${donation.amount} for campaign ${donation.campaign.title}`,
        entityId: donation.campaignId,
        type: NotificationType.RECEIVE_DONATION,
      },
    });
  }

  async createCampaignStatusChangedNotification(
    dto: CampaignStatusChangedNotificationDto,
  ) {
    if (!dto.status || dto.status === 'PENDING') {
      return;
    }
    const campaign = await this.prisma.campaign.findUnique({
      where: {
        id: dto.campaignId,
      },
      include: {
        user: true,
      },
    });
    // Notification for fundraiser
    let title = '';
    let description = '';
    if (dto.status === 'PUBLISHED') {
      title = `Your campaign ${campaign.title} has been verified, and is ready to collect funds!`;
      description = `Campaign ${campaign.title} is now published.`;
    }
    if (dto.status === 'SUSPENDED') {
      title = `Your campaign ${campaign.title} has been suspended.`;
      description = `We've received some scam reports for your campaign.`;
    }
    await this.prisma.notification.create({
      data: {
        type: NotificationType.CAMPAIGN_STATUS_CHANGED,
        description: title,
        title: description,
        entityId: dto.campaignId,
        actorId: campaign.user.id,
        receiverId: campaign.user.id,
      },
    });

    if (dto.status === 'PUBLISHED') {
      // Notification for donors
      const interestedDonors = await this.prisma.user.findMany({
        where: {
          preference: {
            favouriteCampaignCategories: {
              some: {
                id: campaign.campaignCategoryId,
              },
            },
          },
        },
      });

      await this.prisma.notification.createMany({
        data: interestedDonors.map((donor) => ({
          actorId: campaign.user.id,
          title: 'A new campaign you might interested in!',
          description: '',
          receiverId: donor.id,
          entityId: campaign.id,
          type: NotificationType.NEW_MATCHED_CAMPAIGN,
        })),
      });
    }
  }

  async createCampaignUpdateNotification(
    payload: CampaignUpdateNotificationPayload,
  ) {
    try {
      console.log('payload', payload);
      const campaignUpdate = await this.prisma.campaignUpdate.findUnique({
        where: {
          id: payload.entityId,
        },
        include: {
          campaign: true,
        },
      });
      const onesignalNotification = {
        app_id: this.configService.get<string>('ONESIGNAL_APP_ID'),
        contents: {
          en: `${payload.description}`,
        },
        headings: {
          en: `${campaignUpdate.campaign.title} post a new update`,
        },
        target_channel: 'push',
        include_aliases: {
          external_id: [payload.receiverId],
        },
      };
      this.httpService.post('/notifications?c=push', onesignalNotification);
      const _ = await this.prisma.notification.create({
        data: {
          receiver: {
            connect: {
              id: payload.receiverId,
            },
          },
          actor: {
            connect: {
              id: payload.actorId,
            },
          },
          title: payload.title,
          description: payload.description,
          entityId: payload.entityId,
          type: NotificationType.CAMPAIGN_UPDATE,
        },
      });
    } catch (e) {
      console.log('error:', e);
    }
  }

  async createScamNotification(
    dto: ScamNotificationDto,
  ): Promise<Result<Notification[]>> {
    try {
      let data;
      const isScamNotificationCreated =
        await this.prisma.notification.findFirst({
          where: {
            AND: [
              { entityId: dto.campaignId },
              { type: NotificationType.SCAM },
            ],
          },
        });
      if (isScamNotificationCreated) {
        return {
          data: null,
          error: 'Scam notification already created before',
        };
      }
      const receivers = await this.prisma.campaignDonation.findMany({
        where: {
          campaignId: dto.campaignId,
        },
        include: {
          user: true,
        },
      });
      const campaign = await this.prisma.campaign.findUnique({
        where: {
          id: dto.campaignId,
        },
      });
      data = await this.prisma.notification.createMany({
        data: receivers.map((receiver) => ({
          type: NotificationType.SCAM,
          description:
            dto.description ??
            `The campaign '${campaign.title}' has been flagged as a scam. Please be cautious. Your donation will be refunded within 30 working days.`,
          title: dto.title ?? 'Scam Alert',
          entityId: dto.campaignId,
          actorId: dbConstants.PLATFORM_ACCOUNT_ID,
          isRead: false,
          receiverId: receiver.userId,
        })),
      });
      return { data };
    } catch (e) {
      return { data: null, error: 'Failed to create notification' };
    }
  }

  async create(createNotificationDto: CreateNotificationDto) {
    const _ = await this.prisma.notification.create({
      data: {
        receiver: {
          connect: {
            id: '',
          },
        },
        actor: {
          connect: {
            id: '',
          },
        },
        title: '',
        description: '',
        entityId: '',
        type: NotificationType.CAMPAIGN_COMMENT,
        metadata: {},
      },
    });
  }

  async findAll(userId?: string) {
    let formattedNotifications: Notification[] = [];
    const notifications = await this.prisma.notification.findMany({
      where: {
        receiverId: userId ?? undefined,
      },
      include: {
        actor: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    for (const notification of notifications) {
      if (notification.type === NotificationType.CAMPAIGN_UPDATE) {
        const campaignUpdate = await this.prisma.campaignUpdate.findUnique({
          where: {
            id: notification.entityId,
          },
          include: {
            campaign: true,
          },
        });
        const formattedNotification = {
          ...notification,
          campaign: campaignUpdate?.campaign,
        };
        formattedNotifications.push(formattedNotification);
        continue;
      }
      if (
        notification.type === NotificationType.NEW_MATCHED_CAMPAIGN ||
        notification.type === NotificationType.CAMPAIGN_STATUS_CHANGED ||
        notification.type === NotificationType.SCAM
      ) {
        const campaign = await this.prisma.campaign.findUnique({
          where: {
            id: notification.entityId,
          },
        });
        const formattedDescription =
          notification.type === NotificationType.SCAM
            ? `The campaign "${campaign.title} has been flagged as a scam. Please be cautious. Your donation will be refunded within 30 working days."`
            : notification.description;
        const formattedNotification = {
          ...notification,
          description: formattedDescription,
          campaign: campaign,
        };
        formattedNotifications.push(formattedNotification);
        continue;
      }
      // if (notification.type === NotificationType.COMMUNITY_CHALLENGE_REWARD) {
      //   const communityChallenge
      // }
      formattedNotifications.push(notification);
    }
    return formattedNotifications;
  }

  findOne(id: number) {
    return `This action returns a #${id} notification`;
  }

  async updateAsRead(id: string): Promise<Result<Notification>> {
    try {
      const notification = await this.prisma.notification.update({
        where: {
          id: id,
        },
        data: {
          isRead: true,
        },
      });
      return { data: notification, error: null };
    } catch (e) {
      return { data: null, error: 'Failed to update notification' };
    }
  }

  remove(id: number) {
    return `This action removes a #${id} notification`;
  }
}
