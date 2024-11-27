import { CampaignComment } from '@prisma/client';

export type CreateCampaignReplyDto = Pick<
  CampaignComment,
  'campaignId' | 'parentId' | 'comment'
>;
