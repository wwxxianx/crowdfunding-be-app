import { CommunityChallengeParticipant } from '@prisma/client';

export type ChallengeParticipantEntity = CommunityChallengeParticipant & {
  challengeIsSuccess?: boolean;
};
