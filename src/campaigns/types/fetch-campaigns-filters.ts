import { IdentificationStatus } from '@prisma/client';

export type CampaignFilters = {
  categoryIds: string[];
  stateIds: string[];
  userId?: string;
  searchQuery?: string;
  isPublished?: boolean;
  identificationStatus?: IdentificationStatus;
};
