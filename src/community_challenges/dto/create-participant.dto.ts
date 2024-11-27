import { CommunityChallenge, CommunityChallengeParticipant } from "@prisma/client";

export type CreateParticipantDto = Pick<CommunityChallengeParticipant, 'communityChallengeId'>;