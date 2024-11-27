import { Controller, Get, InternalServerErrorException } from '@nestjs/common';
import { CampaignCategoriesService } from './campaign-categories.service';
import { StorageService } from 'src/storage/storage.service';
import { storageConstants } from 'src/common/constants/constants';
import { generate } from 'rxjs';
import { CampaignDonation } from '@prisma/client';

@Controller('campaign-categories')
export class CampaignCategoriesController {
  constructor(
    private readonly campaignCategoriesService: CampaignCategoriesService,
    private readonly storageService: StorageService,
  ) {}

  @Get()
  async findAll() {
    const { data, error } = await this.campaignCategoriesService.findAll();
    if (error) {
      throw new InternalServerErrorException(error);
    }
    return data;
  }
}
