import { Injectable } from '@nestjs/common';
import { CreateCommunityChallengeDto } from './dto/create-community-challenge.dto';
import { UpdateCommunityChallengeDto } from './dto/update-community-challenge.dto';
import { PrismaService } from 'src/common/data/prisma.service';
import {
  ChallengeStatus,
  CommunityChallenge,
  CommunityChallengeParticipant,
  CommunityChallengeType,
  NotificationType,
} from '@prisma/client';
import { CreateParticipantDto } from './dto/create-participant.dto';
import { StorageService } from 'src/storage/storage.service';
import { storageConstants } from 'src/common/constants/constants';
import {
  AdminUpdateChallengeParticipantDto,
  UpdateChallengeParticipantDto,
} from './dto/update-challenge-participant.dto';
import { ChallengeParticipantEntity } from './entities/challenge-participant.entity';

@Injectable()
export class CommunityChallengesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async updateChallenge(
    id: string,
    createCommunityChallengeDto: CreateCommunityChallengeDto,
    challengeImageFile?: Express.Multer.File,
    sponsorImageFile?: Express.Multer.File,
  ): Promise<Result<CommunityChallenge>> {
    try {
      let sponsorImageUrl;
      if (sponsorImageFile) {
        const filePath = `${createCommunityChallengeDto.title}/sponsor/${sponsorImageFile[0].originalname}`;
        const { data, error } = await this.storageService.uploadFile(
          storageConstants.COMMUNITY_CHALLENGE_BUCKET,
          filePath,
          sponsorImageFile[0].buffer,
          sponsorImageFile[0].mimetype,
        );
        if (error) {
          return { data: null, error: 'Failed to upload sponsor image' };
        }
        sponsorImageUrl = data.publicUrl;
      }
      let challengeImageUrl;
      if (challengeImageFile) {
        const filePath = `${createCommunityChallengeDto.title}/${challengeImageFile[0].originalname}`;
        const { data, error } = await this.storageService.uploadFile(
          storageConstants.COMMUNITY_CHALLENGE_BUCKET,
          filePath,
          challengeImageFile[0].buffer,
          challengeImageFile[0].mimetype,
        );
        if (error) {
          return { data: null, error: 'Failed to upload challenge image' };
        }
        challengeImageUrl = data.publicUrl;
      }

      const targetCampaignCategoryConnections =
        createCommunityChallengeDto.targetCampaignCategoryIds?.map((id) => ({
          id,
        }));

      const challenge = await this.prisma.communityChallenge.update({
        where: {
          id: id,
        },
        data: {
          imageUrl: challengeImageUrl ?? undefined,
          challengeType: createCommunityChallengeDto.challengeType ?? undefined,
          description: createCommunityChallengeDto.description ?? undefined,
          expiredAt: createCommunityChallengeDto.expiredAt ?? undefined,
          requiredDonationAmount:
            createCommunityChallengeDto.requiredDonationAmount ?? undefined,
          reward: createCommunityChallengeDto.reward ?? undefined,
          rewardCollectMethod:
            createCommunityChallengeDto.rewardCollectMethod ?? undefined,
          rule: createCommunityChallengeDto.rule ?? undefined,
          sponsorName: createCommunityChallengeDto.sponsorName ?? undefined,
          termsAndConditions:
            createCommunityChallengeDto.termsAndConditions ?? undefined,
          title: createCommunityChallengeDto.title ?? undefined,
          requiredNumOfDonation:
            createCommunityChallengeDto.requiredNumOfDonation ?? undefined,
          requirements: createCommunityChallengeDto.requirements ?? undefined,
          sponsorImageUrl: sponsorImageUrl ?? undefined,
          targetCampaignCategories: targetCampaignCategoryConnections
            ? {
                connect: targetCampaignCategoryConnections,
              }
            : undefined,
        },
        include: {
          targetCampaignCategories: true,
        },
      });
      return { data: challenge, error: null };
    } catch (e) {
      return { data: null, error: 'Failed to create challenge!' };
    }
  }

  async createChallenge(
    createCommunityChallengeDto: CreateCommunityChallengeDto,
    challengeImageFile: Express.Multer.File,
    sponsorImageFile?: Express.Multer.File,
  ) {
    try {
      let sponsorImageUrl;
      if (sponsorImageFile) {
        const filePath = `${createCommunityChallengeDto.title}/sponsor/${sponsorImageFile[0].originalname}`;
        const { data, error } = await this.storageService.uploadFile(
          storageConstants.COMMUNITY_CHALLENGE_BUCKET,
          filePath,
          sponsorImageFile[0].buffer,
          sponsorImageFile[0].mimetype,
        );
        if (error) {
          return { data: null, error: 'Failed to upload sponsor image' };
        }
        sponsorImageUrl = data.publicUrl;
      }

      const filePath = `${createCommunityChallengeDto.title}/${challengeImageFile[0].originalname}`;
      const { data, error } = await this.storageService.uploadFile(
        storageConstants.COMMUNITY_CHALLENGE_BUCKET,
        filePath,
        challengeImageFile[0].buffer,
        challengeImageFile[0].mimetype,
      );
      if (error) {
        return { data: null, error: 'Failed to upload challenge image' };
      }

      const targetCampaignCategoryConnections =
        createCommunityChallengeDto.targetCampaignCategoryIds?.map((id) => ({
          id,
        }));

      const challenge = await this.prisma.communityChallenge.create({
        data: {
          imageUrl: data.publicUrl,
          challengeType: createCommunityChallengeDto.challengeType,
          description: createCommunityChallengeDto.description,
          expiredAt: createCommunityChallengeDto.expiredAt,
          requiredDonationAmount:
            createCommunityChallengeDto.requiredDonationAmount,
          reward: createCommunityChallengeDto.reward,
          rewardCollectMethod: createCommunityChallengeDto.rewardCollectMethod,
          rule: createCommunityChallengeDto.rule,
          sponsorName: createCommunityChallengeDto.sponsorName,
          termsAndConditions: createCommunityChallengeDto.termsAndConditions,
          title: createCommunityChallengeDto.title,
          requiredNumOfDonation:
            createCommunityChallengeDto.requiredNumOfDonation,
          requirements: createCommunityChallengeDto.requirements,
          sponsorImageUrl: sponsorImageUrl ?? undefined,
          targetCampaignCategories: targetCampaignCategoryConnections
            ? {
                connect: targetCampaignCategoryConnections,
              }
            : undefined,
          isAutoSendReward: createCommunityChallengeDto.isAutoSendReward,
          rewardTemplateId: createCommunityChallengeDto.rewardTemplateId,
        },
        include: {
          targetCampaignCategories: true,
        },
      });
      return { data: challenge, error: null };
    } catch (e) {
      return { data: null, error: 'Failed to create challenge!' };
    }
  }

  async findAll(isExpired?: boolean): Promise<Result<CommunityChallenge[]>> {
    try {
      const challenges = await this.prisma.communityChallenge.findMany({
        where: {
          expiredAt: {
            gte: isExpired ? new Date() : undefined,
          },
        },
        include: {
          targetCampaignCategories: true,
          participants: {
            take: 4,
            include: {
              user: true,
            },
          },
        },
      });
      return { data: challenges, error: null };
    } catch (e) {
      return { data: null, error: 'Failed to fetch challenges' };
    }
  }

  async createParticipant(
    userId: string,
    createParticipantDto: CreateParticipantDto,
  ): Promise<Result<CommunityChallengeParticipant>> {
    try {
      const participant =
        await this.prisma.communityChallengeParticipant.create({
          data: {
            user: {
              connect: {
                id: userId,
              },
            },
            communityChallenge: {
              connect: {
                id: createParticipantDto.communityChallengeId,
              },
            },
          },
          include: {
            user: true,
          },
        });
      return { data: participant, error: null };
    } catch (e) {
      return { data: null, error: 'Failed to join challenge' };
    }
  }

  async findOne(id: string): Promise<Result<CommunityChallenge>> {
    let challenge = await this.prisma.communityChallenge.findUnique({
      where: {
        id: id,
      },
      include: {
        targetCampaignCategories: true,
        participants: {
          include: {
            user: true,
          },
        },
      },
    });

    if (challenge.challengeType === CommunityChallengeType.DONATION) {
      // Check whether participant has completed the challenge
      let formattedParticipants = [];
      for (const participant of challenge.participants) {
        const progress = await this._checkDonationChallengeParticipantProgress(
          participant,
          challenge,
        );
        if (progress) {
          formattedParticipants.push(progress);
        }
      }
      challenge = {
        ...challenge,
        participants: formattedParticipants,
      };
    }

    return { data: challenge, error: null };
    try {
    } catch (e) {
      return { data: null, error: 'Failed to fetch challenge' };
    }
  }

  async findParticipantProgress(
    userId: string,
    challengeId: string,
  ): Promise<Result<ChallengeParticipantEntity | null>> {
    try {
      const participant =
        await this.prisma.communityChallengeParticipant.findUnique({
          where: {
            userId_communityChallengeId: {
              userId: userId,
              communityChallengeId: challengeId,
            },
          },
          include: {
            user: true,
            communityChallenge: true,
          },
        });
      if (!participant) {
        return { data: null, error: null };
      }
      if (
        participant.communityChallenge.challengeType ===
        CommunityChallengeType.PHOTO
      ) {
        return { data: participant, error: null };
      }

      if (
        participant.communityChallenge.challengeType ===
        CommunityChallengeType.DONATION
      ) {
        const challengeProgress =
          await this._checkDonationChallengeParticipantProgress(
            participant,
            participant.communityChallenge,
          );
        return { data: challengeProgress, error: null };
        // const challengeStartTime = participant.communityChallenge.createdAt;

        // // Find user's donation since the challenge started
        // const donations = await this.prisma.campaignDonation.findMany({
        //   where: {
        //     createdAt: {
        //       lte: challengeStartTime,
        //     },
        //     userId: userId,
        //   },
        // });
        // const satisfiedDonations = donations.filter((donation) => {
        //   return (
        //     donation.amount >=
        //     participant.communityChallenge.requiredDonationAmount
        //   );
        // });
        // const challengeIsSuccess =
        //   satisfiedDonations.length >=
        //   participant.communityChallenge.requiredNumOfDonation;
        // return {
        //   data: { ...participant, challengeIsSuccess },
        //   error: null,
        // };
      }
    } catch (e) {
      return { data: null, error: 'Failed to fetch participant' };
    }
  }

  async adminUpdateChallengeParticipant(
    updateChallengeParticipantDto: AdminUpdateChallengeParticipantDto,
  ): Promise<Result<CommunityChallengeParticipant>> {
    try {
      const participant =
        await this.prisma.communityChallengeParticipant.update({
          where: {
            userId_communityChallengeId: {
              userId: updateChallengeParticipantDto.userId,
              communityChallengeId:
                updateChallengeParticipantDto.communityChallengeId,
            },
          },
          data: {
            rewardEmailId:
              updateChallengeParticipantDto.rewardEmailId ?? undefined,
            rejectReason: updateChallengeParticipantDto.rewardEmailId
              ? null
              : updateChallengeParticipantDto.rejectReason ?? undefined,
            status: updateChallengeParticipantDto.rewardEmailId
              ? ChallengeStatus.COMPLETED
              : undefined,
          },
          include: {
            user: true,
            communityChallenge: true,
          },
        });
      if (updateChallengeParticipantDto.rewardEmailId) {
        // Send reward
        // Create Notification
        await this.prisma.notification.create({
          data: {
            actorId: updateChallengeParticipantDto.userId,
            receiverId: updateChallengeParticipantDto.userId,
            description: `Get your reward from the '${participant.communityChallenge.title}' community challenge`,
            entityId: participant.communityChallengeId,
            title: participant.communityChallenge.reward,
            type: NotificationType.COMMUNITY_CHALLENGE_REWARD,
            isRead: false,
          },
        });
      }
      return { data: participant, error: null };
    } catch (e) {
      return { data: null, error: 'Failed to update participant data' };
    }
  }

  async updateChallengeParticipant(
    userId: string,
    updateChallengeParticipantDto: UpdateChallengeParticipantDto,
    imageFile?: Express.Multer.File,
  ): Promise<Result<CommunityChallengeParticipant>> {
    let imageUrl;
    if (imageFile) {
      const filePath = `participant/${userId}/${imageFile.originalname}`;
      const { data, error } = await this.storageService.uploadFile(
        storageConstants.COMMUNITY_CHALLENGE_BUCKET,
        filePath,
        imageFile.buffer,
        imageFile.mimetype,
      );
      if (error) {
        return { data: null, error: 'Failed to upload challenge image' };
      }
      imageUrl = data.publicUrl;
    }
    const participant = await this.prisma.communityChallengeParticipant.update({
      where: {
        userId_communityChallengeId: {
          userId: userId,
          communityChallengeId:
            updateChallengeParticipantDto.communityChallengeId,
        },
      },
      data: {
        metadata: imageUrl ? { imageUrl: imageUrl } : undefined,
        // Remove the reject reason when new image was uploaded
        rejectReason: imageUrl ? null : undefined,
        status: ChallengeStatus.UNDER_REVIEW,
      },
      include: {
        user: true,
      },
    });
    return { data: participant, error: null };
    try {
    } catch (e) {
      return { data: null, error: 'Failed to update participant data' };
    }
  }

  remove(id: number) {
    return `This action removes a #${id} communityChallenge`;
  }

  async _checkDonationChallengeParticipantProgress(
    participant: CommunityChallengeParticipant,
    communityChallenge: CommunityChallenge,
  ): Promise<ChallengeParticipantEntity | null> {
    // Find user's donation since the challenge started
    const donations = await this.prisma.campaignDonation.findMany({
      where: {
        createdAt: {
          gte: participant.createdAt,
        },
        userId: participant.userId,
      },
    });
    // console.log("user donations: ", donations);
    if (!donations) {
      return { ...participant, challengeIsSuccess: false };
    }
    const satisfiedDonations = donations.filter((donation) => {
      return donation.amount >= communityChallenge.requiredDonationAmount;
    });
    // console.log("satisfiedDonations: ", satisfiedDonations);
    const challengeIsSuccess =
      satisfiedDonations?.length >= communityChallenge.requiredNumOfDonation;
    if (challengeIsSuccess) {
      return {
        ...participant,
        challengeIsSuccess,
        status: ChallengeStatus.COMPLETED,
      };
    }
    return {
      ...participant,
      challengeIsSuccess,
    };
  }
}
