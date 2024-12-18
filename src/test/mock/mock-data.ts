import {
  Campaign,
  CampaignCategory,
  CampaignDonation,
  CommunityChallenge,
  GiftCard,
  ScamReport,
  State,
  User,
} from '@prisma/client';
import { randomUUID } from 'crypto';

export const campaignCategorySamples: CampaignCategory[] = [
  {
    id: '1',
    title: 'education',
  },
  {
    id: '2',
    title: 'medical',
  },
];
export const stateAndRegionSamples: State[] = [
  {
    id: '1',
    name: 'johor bahru',
  },
  {
    id: '2',
    name: 'kuala lumpur',
  },
  {
    id: '3',
    name: 'penang',
  },
];
export const userSamples: User[] = [
  {
    id: '1',
    email: 'user1@gmail.com',
    fullName: 'Elissa',
    phoneNumber: '6011-21901',
    profileImageUrl: 'asd',
    isOnboardingCompleted: true,
    createdAt: new Date(),
    organizationId: null,
    refreshToken: randomUUID(),
    stripeCustomerId: null,
    identityNumber: '',
    identificationRejectReason: null,
    identificationStatus: 'PENDING',
    address: null,
    onesignalId: null,
    idFrontImageUrl: "",
    idBackImageUrl: "",
    selfieImageUrl: "",
  },
  {
    id: '2',
    email: 'user2@gmail.com',
    fullName: 'Elissa',
    phoneNumber: '6011-21901',
    profileImageUrl: 'asd',
    isOnboardingCompleted: true,
    createdAt: new Date(),
    organizationId: null,
    refreshToken: randomUUID(),
    stripeCustomerId: null,
    identityNumber: '',
    identificationRejectReason: null,
    identificationStatus: 'PENDING',
    onesignalId: null,
    address: null,
    idFrontImageUrl: "",
    idBackImageUrl: "",
    selfieImageUrl: "",
  },
];

export const campaignSamples: Campaign[] = [
  {
    id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'Save the Rainforest',
    description: 'A campaign to save the Amazon rainforest.',
    videoUrl: null,
    thumbnailUrl: 'https://example.com/images/rainforest_thumbnail.jpg',
    stateId: stateAndRegionSamples[0].id,
    targetAmount: 100000,
    contactPhoneNumber: '+1234567890',
    beneficiaryName: 'Rainforest Foundation',
    beneficiaryImageUrl: 'https://example.com/images/foundation.jpg',
    beneficiaryAgeGroup: 'ADULT_SENIOR',
    campaignCategoryId: campaignCategorySamples[1].id,
    organizationId: '123e4567-e89b-12d3-a456-426614174004',
    userId: userSamples[0].id,
    createdAt: new Date(),
    updatedAt: new Date(),
    status: 'PENDING',
    expiredAt: new Date(),
    fundraiserSignatureUrl: null,
    numOfComments: 0,
    numOfDonations: 0,
    numOfLikes: 0,
    numOfUpdates: 0,
    suspendReason: null,
  },
  {
    id: '2',
    title: 'Campaign 2',
    description: 'A campaign to save the Amazon rainforest.',
    videoUrl: null,
    thumbnailUrl: 'https://example.com/images/rainforest_thumbnail.jpg',
    stateId: stateAndRegionSamples[1].id,
    targetAmount: 100000,
    contactPhoneNumber: '+1234567890',
    beneficiaryName: 'Rainforest Foundation',
    beneficiaryImageUrl: 'https://example.com/images/foundation.jpg',
    beneficiaryAgeGroup: 'ADULT_SENIOR',
    campaignCategoryId: campaignCategorySamples[0].id,
    organizationId: '123e4567-e89b-12d3-a456-426614174004',
    userId: userSamples[1].id,
    createdAt: new Date(),
    updatedAt: new Date(),
    status: 'PENDING',
    expiredAt: new Date(),
    fundraiserSignatureUrl: null,
    numOfComments: 0,
    numOfDonations: 0,
    numOfLikes: 0,
    numOfUpdates: 0,
    suspendReason: null,
  },
];

export const scamReportSample: ScamReport = {
  id: '123e4567-e89b-12d3-a456-426614174010',
  userId: '123e4567-e89b-12d3-a456-426614174007',
  campaignId: '123e4567-e89b-12d3-a456-426614174000',
  description: 'The campaign seems fraudulent.',
  evidenceUrls: [
    'https://example.com/evidence1.jpg',
    'https://example.com/evidence2.jpg',
  ],
  documentUrls: [
    'https://example.com/document1.pdf',
    'https://example.com/document2.pdf',
  ],
  status: 'PENDING',
  resolution: 'Under investigation',
  resolvedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const communityChallengeSamples: CommunityChallenge[] = [
  {
    id: 'a1b2c3d4-e5f6-7g8h-9i0j-1234567890ab',
    title: 'Eco-Friendly Donation Drive',
    imageUrl: '',
    description: 'Donate to environmental causes and help save the planet.',
    requirements: [],
    rule: 'Donations must be made within the campaign period.',
    termsAndConditions: 'Participants must be over 18 years old.',
    challengeType: 'DONATION',
    rewardCollectMethod: 'EMAIL',
    reward: 'E-certificate of appreciation',
    sponsorImageUrl: 'https://example.com/images/sponsor.jpg',
    sponsorName: 'EcoCorp',
    requiredNumOfDonation: 2,
    requiredDonationAmount: 50,
    createdAt: new Date(),
    expiredAt: new Date(),
    isAutoSendReward: false,
    rewardTemplateId: '',
  },
  {
    id: 'b2c3d4e5-f6g7-h8i9-j0k1-234567890abc',
    title: 'Healthy Living Photo Challenge',
    imageUrl: '',
    description: 'Share photos of your healthy lifestyle and inspire others.',
    requirements: [
      'Upload at least one photo',
      'Photos must promote healthy living',
    ],
    rule: 'Photos must be original and taken by the participant.',
    termsAndConditions: 'Participants must be over 18 years old.',
    challengeType: 'PHOTO',
    rewardCollectMethod: 'EMAIL',
    reward: 'Gift voucher worth $20',
    sponsorImageUrl: 'https://example.com/images/sponsor2.jpg',
    sponsorName: 'HealthCorp',
    requiredNumOfDonation: null,
    requiredDonationAmount: null,
    createdAt: new Date(),
    expiredAt: new Date(),
    isAutoSendReward: false,
    rewardTemplateId: '',
  },
];

export const giftCardSamples: GiftCard[] = [
  {
    id: 'giftCardId',
    senderId: userSamples[0].id,
    receiverId: userSamples[1].id,
    amount: 500,
    message: 'Message',
    stripeTransferGroupId: 'gcID',
    createdAt: new Date(),
    campaignDonationId: null,
  },
];

export const campaignDonationSamples: CampaignDonation[] = [
  {
    amount: 50,
    campaignId: campaignSamples[0].id,
    createdAt: new Date(),
    id: 'id',
    isAnonymous: false,
    paymentIntentId: 'id',
    userId: userSamples[0].id,
  },
];

export const fileSamples = [
  {
    originalname: 'profile.png',
    buffer: Buffer.from(''),
    mimetype: 'image/png',
  },
] as Express.Multer.File[];
