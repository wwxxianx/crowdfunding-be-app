import { Campaign, User } from '@prisma/client';

export type CampaignFundraiser = Pick<
  Campaign,
  | 'fundraiserSignatureUrl'
> & {
  id: string;
  user: User
};
