import { Prisma } from '@prisma/client';

export type CreateCampaignDto = Pick<
  Prisma.CampaignCreateInput,
  | 'title'
  | 'description'
  | 'targetAmount'
  | 'contactPhoneNumber'
  | 'beneficiaryName'
  | 'beneficiaryAgeGroup'
  | 'expiredAt'
> & {
  stateId: string;
  categoryId: string;
  organizationId?: string;
};
