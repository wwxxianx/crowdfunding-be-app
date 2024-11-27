import { GiftCard } from '@prisma/client';
import { PaymentEntity } from 'src/common/constants/constants';
import { ConvertToStrings } from 'src/common/utils/convert-type-to-string';

export type GiftCardPaymentIntentDto = {
  amount: number;
  receiverId: string;
  message: string;
};

export type GiftCardPaymentMetadata = Pick<
  GiftCard,
  'amount' | 'receiverId' | 'senderId' | 'message' | 'stripeTransferGroupId'
> & {
  paymentEntity: PaymentEntity;
};

export type GiftCardPaymentMetadataAsStrings = ConvertToStrings<GiftCardPaymentMetadata>;

export function isGiftCardPaymentMetadata(metadata: any): metadata is GiftCardPaymentMetadataAsStrings {
  return metadata && typeof metadata === 'object' && 'paymentEntity' in metadata;
}