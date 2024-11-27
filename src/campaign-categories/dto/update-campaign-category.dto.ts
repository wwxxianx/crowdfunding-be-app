import { PartialType } from '@nestjs/mapped-types';
import { CreateCampaignCategoryDto } from './create-campaign-category.dto';

export class UpdateCampaignCategoryDto extends PartialType(CreateCampaignCategoryDto) {}
