import { Collaboration } from "@prisma/client";

export type UpdateCollaborationDto = Partial<Pick<Collaboration, 'organizationId' | 'reward'>>;
