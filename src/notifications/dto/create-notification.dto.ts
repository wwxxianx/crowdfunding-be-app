import { CampaignPublishStatus } from "@prisma/client";

export class CreateNotificationDto {}

export type ScamNotificationDto = {
  campaignId: string;
  title: string;
  description: string;
};

export type CampaignStatusChangedNotificationDto = {
  campaignId: string;
  status: CampaignPublishStatus;
}