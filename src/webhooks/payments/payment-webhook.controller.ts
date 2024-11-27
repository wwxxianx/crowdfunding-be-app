import { Controller, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { isGiftCardPaymentMetadata } from 'src/stripe/dto/gift-card-payment-intent.dto';

@Controller('webhooks/payment')
export class PaymentWebhookController {
  @Post('webhooks/payments')
  async handlePaymentWebhook(@Req() request: Request) {
    const event = request.body;
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        await this._handlePaymentIntentEvent(paymentIntent);
        break;
      case 'transfer.created':
        const transferObj = event.data.object;
        await this._handleTransferEvent(transferObj);
        break;
      case 'account.updated':
        const accountUpdatedData = event.data.object;
        await this._handleAccountEvent(accountUpdatedData);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  }

  async _handlePaymentIntentEvent(paymentIntent: any) {
    // Handle payments:
    // 1. Direct donation
    // 2. Purchase gift card
    const metadata = paymentIntent.metadata;
    if (isGiftCardPaymentMetadata(metadata)) {
      const paymentEntity = metadata.paymentEntity;
      switch (paymentEntity) {
        case 'gift_card':
          break;
        case 'campaign_donation':
          break;
      }
    } else {
    }
  }

  async _handleTransferEvent(transfer: any) {
    // Handle events:
    // 1. Gift card amount transfer
  }

  async _handleAccountEvent(accountData: any) {
    // Handle connect account:
    // 1. User bank account
    // 2. Organization bank account
  }
}
