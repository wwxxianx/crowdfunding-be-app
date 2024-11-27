import { Process, Processor } from '@nestjs/bull';
import {
  ChallengeStatus,
  CommunityChallengeType,
  NotificationType,
} from '@prisma/client';
import { Job } from 'bull';
import { PrismaService } from 'src/common/data/prisma.service';
import { CreateEmailPayload, EmailService } from 'src/email/email.service';
import generateChallengeRewardEmailTemplte from 'src/email/template/challenge-reward-email-template';
import { NotificationsService } from 'src/notifications/notifications.service';

@Processor('donation-challenge-reward')
export class ChallengeRewardProcessor {
  constructor(
    private readonly emailService: EmailService,
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationsService,
  ) {}

  @Process('challenge-reward')
  async handleChallengeRewardEmail(job: Job) {
    console.log('Start process challenge reward job');
    const { data: jobData } = job;
    const { donationId = null } = jobData;
    // Consume jobData and process the task
    if (!donationId) {
      return;
    }
    const donation = await this.prisma.campaignDonation.findUnique({
      where: {
        id: donationId,
      },
      include: {
        user: true,
        campaign: {
          include: {
            campaignCategory: true,
          },
        },
      },
    });
    const participatedDonationChallenges =
      await this.prisma.communityChallengeParticipant.findMany({
        where: {
          AND: [
            { userId: donation.userId },
            { rewardEmailId: null },
            {
              communityChallenge: {
                challengeType: CommunityChallengeType.DONATION,
              },
            },
          ],
        },
        include: {
          communityChallenge: {
            include: {
              targetCampaignCategories: true,
            },
          },
        },
      });
    if (!participatedDonationChallenges) {
      return;
    }

    for (const participatedDonationChallenge of participatedDonationChallenges) {
      const challenge = participatedDonationChallenge.communityChallenge;

      const fulfilledDonations = await this.prisma.campaignDonation.findMany({
        where: {
          userId: donation.userId,
          amount: {
            gte: challenge.requiredDonationAmount,
          },
          campaign: {
            campaignCategoryId: {
              in: challenge.targetCampaignCategories.map(
                (category) => category.id,
              ),
            },
          },
          createdAt: {
            lte: challenge.expiredAt,
          },
        },
      });
      console.log('fulfilledDonations', fulfilledDonations);
      if (!fulfilledDonations) {
        continue;
      }
      if (fulfilledDonations.length >= challenge.requiredNumOfDonation) {
        console.log('sending reward');
        // send email (Resend)
        const emailHtml = generateChallengeRewardEmailTemplte({
          communityChallenge: challenge,
          receiver: donation.user,
        });
        const payload: CreateEmailPayload = {
          html: emailHtml,
          receiverEmail: 'weixianwu54@gmail.com',
          subject: `Check out your reward of ${challenge.title}`,
        };
        const { emailId, error } = await this.emailService.sendEmail(payload);
        if (error) {
          // Handle error
        }

        // Send notification (OneSignal - email)
        // this.notificationService.createChallengeRewardNotification({
        //   challenge: challenge,
        //   receiver: donation.user,
        // });
        await this.prisma.communityChallengeParticipant.update({
          where: {
            userId_communityChallengeId: {
              userId: donation.userId,
              communityChallengeId:
                participatedDonationChallenge.communityChallengeId,
            },
          },
          data: {
            rewardEmailId: emailId,
            status: ChallengeStatus.COMPLETED,
          },
        });
        await this.prisma.notification.create({
          data: {
            actorId: donation.userId,
            receiverId: donation.userId,
            description: `Get your reward from the '${challenge.title}' community challenge`,
            entityId: challenge.id,
            title: challenge.reward,
            type: NotificationType.COMMUNITY_CHALLENGE_REWARD,
            isRead: false,
          },
        });
      }
    }
  }

  @Process('donation')
  async handleCampaignDonation(job: Job) {
    const { data: jobData } = job;
    const { donationId = null } = jobData;
    // Consume jobData and process the task
    if (!donationId) {
      return;
    }
    await this.notificationService.createReceiveDonationNotification({
      donationId: donationId,
    });
  }
}
