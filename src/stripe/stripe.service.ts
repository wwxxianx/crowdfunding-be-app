import { Inject, Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { CreateStripeCustomerPayload } from './dto/create-stripe-customer.payload';
import { PaymentIntentPayload } from './dto/campaign-donation-payment-intent.payload';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/common/data/prisma.service';
import { CreateTransferPayload } from './dto/create-transfer.payload';
import { CampaignDonation, User } from '@prisma/client';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(
    @Inject('STRIPE_SECRET_KEY') private readonly apiKey: string,
    private configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.stripe = new Stripe(this.apiKey, {
      apiVersion: '2024-04-10', // Use whatever API latest version
    });
  }

  async createTransfer(
    payload: CreateTransferPayload,
    metadata: any,
  ): Promise<Result<boolean>> {
    try {
      const transfer = await this.stripe.transfers.create({
        amount: payload.amount * 100,
        currency: 'myr',
        destination: payload.destinationAccountId,
        transfer_group: payload.transferGroupId,
        metadata,
      });
      return { data: true, error: null };
    } catch (e) {
      return { data: null, error: 'Failed to create Stripe transfer' };
    }
  }

  async getConnectAccountDetails(accountId: string) {
    const account = await this.stripe.accounts.retrieve(accountId);
    return account;
  }

  // async testPayment() {
  //   const connectAccountId = 'acct_1PMlpIIer2iU8p47';
  //   const customer = await this.stripe.customers.create({
  //     stripeAccount: connectAccountId,
  //   });

  //   const ephemeralKey = await this.stripe.ephemeralKeys.create(
  //     { customer: customer.id },
  //     { apiVersion: '2024-04-10', stripeAccount: connectAccountId },
  //   );
  //   const paymentIntent = await this.stripe.paymentIntents.create(
  //     {
  //       amount: 1099,
  //       currency: 'myr',
  //       customer: customer.id,
  //       // In the latest version of the API, specifying the `automatic_payment_methods` parameter
  //       // is optional because Stripe enables its functionality by default.
  //       automatic_payment_methods: {
  //         enabled: true,
  //       },
  //     },
  //     {
  //       stripeAccount: connectAccountId,
  //     },
  //   );
  //   return {
  //     clientSecret: paymentIntent.client_secret,
  //     ephemeralKey: ephemeralKey.secret,
  //     customer: customer.id,
  //     publishableKey: this.configService.get('STRIPE_PUBLISHABLE_KEY'),
  //   };
  // }

  async onboardUpdateAccount(
    accountId: string,
  ): Promise<Result<{ onboardLink: string }>> {
    try {
      await this.stripe.subscriptions;
      const onboardLink: Stripe.Response<Stripe.AccountLink> =
        await this.stripe.accountLinks.create({
          account: accountId,
          // Provide Flutter app URL
          return_url: `${this.configService.get('APP_LINK_DOMAIN')}/home`,
          refresh_url: `${this.configService.get('APP_LINK_DOMAIN')}/stripe-onboard-refresh`,
          type: 'account_onboarding',
        });

      return { data: { onboardLink: onboardLink.url } };
    } catch (error) {
      console.error(
        'An error occurred when calling the Stripe API to create an account link:',
        error,
      );
      return {
        error:
          'An error occurred when calling the Stripe API to create an account link',
        data: null,
      };
    }
  }

  async onboardConnectAccount(
    accountId: string,
  ): Promise<Result<{ onboardLink: string }>> {
    try {
      const onboardLink: Stripe.Response<Stripe.AccountLink> =
        await this.stripe.accountLinks.create({
          account: accountId,
          // Provide Flutter app URL
          return_url: `${this.configService.get('APP_LINK_DOMAIN')}/home`,
          refresh_url: `${this.configService.get('APP_LINK_DOMAIN')}/stripe-onboard-refresh`,
          type: 'account_onboarding',
        });

      return { data: { onboardLink: onboardLink.url } };
    } catch (error) {
      console.error(
        'An error occurred when calling the Stripe API to create an account link:',
        error,
      );
      return {
        error:
          'An error occurred when calling the Stripe API to create an account link',
        data: null,
      };
    }
  }

  async createConnectAccount(
    userId: string,
  ): Promise<Result<{ account: string }>> {
    try {
      const account = await this.stripe.accounts.create({
        controller: {
          fees: {
            payer: 'account',
          },
        },
        metadata: {
          userId: userId,
        },
      });

      return {
        data: { account: account.id },
        error: null,
      };
    } catch (error) {
      console.error(
        'An error occurred when calling the Stripe API to create an account',
        error,
      );
      return { data: null, error: 'Failed to create account on Stripe' };
    }
  }

  async createOrganizationAccountLink(
    userId: string,
  ): Promise<Result<{ onboardLink: string }>> {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
        include: {
          organization: {
            include: {
              bankAccount: true,
            },
          },
        },
      });
      const { data, error } = await this._getOrganizationConnectAccountId(user);
      if (error) {
        return { data: null, error: error };
      }
      // Save to organization record
      await this.prisma.organizationBankAccount.upsert({
        where: {
          organizationId: user.organizationId,
        },
        create: {
          organizationId: user.organizationId,
          id: data.account,
        },
        update: {
          organizationId: user.organizationId,
          id: data.account,
        },
      });

      const onboardLink: Stripe.Response<Stripe.AccountLink> =
        await this.stripe.accountLinks.create({
          account: data.account,
          // Provide Flutter app URL
          return_url: `${this.configService.get('APP_LINK_DOMAIN')}/home`,
          refresh_url: `${this.configService.get('APP_LINK_DOMAIN')}/stripe-onboard-refresh`,
          type: 'account_onboarding',
        });

      return { data: { onboardLink: onboardLink.url } };
    } catch (error) {
      console.error(
        'An error occurred when calling the Stripe API to create an account link:',
        error,
      );
      return {
        error:
          'An error occurred when calling the Stripe API to create an account link',
        data: null,
      };
    }
  }

  async _getOrganizationConnectAccountId(
    user: any,
  ): Promise<Result<{ account: string }>> {
    // Get organization connect account id
    try {
      if (!user.organization) {
        return { data: null, error: 'Please join an organization first' };
      }
      if (user.organization.bankAccount?.id) {
        // Already created connect account before
        return {
          data: { account: user.organization.bankAccount.id },
          error: null,
        };
      }
      // Create NEW account
      const account = await this.stripe.accounts.create({
        controller: {
          fees: {
            payer: 'account',
          },
        },
        metadata: {
          userId: user.id,
          organizationId: user.organizationId,
        },
      });

      return {
        data: { account: account.id },
        error: null,
      };
    } catch (error) {
      console.error(
        'An error occurred when calling the Stripe API to create an account',
        error,
      );
      return { data: null, error: 'Failed to create account on Stripe' };
    }
  }

  async transferDonation(payload: {
    amount: number,
    donation: CampaignDonation,
    transferGroupId: string,
  }) {
    const campaign = await this.prisma.campaign.findUnique({
      where: {
        id: payload.donation.campaignId,
      },
      include: {
        collaboration: {
          include: {
            organization: {
              include: {
                bankAccount: true,
              },
            },
          },
        },
        user: {
          include: {
            bankAccount: true,
          },
        },
      },
    });
    // Generate transfer_group id


    // To fundraiser
    this.stripe.transfers.create({
      amount: payload.amount * (1 - campaign.collaboration.reward),
      currency: 'myr',
      destination: campaign.user.bankAccount.id,
      transfer_group: payload.transferGroupId,
      metadata: {
        campaignId: payload.donation.campaignId,
        donationId: payload.donation.id,
        organizationId: campaign.collaboration.organizationId,
      }
    });
    // To organization
    this.stripe.transfers.create({
      amount: payload.amount * campaign.collaboration.reward,
      currency: 'myr',
      destination: campaign.user.bankAccount.id,
      transfer_group: payload.transferGroupId,
      metadata: {
        campaignId: payload.donation.campaignId,
        donationId: payload.donation.id,
        organizationId: campaign.collaboration.organizationId,
      },
    });
  }

  async getTransfers() {
    let param: Stripe.TransferListParams = {
      destination: "acct_1PXPRjIWvMWO04eO",
    }
    const transfers = await this.stripe.transfers.list(param);
    return transfers;
  }

  async createPaymentIntent(
    userId: string,
    createPaymentIntentPayload: PaymentIntentPayload,
    metadata?: any,
  ) {
    const stripeCustomer = await this._createCustomer(userId);
    const ephemeralKey = await this.stripe.ephemeralKeys.create(
      { customer: stripeCustomer.id },
      {
        apiVersion: '2024-04-10',
      },
    );
    let paymentIntentParams: Stripe.PaymentIntentCreateParams = {
      amount: createPaymentIntentPayload.amount * 100,
      currency: 'myr',
      customer: stripeCustomer.id,
      // In the latest version of the API, specifying the `automatic_payment_methods` parameter
      // is optional because Stripe enables its functionality by default.
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: metadata,
      // For gift card donation
      transfer_group: createPaymentIntentPayload.transferGroupId,
    };
    if (createPaymentIntentPayload.stripeConnectAccountId) {
      paymentIntentParams.transfer_data = {
        destination: createPaymentIntentPayload.stripeConnectAccountId,
      };
    }
    const paymentIntent =
      await this.stripe.paymentIntents.create(paymentIntentParams);

    return {
      clientSecret: paymentIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: stripeCustomer.id,
      publishableKey: this.configService.get('STRIPE_PUBLISHABLE_KEY'),
      // stripeAccountId: createPaymentIntentPayload.stripeConnectAccountId,
    };
  }

  async _createCustomer(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    // Existing customer
    if (user.stripeCustomerId) {
      return await this.stripe.customers.retrieve(user.stripeCustomerId);
    }

    // NEW customer
    const stripeCustomer = await this.stripe.customers.create({
      name: user.fullName,
      email: user.email,
      metadata: {
        userId: userId,
      },
    });

    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        stripeCustomerId: stripeCustomer.id,
      },
    });
    return stripeCustomer;
  }
}
