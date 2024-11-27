export const storageConstants = Object.freeze({
  CAMPAIGN_BUCKET: 'campaign',
  CAMPAIGN_IMAGE_PATH: 'images',
  CAMPAIGN_VIDEO_PATH: 'videos',
  CAMPAIGN_THUMBNAIL_PATH: 'thumbnail',
  CAMPAIGN_BENEFICIARY_IMAGE_PATH: 'beneficiary-images',
  USER_BUCKET: 'user',
  USER_IMAGE_PATH: 'images',
  CAMPAIGN_UPDATE_IMAGE_PATH: 'update-images',

  // Organization
  ORGANIZATION_BUCKET: 'organization',
  ORGANIZATION_IMAGE_PATH: 'images',

  // Community Challenge
  COMMUNITY_CHALLENGE_BUCKET: 'community-challenge',

  // Scam Report
  SCAM_REPORT_BUCKET: 'scam-report',
});

export const dbConstants = Object.freeze({
  PLATFORM_ACCOUNT_ID: 'super',
});

export type PaymentEntity = 'campaign_donation' | 'gift_card';
