import { CommunityChallenge } from '@prisma/client';

export type CreateCommunityChallengeDto = Partial<
  Pick<
    CommunityChallenge,
    | 'challengeType'
    | 'description'
    | 'expiredAt'
    | 'requiredDonationAmount'
    | 'requiredNumOfDonation'
    | 'requirements'
    | 'reward'
    | 'rewardCollectMethod'
    | 'rule'
    | 'sponsorImageUrl'
    | 'sponsorName'
    | 'termsAndConditions'
    | 'title'
    | 'isAutoSendReward'
    | 'rewardTemplateId'
  >
> & {
  targetCampaignCategoryIds: string[];
};

export type MultiPartJsonDto = {
  jsonData: string;
};
