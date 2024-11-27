import { CampaignDonation } from '@prisma/client';
import { PaymentEntity } from 'src/common/constants/constants';
import { ConvertToStrings } from 'src/common/utils/convert-type-to-string';

export type PaymentIntentPayload = {
  amount: number;
  stripeConnectAccountId?: string;
  transferGroupId?: string;
};

export type CampaignDonationPaymentMetadata = Pick<
  CampaignDonation,
  'amount' | 'campaignId' | 'userId' | 'isAnonymous'
> & {
  paymentEntity: PaymentEntity;
  giftCardId?: string;
};
export type CampaignDonationPaymentMetadataAsStrings =
  ConvertToStrings<CampaignDonationPaymentMetadata>;
