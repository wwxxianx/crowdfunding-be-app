import { CampaignUpdate } from "@prisma/client";

export type CreateCampaignUpdateDto = Pick<CampaignUpdate, "campaignId" | "description" | "title">