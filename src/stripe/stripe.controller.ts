import {
  Body,
  Controller,
  Get,
  HttpCode,
  InternalServerErrorException,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { StripeService } from './stripe.service';
import { AccessTokenGuard } from 'src/common/guards/auth/access-token.guard';
import { GetCurrentUserId } from 'src/common/decorators/get-current-user-id.decorator';
import { PrismaService } from 'src/common/data/prisma.service';
import { CampaignDonationPaymentIntentDto } from './dto/campaign-donation-payment-intent.dto';
import {
  PaymentIntentPayload,
  CampaignDonationPaymentMetadata,
  CampaignDonationPaymentMetadataAsStrings,
} from './dto/campaign-donation-payment-intent.payload';
import { CampaignsService } from 'src/campaigns/campaigns.service';
import { Request } from 'express';
import { stringToBool } from 'src/common/utils/string-to-bool';
import {
  GiftCardPaymentIntentDto,
  GiftCardPaymentMetadata,
  GiftCardPaymentMetadataAsStrings,
} from './dto/gift-card-payment-intent.dto';
import { GiftCardsService } from 'src/gift-cards/gift-cards.service';
import { CreateOnboardUpdateLinkDto } from './dto/create-onboard-update-link.dto';
import { v4 as uuidv4 } from 'uuid';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { ChallengeRewardJobPayload } from 'src/webhooks/donations/donation-webhook.controller';

@Controller('payment')
export class StripeController {
  constructor(
    @InjectQueue('donation-challenge-reward')
    private readonly donationChallengeRewardQueue: Queue,
    private readonly stripeService: StripeService,
    private readonly prisma: PrismaService,
    private readonly campaignsService: CampaignsService,
    private readonly giftCardsService: GiftCardsService,
  ) {}

  @Get('connected-account/:id')
  async getConnectAccountDetails(@Param('id') connectAccountId: string) {
    const account =
      await this.stripeService.getConnectAccountDetails(connectAccountId);
    return account;
  }

  @Post('onboard-account')
  async onboardConnectAccount(@Body() onboardAccountDto: OnboardAccountDto) {
    const { data, error } = await this.stripeService.onboardConnectAccount(
      onboardAccountDto.accountId,
    );
    if (error) {
    }
    return data;
  }

  @Post('onboard-update')
  async createOnboardUpdateLink(
    @Body() createOnboardUpdateLink: CreateOnboardUpdateLinkDto,
  ) {
    const { data, error } = await this.stripeService.onboardUpdateAccount(
      createOnboardUpdateLink.stripeConnectAccountId,
    );
    if (error) {
      throw new InternalServerErrorException(error);
    }
    return data;
  }

  @UseGuards(AccessTokenGuard)
  @Post('connect-account')
  async createConnectAccount(@GetCurrentUserId() userId: string) {
    const { data: accountRes, error: accountError } =
      await this.stripeService.createConnectAccount(userId);
    if (accountError) {
      throw new InternalServerErrorException(accountError);
    }
    // Save to user record
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        bankAccount: {
          create: {
            id: accountRes.account,
          },
        },
      },
    });
    const { data: onboardRes, error: onboardError } =
      await this.stripeService.onboardConnectAccount(accountRes.account);
    if (onboardError) {
      throw new InternalServerErrorException(accountError);
    }
    return onboardRes;
  }

  @UseGuards(AccessTokenGuard)
  @Post('connect-account/organization')
  async createOrganizationConnectAccount(@GetCurrentUserId() userId: string) {
    const { data, error } =
      await this.stripeService.createOrganizationAccountLink(userId);
    if (error) {
      throw new InternalServerErrorException(error);
    }
    return data;
  }

  async handleStripeWebhook(
    eventData: any,
    paymentIntentMetadata:
      | CampaignDonationPaymentMetadataAsStrings
      | GiftCardPaymentMetadataAsStrings,
  ) {
    switch (paymentIntentMetadata.paymentEntity) {
      case 'gift_card': {
        const metadata =
          paymentIntentMetadata as GiftCardPaymentMetadataAsStrings;
        await this.giftCardsService.create({
          stripeTransferGroupId: metadata.stripeTransferGroupId,
          amount: parseInt(metadata.amount),
          receiver: {
            connect: {
              id: metadata.receiverId,
            },
          },
          sender: {
            connect: {
              id: metadata.senderId,
            },
          },
          message: metadata.message,
        });
        break;
      }
      case 'campaign_donation': {
        const metadata =
          paymentIntentMetadata as CampaignDonationPaymentMetadataAsStrings;
        const donation = await this.campaignsService.createDonation({
          amount: parseInt(metadata.amount),
          isAnonymous: stringToBool(metadata.isAnonymous),
          paymentIntentId: eventData?.id ?? '',
          campaign: {
            connect: {
              id: metadata.campaignId,
            },
          },
          user: {
            connect: {
              id: metadata.userId,
            },
          },
          giftCard: metadata.giftCardId
            ? {
                connect: {
                  id: metadata.giftCardId,
                },
              }
            : undefined,
        });
        if (
          donation.campaign?.collaboration &&
          !donation.campaign?.collaboration?.isCancelled
        ) {
          await this.stripeService.transferDonation({
            amount: eventData.amount,
            donation: donation,
            transferGroupId: eventData.transfer_group,
          });
        }
        const jobPayload: ChallengeRewardJobPayload = {
          donationId: donation.id,
        };
        console.log('jobPayload:', jobPayload);
        const createdJob = await this.donationChallengeRewardQueue.add(
          'challenge-reward',
          jobPayload,
        );
        console.log('createdJob', createdJob);
        break;
      }
    }
  }

  @Post('stripe-webhook')
  @HttpCode(200)
  async paymentWebhook(@Req() request: Request) {
    // console.log('webhook request: ', request);
    // console.log('webhook body: ', request.body);
    const event = request.body;
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        const metadata = paymentIntent.metadata as any;
        await this.handleStripeWebhook(paymentIntent, metadata);
        break;
      case 'transfer.created':
        const transferObj = event.data.object;
        const transferMetadata = transferObj.metadata as any;
        await this.handleStripeWebhook(transferObj, transferMetadata);
        break;
      case 'payment_method.attached':
        const paymentMethod = event.data.object;
        break;
      case 'payout.paid':
        const payoutIntent = event.data.object;
        const payoutMetadata = payoutIntent.metadata as any;
        break;
      // ... handle other event types
      case 'account.updated':
        const accountUpdatedData = event.data.object;
        const accountMetadata = accountUpdatedData.metadata as any;
        await this._hanleConnectAccountUpdatedEvent(
          accountUpdatedData,
          accountMetadata,
        );
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  }

  async _hanleConnectAccountUpdatedEvent(accountUpdatedData, accountMetadata) {
    const {
      id,
      charges_enabled,
      details_submitted,
      email,
      payouts_enabled,
      requirements,
    } = accountUpdatedData;
    let errorMessage;
    if (requirements?.errors) {
      const errors = requirements.errors;
      errorMessage = errors
        ?.map((error) => error?.reason ?? 'Unknown error')
        ?.join(',');
    } else {
      errorMessage = 'Bank account information not completed';
    }
    if (details_submitted && charges_enabled && payouts_enabled) {
      // Account no error
      errorMessage = null;
    }
    // Organization bank account
    if (accountMetadata.organizationId) {
      await this.prisma.organizationBankAccount.upsert({
        where: {
          organizationId: accountMetadata.organizationId,
        },
        create: {
          id: id,
          error: errorMessage ?? undefined,
          detailsSubmitted: details_submitted,
          chargesEnabled: charges_enabled,
          email: email,
          payoutsEnabled: payouts_enabled,
          organization: {
            connect: {
              id: accountMetadata.organizationId,
            },
          },
        },
        update: {
          error: errorMessage,
          detailsSubmitted: details_submitted,
          chargesEnabled: charges_enabled,
          email: email,
          payoutsEnabled: payouts_enabled,
        },
      });
      return;
    }
    // User bank account
    await this.prisma.bankAccount.upsert({
      where: {
        id: id,
      },
      update: {
        error: errorMessage,
        detailsSubmitted: details_submitted,
        chargesEnabled: charges_enabled,
        email: email,
        payoutsEnabled: payouts_enabled,
      },
      create: {
        id: id,
        error: errorMessage ?? undefined,
        detailsSubmitted: details_submitted,
        chargesEnabled: charges_enabled,
        email: email,
        payoutsEnabled: payouts_enabled,
        user: {
          connect: {
            id: accountMetadata.userId,
          },
        },
      },
    });
  }

  @UseGuards(AccessTokenGuard)
  @Post('payment-intent/campaign-donation')
  async createCampaignDonationPaymentIntent(
    @GetCurrentUserId() userId: string,
    @Body() createPaymentIntentDto: CampaignDonationPaymentIntentDto,
  ) {
    const campaign = await this.prisma.campaign.findUnique({
      where: {
        id: createPaymentIntentDto.campaignId,
      },
      include: {
        user: {
          include: {
            bankAccount: true,
          },
        },
      },
    });
    let paymentIntentPayload: PaymentIntentPayload = {
      amount: createPaymentIntentDto.amount,
      stripeConnectAccountId: campaign.user.bankAccount.id,
    };
    let metadata: CampaignDonationPaymentMetadata = {
      amount: createPaymentIntentDto.amount,
      campaignId: createPaymentIntentDto.campaignId,
      isAnonymous: createPaymentIntentDto.isAnonymous,
      userId: userId,
      paymentEntity: 'campaign_donation',
      giftCardId: createPaymentIntentDto.giftCardId,
    };
    // Find collaboratino and split funds
    // 1. Find active collaboration
    // 2. Create transfer group
    // 3. Transfer amount to fundraiser account & organization account
    const campaignCollaboration = await this.prisma.collaboration.findFirst({
      where: {
        AND: [
          { campaignId: createPaymentIntentDto.campaignId },
          { isCancelled: false },
        ],
      },
    });
    if (campaignCollaboration) {
      // 2. Create transfer group
      const transferGroupId = 'donation-id2-timestamp';
      paymentIntentPayload.transferGroupId = transferGroupId;
      // Remove stripeConnectAccountId
      // So that amount go to root account, not directly to fundraiser account with full amount
      paymentIntentPayload.stripeConnectAccountId = null;
    }
    return await this.stripeService.createPaymentIntent(
      userId,
      paymentIntentPayload,
      metadata,
    );
  }

  @UseGuards(AccessTokenGuard)
  @Post('payment-intent/gift-card')
  async createGiftCardPaymentIntent(
    @GetCurrentUserId() userId: string,
    @Body() giftCardPaymentIntentDto: GiftCardPaymentIntentDto,
  ) {
    const transferGroupId = this._generateGiftCardTransferGroup();
    const paymentIntentPayload: PaymentIntentPayload = {
      amount: giftCardPaymentIntentDto.amount,
      transferGroupId: transferGroupId,
    };
    const metadata: GiftCardPaymentMetadata = {
      amount: giftCardPaymentIntentDto.amount,
      receiverId: giftCardPaymentIntentDto.receiverId,
      senderId: userId,
      message: giftCardPaymentIntentDto.message,
      paymentEntity: 'gift_card',
      stripeTransferGroupId: transferGroupId,
    };
    return await this.stripeService.createPaymentIntent(
      userId,
      paymentIntentPayload,
      metadata,
    );
  }

  _generateGiftCardTransferGroup() {
    return 'gc-' + uuidv4();
  }

  @Get('transfers')
  async getTransfers() {
    return await this.stripeService.getTransfers();
  }
}
