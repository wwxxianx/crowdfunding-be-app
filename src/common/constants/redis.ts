import { secondsToMilliseconds } from '../utils/time';

export const redisConstants = Object.freeze({
  CAMPAIGN_CATEGORY_KEY: 'cache:campaign-categories',
  CAMPAIGN_CATEGORY_TTL: secondsToMilliseconds(30),

  STATE_REGION_KEY: 'cache:state-and-regions',
  STATE_REGION_TTL: secondsToMilliseconds(30),

  CAMPAIGN_KEY: 'cache:campaigns',
  CAMPAIGN_TTL: secondsToMilliseconds(120),

  COMMUNITY_CHALLENGE_KEY: 'cache:community-challenges',
  COMMUNITY_CHALLENGE_TTL: secondsToMilliseconds(3),

  USER_NOTIFICATION_KEY: 'cache:users-notifications',
  USER_NOTIFICATION_TTL: secondsToMilliseconds(10),

  USER_FAVOURITE_CAMPAIGN_KEY: 'cache:user-favourite-campaigns:',
  USER_FAVOURITE_CAMPAIGN_TTL: secondsToMilliseconds(3),

  USER_KEY: 'cache:users',
  USER_TTL: secondsToMilliseconds(3),
});
