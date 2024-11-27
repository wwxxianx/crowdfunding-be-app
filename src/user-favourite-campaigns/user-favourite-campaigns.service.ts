import { Inject, Injectable } from '@nestjs/common';
import { UserFavouriteCampaign } from '@prisma/client';
import { PrismaService } from 'src/common/data/prisma.service';
import { CreateUserFavouriteCampaignDto } from './dto/create-user-favourite-campaign.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { redisConstants } from 'src/common/constants/redis';

@Injectable()
export class UserFavouriteCampaignsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheService: Cache,
  ) {}

  async create(
    userId: string,
    createUserFavouriteCampaignDto: CreateUserFavouriteCampaignDto,
  ): Promise<Result<UserFavouriteCampaign>> {
    try {
      const data = await this.prisma.userFavouriteCampaign.create({
        data: {
          user: {
            connect: {
              id: userId,
            },
          },
          campaign: {
            connect: {
              id: createUserFavouriteCampaignDto.campaignId,
            },
          },
        },
        include: {
          user: true,
          campaign: {
            include: {
              campaignCategory: true,
              stateAndRegion: true,
              images: true,
              user: true,
            },
          },
        },
      });
      
      // Delete , invalidate cache data
      await this.cacheService.del(
        `${redisConstants.USER_FAVOURITE_CAMPAIGN_KEY}:/${userId}`,
      );
      return { data };
    } catch (e) {
      return { error: 'Failed to create favourite', data: null };
    }
  }

  async findAllByUserId(
    userId: string,
  ): Promise<Result<UserFavouriteCampaign[]>> {
    try {
      // Check cache
      const cacheKey = `${redisConstants.USER_FAVOURITE_CAMPAIGN_KEY}:/${userId}`;
      const cachedData: UserFavouriteCampaign[] =
        await this.cacheService.get(cacheKey);
      if (cachedData) {
        return { data: cachedData };
      }

      // No cache data, then query db
      const data = await this.prisma.userFavouriteCampaign.findMany({
        where: {
          user: {
            id: userId,
          },
        },
        include: {
          user: true,
          campaign: {
            include: {
              campaignCategory: true,
              stateAndRegion: true,
              images: true,
              user: true,
            },
          },
        },
      });

      // Save to cache
      await this.cacheService.set(
        cacheKey,
        data,
        redisConstants.USER_FAVOURITE_CAMPAIGN_TTL,
      );
      return { data };
    } catch (e) {
      return {
        error: "Failed to fetch user's favourite campaigns",
        data: null,
      };
    }
  }

  async remove(
    userId: string,
    deleteUserFavouriteCampaignDto: CreateUserFavouriteCampaignDto,
  ): Promise<Result<UserFavouriteCampaign>> {
    try {
      const data = await this.prisma.userFavouriteCampaign.delete({
        where: {
          userId_campaignId: {
            userId: userId,
            campaignId: deleteUserFavouriteCampaignDto.campaignId,
          },
        },
      });
      return { data };
    } catch (e) {
      return { error: 'Failed to remove favourite', data: null };
    }
  }
}
