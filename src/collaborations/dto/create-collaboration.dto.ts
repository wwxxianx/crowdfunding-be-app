import { Collaboration } from "@prisma/client";

export type CreateCollaborationDto = Pick<Collaboration, 'campaignId' | 'reward'>;
