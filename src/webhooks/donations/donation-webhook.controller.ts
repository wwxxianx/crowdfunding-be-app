import { InjectQueue } from '@nestjs/bull';
import { Controller, Post, Req } from '@nestjs/common';
import { Queue } from 'bull';
import { Request } from 'express';

export type ChallengeRewardJobPayload = {
  donationId: string;
};

@Controller('webhooks/donations')
export class DonationWebhookController {
  constructor(
    @InjectQueue('donation-challenge-reward')
    private readonly donationChallengeRewardQueue: Queue,
    @InjectQueue('donation') private readonly donationQueue: Queue,
  ) {}

  @Post('challenge-rewards')
  async handleDonationChallengeTask(@Req() request: Request) {
    console.log("donation webhook insert invoked");
    if (request.body.type !== 'INSERT') {
      return;
    }
    /**
     * {
     *  id
     *  userId
     *  campaignId
     *  amount
     *  isAnonymous
     * }
     */
    const dbRecord = request.body.record as any;
    const { id: donationId } = dbRecord;
    const jobPayload: ChallengeRewardJobPayload = {
      donationId,
    };
    console.log("donation webhook jobPayload:", jobPayload);
    await this.donationChallengeRewardQueue.add('challenge-reward', jobPayload);
  }

  @Post()
  async handleCampaignDonationInsert(@Req() request: Request) {
    if (request.body.type !== 'INSERT') {
      return;
    }
    /**
     * {
     *  id
     *  userId
     *  campaignId
     *  amount
     *  isAnonymous
     * }
     */
    const dbRecord = request.body.record as any;
    const { id: donationId } = dbRecord;
    const jobPayload = {
      donationId,
    };
    await this.donationQueue.add('donation', jobPayload);
  }
}
