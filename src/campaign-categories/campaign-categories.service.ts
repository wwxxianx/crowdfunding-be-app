import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { redisConstants } from 'src/common/constants/redis';
import { PrismaService } from 'src/common/data/prisma.service';

@Injectable()
export class CampaignCategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheService: Cache,
  ) {}

  async findAll() {
    try {
      const cachedData = await this.cacheService.get(redisConstants.CAMPAIGN_CATEGORY_KEY);
      if (cachedData) {
        return { data: cachedData };
      }
      const campaignCategories = await this.prisma.campaignCategory.findMany();
      await this.cacheService.set(redisConstants.CAMPAIGN_CATEGORY_KEY, campaignCategories, redisConstants.CAMPAIGN_CATEGORY_TTL);
      return { data: campaignCategories };
    } catch (e) {
      return { data: null, error: "Failed to fetch categories" };
    }
  }
}
