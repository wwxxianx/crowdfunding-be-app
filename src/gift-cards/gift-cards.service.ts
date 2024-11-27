import { Injectable } from '@nestjs/common';
import { UpdateGiftCardDto } from './dto/update-gift-card.dto';
import { PrismaService } from 'src/common/data/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class GiftCardsService {
  constructor (
    private readonly prisma: PrismaService,
  ) {};
  
  async create(createGiftCardDto: Prisma.GiftCardCreateInput) {
    return await this.prisma.giftCard.create({
      data: createGiftCardDto
    });
  }

  findAll() {
    return `This action returns all giftCards`;
  }

  findOne(id: number) {
    return `This action returns a #${id} giftCard`;
  }

  update(id: number, updateGiftCardDto: UpdateGiftCardDto) {
    return `This action updates a #${id} giftCard`;
  }

  remove(id: number) {
    return `This action removes a #${id} giftCard`;
  }
}
