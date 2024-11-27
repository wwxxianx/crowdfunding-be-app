import { CommunityChallengeParticipant } from '@prisma/client';

export type AdminUpdateChallengeParticipantDto = {
  communityChallengeId: string;
  userId: string;
  rejectReason?: string;
  rewardEmailId?: string;
};

export type UpdateChallengeParticipantDto = {
  communityChallengeId: string;
};
