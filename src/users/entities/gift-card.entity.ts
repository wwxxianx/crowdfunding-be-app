import { GiftCard } from '@prisma/client';

export type UserGiftCard = {
  sent: GiftCard[];
  received: GiftCard[];
};
