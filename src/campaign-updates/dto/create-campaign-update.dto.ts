import { CampaignUpdate } from '@prisma/client';

export type CreateCampaignUpdateDto = Pick<
  CampaignUpdate,
  'campaignId' | 'title' | 'description'
>;

export type CreateCampaignUpdateRecommendationDto = {
  campaignId: string;
  topic: string;
}