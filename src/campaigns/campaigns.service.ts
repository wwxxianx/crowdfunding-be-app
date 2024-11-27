import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import {
  Campaign,
  CommunityChallenge,
  CommunityChallengeType,
  IdentificationStatus,
  Prisma,
} from '@prisma/client';
import { Cache } from 'cache-manager';
import { storageConstants } from 'src/common/constants/constants';
import { PrismaService } from 'src/common/data/prisma.service';
import { StorageService } from 'src/storage/storage.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateFundraiserDto } from './dto/update-fundraiser.dto';
import { CampaignFundraiser } from './entities/campaign-fundraiser.entity';
import { CampaignFilters } from './types/fetch-campaigns-filters';
import { AdminUpdateCampaignDto } from './dto/update-campaign.dto';
import { NotificationsService } from 'src/notifications/notifications.service';
import { redisConstants } from 'src/common/constants/redis';

@Injectable()
export class CampaignsService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheService: Cache,
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    private readonly notificationService: NotificationsService,
  ) {}

  async adminUpdateCampaign(campaignId: string, dto: AdminUpdateCampaignDto) {
    try {
      const campaign = await this.prisma.campaign.update({
        where: {
          id: campaignId,
        },
        data: {
          status: dto.status,
          user: {
            update: {
              identificationStatus:
                dto.fundraiserIdentificationStatus ?? undefined,
              identificationRejectReason:
                dto.fundraiserIdentificationRejectReason ?? undefined,
            },
          },
        },
        include: {
          user: {
            include: {
              bankAccount: true,
            },
          },
          images: true,
          campaignCategory: true,
          stateAndRegion: true,
          donations: {
            include: {
              user: true,
            },
          },
        },
      });

      await this.notificationService.createCampaignStatusChangedNotification({
        campaignId: campaignId,
        status: dto.status,
      });

      return campaign;
    } catch (e) {}
  }

  async create(
    userId: string,
    createCampaignDto: CreateCampaignDto,
    campaignImages?: Express.Multer.File[],
    campaignVideo?: Express.Multer.File,
    beneficiaryImage?: Express.Multer.File,
  ): Promise<Result<Campaign>> {
    try {
      let imageUrls: string[] = [];
      let videoUrl: string | null = null;
      let beneficiaryImageUrl: string | null = null;
      let thumbnailUrl: string;

      // Generate thumbnail
      const thumbnailFilePath = `${storageConstants.CAMPAIGN_THUMBNAIL_PATH}/${campaignImages[0].originalname}`;
      const { data: thumbnailData, error: thumbnailError } =
        await this.storageService.uploadFile(
          storageConstants.CAMPAIGN_BUCKET,
          thumbnailFilePath,
          campaignImages[0].buffer,
          campaignImages[0].mimetype,
        );
      if (thumbnailError) {
        return { error: 'Failed to upload thumbnail image', data: null };
      }
      thumbnailUrl = thumbnailData.publicUrl;

      for (const imageFile of campaignImages) {
        const filePath = `${storageConstants.CAMPAIGN_IMAGE_PATH}/${imageFile.originalname}`;
        const { data, error } = await this.storageService.uploadFile(
          storageConstants.CAMPAIGN_BUCKET,
          filePath,
          imageFile.buffer,
          imageFile.mimetype,
        );

        if (error) {
          return { data: null, error: 'Failed to upload image' };
        }

        imageUrls.push(data.publicUrl);
      }

      if (campaignVideo) {
        // console.log(JSON.stringify(campaignVideo, null, 2));
        console.log(campaignVideo[0]);
        const filePath = `${storageConstants.CAMPAIGN_VIDEO_PATH}/${createCampaignDto.title}/${campaignVideo[0].originalname}`;
        const { data, error } = await this.storageService.uploadFile(
          storageConstants.CAMPAIGN_BUCKET,
          filePath,
          campaignVideo[0].buffer,
          campaignVideo[0].mimetype,
        );
        if (error) {
          // Handle error
          return { data: null, error: 'Failed to upload video' };
        }
        videoUrl = data.publicUrl;
      }

      if (beneficiaryImage) {
        const filePath = `${storageConstants.CAMPAIGN_BENEFICIARY_IMAGE_PATH}/${createCampaignDto.title}/${beneficiaryImage[0].originalname}`;
        const { data, error } = await this.storageService.uploadFile(
          storageConstants.CAMPAIGN_BUCKET,
          filePath,
          beneficiaryImage[0].buffer,
          beneficiaryImage[0].mimetype,
        );
        if (error) {
          return { data: null, error: 'Failed to upload beneficiary image' };
        }
        beneficiaryImageUrl = data.publicUrl;
      }
      //Upload to DB
      const images = imageUrls.map((url) => ({
        imageUrl: url,
      }));
      const campaign = await this.prisma.campaign.create({
        data: {
          beneficiaryName: createCampaignDto.beneficiaryName,
          title: createCampaignDto.title,
          description: createCampaignDto.description,
          targetAmount: createCampaignDto.targetAmount,
          contactPhoneNumber: createCampaignDto.contactPhoneNumber,
          beneficiaryAgeGroup: createCampaignDto.beneficiaryAgeGroup,
          campaignCategory: { connect: { id: createCampaignDto.categoryId } },
          stateAndRegion: { connect: { id: createCampaignDto.stateId } },
          user: { connect: { id: userId } },
          thumbnailUrl: thumbnailUrl,
          beneficiaryImageUrl: beneficiaryImageUrl ?? undefined,
          images: {
            createMany: {
              data: images,
            },
          },
          videoUrl: videoUrl ?? undefined,
          expiredAt: createCampaignDto.expiredAt,
        },
      });
      return { data: campaign, error: null };
    } catch (e) {
      return { error: 'Failed to create campaign', data: null };
    }
  }

  async findAll(filters: CampaignFilters) {
    const {
      categoryIds,
      stateIds,
      userId,
      searchQuery,
      isPublished,
      identificationStatus,
    } = filters;
    // const cacheKey = this._generateCampaignsCacheKey(filters);
    // await this.cacheService.del(cacheKey);
    // const cachedData = await this.cacheService.get(cacheKey);
    // if (cachedData) {
    //   return cachedData;
    // }
    const campaigns = await this.prisma.campaign.findMany({
      where: {
        AND: [
          {
            status:
              isPublished != null
                ? isPublished
                  ? 'PUBLISHED'
                  : 'PENDING'
                : undefined,
          },
          {
            user: {
              identificationStatus: identificationStatus
                ? identificationStatus
                : undefined,
            },
          },
        ],
        userId: userId ? userId : undefined,
        campaignCategory: {
          id: {
            in: categoryIds.length ? categoryIds : undefined,
          },
        },
        stateAndRegion: {
          id: {
            in: stateIds.length ? stateIds : undefined,
          },
        },
        OR: searchQuery
          ? [
              {
                title: {
                  contains: searchQuery,
                  mode: 'insensitive',
                },
              },
              {
                organization: {
                  name: {
                    contains: searchQuery,
                    mode: 'insensitive',
                  },
                },
              },
            ]
          : undefined,
      },
      include: {
        stateAndRegion: true,
        user: {
          include: {
            bankAccount: true,
          },
        },
        images: true,
        campaignCategory: true,
        organization: true,
        donations: true,
      },
    });

    let formattedCampaigns = [];
    for (let campaign of campaigns) {
      const firstMatchedCommunityChallenge =
        await this._findFirstMatchedCommunityChallenge(campaign);
      const formmatedCampaign = {
        ...campaign,
        raisedAmount: campaign.donations?.reduce(
          (prev, current) => prev + current.amount,
          0,
        ),
        firstMatchedCommunityChallenge,
      };
      formattedCampaigns.push(formmatedCampaign);
    }
    // await this.cacheService.set(cacheKey, formattedCampaigns);
    return formattedCampaigns;
  }

  async findUserInterestedCampaigns(userId: string) {
    try {
      const userPreference = await this.prisma.userPreference.findFirst({
        where: {
          userId: userId,
        },
        include: {
          favouriteCampaignCategories: true,
        },
      });
      if (!userPreference || !userPreference.favouriteCampaignCategories) {
        return { data: [] };
      }
      const campaigns = await this.prisma.campaign.findMany({
        where: {
          campaignCategoryId: {
            in: userPreference.favouriteCampaignCategories.map(
              (category) => category.id,
            ),
          },
        },
        include: {
          donations: true,
          campaignCategory: true,
          images: true,
          stateAndRegion: true,
          user: {
            include: {
              bankAccount: true,
            },
          },
        },
        take: 5,
      });
      if (campaigns) {
        let formattedCampaigns = [];
        for (let campaign of campaigns) {
          const firstMatchedCommunityChallenge =
            await this._findFirstMatchedCommunityChallenge(campaign);
          const formmatedCampaign = {
            ...campaign,
            raisedAmount: campaign.donations?.reduce(
              (prev, current) => prev + current.amount,
              0,
            ),
            firstMatchedCommunityChallenge,
          };
          formattedCampaigns.push(formmatedCampaign);
        }
        return { data: formattedCampaigns };
      }
      return { data: [] };
    } catch (e) {
      return { data: null, error: 'Failed to fetch user interested campaigns' };
    }
  }

  async findCloseToTargetCampaigns() {
    try {
      const cacheKey = `${redisConstants.CAMPAIGN_KEY}:close-to-target`;
      const cachedData = await this.cacheService.get(cacheKey);
      if (cachedData) {
        return { data: cachedData };
      }

      const campaigns = await this.prisma.campaign.findMany({
        include: {
          donations: true,
          campaignCategory: true,
          images: true,
          stateAndRegion: true,
          user: true,
        },
      });
      const closeToTargetCampaigns = campaigns.filter((campaign) => {
        const totalDonations = campaign.donations.reduce(
          (sum, donation) => sum + donation.amount,
          0,
        );
        const percentageRaised = (totalDonations / campaign.targetAmount) * 100;
        return percentageRaised >= 80 && percentageRaised < 100;
      });
      if (closeToTargetCampaigns) {
        let formattedCampaigns = [];
        for (let campaign of closeToTargetCampaigns) {
          const firstMatchedCommunityChallenge =
            await this._findFirstMatchedCommunityChallenge(campaign);
          const formmatedCampaign = {
            ...campaign,
            raisedAmount: campaign.donations?.reduce(
              (prev, current) => prev + current.amount,
              0,
            ),
            firstMatchedCommunityChallenge,
          };
          formattedCampaigns.push(formmatedCampaign);
        }

        await this.cacheService.set(
          cacheKey,
          formattedCampaigns,
          redisConstants.CAMPAIGN_TTL,
        );
        return { data: formattedCampaigns };
      }
      return { data: [] };
    } catch (e) {
      return {
        data: null,
        error: "Failed to find campaigns that's close to target",
      };
    }
  }

  async findSuccessfulCampaigns(): Promise<Result<Campaign[]>> {
    const data = await this.prisma.$queryRaw`
    SELECT c.*, 
           SUM(d.amount) AS "totalDonations",
           s.name AS "stateAndRegion",
           cat.title AS "campaignCategory",
           u.* AS "user"
    FROM campaigns c
    LEFT JOIN campaign_donations d ON c.id = d."campaignId"
    LEFT JOIN states s ON c."stateId" = s.id
    LEFT JOIN campaign_categories cat ON c."campaignCategoryId" = cat.id
    LEFT JOIN users u ON c."userId" = u.id
    GROUP BY c.id, s.name, cat.title, u.id
    HAVING SUM(d.amount) >= c."targetAmount"
  `;

    const formattedCampaigns = (data as any[])?.map((campaign) => ({
      ...campaign,
      totalDonations: campaign.totalDonations
        ? Number(campaign.totalDonations)
        : 0,
      campaignCategory: {
        id: campaign.campaignCategoryId,
        title: campaign.campaignCategory,
      },
      stateAndRegion: {
        id: campaign.stateId,
        name: campaign.stateAndRegion,
      },
      raisedAmount: campaign.totalDonations
        ? Number(campaign.totalDonations)
        : 0,
      user: {
        id: campaign.userId,
        isOnboardingCompleted: campaign.isOnboardingCompleted,
        fullName: campaign.fullName,
        email: campaign.email,
        profileImageUrl: campaign.profileImageUrl,
        phoneNumber: campaign.phoneNumber,
        refreshToken: campaign.refreshToken,
        stripeCustomerId: campaign.stripeCustomerId,
        stripeConnectId: campaign.stripeConnectId,
        identityNumber: campaign.identityNumber,
        identificationStatus: campaign.identificationStatus,
        identificationRejectReason: campaign.identificationRejectReason,
      },
    }));
    return { data: formattedCampaigns };
  }

  async findFundraiser(id: string) {
    return await this.prisma.campaign.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
        fundraiserSignatureUrl: true,
        user: true,
      },
    });
  }

  async updateFundraiser(
    campaignId: string,
    updateFundraiserDto: UpdateFundraiserDto,
    signatureFile?: Express.Multer.File,
  ): Promise<Result<CampaignFundraiser>> {
    try {
      let signatureFileUrl;
      if (signatureFile) {
        const filePath = `signature/${campaignId}/${signatureFile.originalname}`;
        const { data, error } = await this.storageService.uploadFile(
          storageConstants.CAMPAIGN_BUCKET,
          filePath,
          signatureFile.buffer,
          signatureFile.mimetype,
        );
        if (error) {
          return { error: 'Failed to upload signature file', data: null };
        }
        signatureFileUrl = data.publicUrl;
      }
      const campaignFundraiser = await this.prisma.campaign.update({
        where: {
          id: campaignId,
        },
        data: {
          fundraiserSignatureUrl: signatureFileUrl ?? undefined,
          user: {
            update: {
              identityNumber:
                updateFundraiserDto.fundraiserIdentityNumber ?? undefined,
              identificationStatus: IdentificationStatus.UNDER_REVIEW,
            },
          },
        },
        select: {
          id: true,
          fundraiserSignatureUrl: true,
          user: true,
        },
      });
      return { data: campaignFundraiser, error: null };
    } catch (e) {
      return { error: 'Something went wrong', data: null };
    }
  }

  async findOne(id: string): Promise<Result<Campaign>> {
    try {
      const topThreeDonations = await this.prisma.campaignDonation.findMany({
        where: {
          campaignId: id,
        },
        orderBy: {
          amount: 'desc', // Adjust the field used for sorting based on your schema
        },
        take: 3,
        include: {
          user: true,
        },
      });

      const recentThreeDonations = await this.prisma.campaignDonation.findMany({
        where: {
          campaignId: id,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 3,
        include: {
          user: true,
        },
      });

      const campaign = await this.prisma.campaign.findUnique({
        where: {
          id: id,
        },
        include: {
          comments: {
            include: {
              user: true,
              replies: {
                include: {
                  user: true,
                },
              },
            },
          },
          stateAndRegion: true,
          campaignCategory: true,
          campaignUpdates: {
            include: {
              user: true,
              images: true,
            },
          },
          donations: {
            include: {
              user: true,
            },
          },
          images: true,
          user: {
            include: {
              bankAccount: true,
            },
          },
          organization: true,
        },
      });

      const firstMatchedCommunityChallenge =
        await this._findFirstMatchedCommunityChallenge(campaign);
      let formattedCampaign: any = {
        ...campaign,
        recentThreeDonations,
        topThreeDonations,
        raisedAmount: campaign.donations?.reduce(
          (prev, current) => prev + current.amount,
          0,
        ),
        firstMatchedCommunityChallenge,
      };
      // find collaboration
      const collaboration = await this.prisma.collaboration.findFirst({
        where: {
          campaignId: id,
          isCancelled: false,
        },
        include: {
          organization: {
            include: { createdBy: true },
          },
        },
      });

      if (collaboration && collaboration.organization) {
        formattedCampaign.collaboratedOrganization = collaboration.organization;
      }

      return { data: formattedCampaign, error: null };
    } catch (e) {
      return { error: e, data: null };
    }
  }

  async _findFirstMatchedCommunityChallenge(
    campaign: Campaign,
  ): Promise<CommunityChallenge | null> {
    const cacheKey = `campaign-category-matched-challenge:${campaign.campaignCategoryId}`;
    const cachedData = await this.cacheService.get(cacheKey);
    const ttl = 10 * 1000;
    if (cachedData) {
      return cachedData as any;
    }
    const firstMatchedCommunityChallenge =
      await this.prisma.communityChallenge.findFirst({
        where: {
          AND: [
            {
              OR: [
                { challengeType: CommunityChallengeType.PHOTO },
                {
                  AND: {
                    challengeType: CommunityChallengeType.DONATION,
                    OR: [
                      { targetCampaignCategories: { none: {} } },
                      {
                        targetCampaignCategories: {
                          some: {
                            id: {
                              equals: campaign.campaignCategoryId,
                            },
                          },
                        },
                      },
                    ],
                  },
                },
              ],
            },
            { expiredAt: { gte: new Date() } },
          ],
        },
        include: {
          targetCampaignCategories: true,
        },
      });
    if (firstMatchedCommunityChallenge) {
      await this.cacheService.set(
        cacheKey,
        firstMatchedCommunityChallenge,
        ttl,
      );
    }
    return firstMatchedCommunityChallenge;
  }

  private _generateCampaignsCacheKey(filters: CampaignFilters): string {
    const {
      categoryIds,
      stateIds,
      userId,
      searchQuery,
      isPublished,
      identificationStatus,
    } = filters;

    const categoryKey = categoryIds.length ? categoryIds.join(',') : 'all';
    const stateKey = stateIds.length ? stateIds.join(',') : 'all';
    const userKey = userId ?? 'all';
    const searchKey = searchQuery ?? 'all';
    const publishKey =
      isPublished !== undefined ? isPublished.toString() : 'all';
    const statusKey = identificationStatus ?? 'all';

    return `cache:campaigns:${categoryKey}:${stateKey}:${userKey}:${searchKey}:${publishKey}:${statusKey}`;
  }

  async createDonation(createDonationDto: Prisma.CampaignDonationCreateInput) {
    return await this.prisma.campaignDonation.create({
      data: createDonationDto,
      include: {
        campaign: {
          include: {
            collaboration: {
              include: {
                organization: {
                  include: {
                    bankAccount: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }
}
