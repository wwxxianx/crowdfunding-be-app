import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { State } from '@prisma/client';
import { Cache } from 'cache-manager';
import { redisConstants } from 'src/common/constants/redis';
import { PrismaService } from 'src/common/data/prisma.service';

@Injectable()
export class StateAndRegionsService {
  constructor (
    @Inject(CACHE_MANAGER) private readonly cacheService: Cache,
    private readonly prisma: PrismaService,
  ) {}

  async findAll(): Promise<Result<State[]>> {
    try {
      const cacheData: State[] = await this.cacheService.get(redisConstants.STATE_REGION_KEY);
      if (cacheData && cacheData.length) {
        return { data: cacheData };
      }
      const data = await this.prisma.state.findMany();
      if (!data) {
        return { error: "Failed to fetch state and regions", data: null };
      }
      await this.cacheService.set(redisConstants.STATE_REGION_KEY, data);
      return { data };
    } catch (e) {
      return { error: "Failed to fetch state and regions", data: null };
    }
  }
}
