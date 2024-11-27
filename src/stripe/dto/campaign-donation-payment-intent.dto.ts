export type CampaignDonationPaymentIntentDto = {
  amount: number;
  campaignId: string;
  isAnonymous: boolean;
  giftCardId?: string;
};
