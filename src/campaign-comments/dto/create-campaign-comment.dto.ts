import { CampaignComment } from '@prisma/client';

export type CreateCampaignCommentDto = Pick<
  CampaignComment,
  'campaignId' | 'comment'
>;
