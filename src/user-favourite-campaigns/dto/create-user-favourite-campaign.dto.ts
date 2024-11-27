import { UserFavouriteCampaign } from '@prisma/client';

export type CreateUserFavouriteCampaignDto = Pick<
  UserFavouriteCampaign,
  'campaignId'
>;
