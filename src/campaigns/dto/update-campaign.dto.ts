import {
  Campaign,
  CampaignPublishStatus,
  IdentificationStatus,
} from '@prisma/client';
import { CreateCampaignDto } from './create-campaign.dto';

export type UpdateCampaignDto = CreateCampaignDto & {
  oriCampaignImagesId: string[];
  oriBeneficiaryImageId?: string;
};

export type AdminUpdateCampaignDto = Partial<{
  fundraiserIdentificationStatus: IdentificationStatus;

  fundraiserIdentificationRejectReason: string;
  status: CampaignPublishStatus;
}>;

// export type AdminUpdateCampaignDto = Partial<
//   Pick<
//     Campaign,
//     | 'fundraiserIdentificationStatus'
//     | 'fundraiserIdentificationRejectReason'
//     | 'status'
//   >
// >;
