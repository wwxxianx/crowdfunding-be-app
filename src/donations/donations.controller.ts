import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { DonationsService } from './donations.service';
import { CreateDonationDto } from './dto/create-donation.dto';
import { UpdateDonationDto } from './dto/update-donation.dto';
import { AccessTokenGuard } from 'src/common/guards/auth/access-token.guard';
import { GetCurrentUserId } from 'src/common/decorators/get-current-user-id.decorator';
import { StripeService } from 'src/stripe/stripe.service';
import { PrismaService } from 'src/common/data/prisma.service';
import { CreateTransferPayload } from 'src/stripe/dto/create-transfer.payload';
import { CampaignDonationPaymentMetadata } from 'src/stripe/dto/campaign-donation-payment-intent.payload';

@Controller('donations')
export class DonationsController {
  constructor(
    private readonly donationsService: DonationsService,
    private readonly stripeService: StripeService,
    private readonly prisma: PrismaService,
  ) {}

  @UseGuards(AccessTokenGuard)
  @Post()
  async create(
    @GetCurrentUserId() userId: string,
    @Body() createDonationDto: CreateDonationDto,
  ) {
    const giftCard = await this.prisma.giftCard.findUniqueOrThrow({
      where: {
        id: createDonationDto.giftCardId,
      },
    });
    if (giftCard.receiverId !== userId) {
      // Gift card used by others than receiver
      throw new BadRequestException('This gift card not belongs to you!');
    }

    const campaign = await this.prisma.campaign.findUnique({
      where: {
        id: createDonationDto.campaignId,
      },
      include: {
        user: {
          include: {
            bankAccount: true,
          },
        },
      },
    });
    const metadata: CampaignDonationPaymentMetadata = {
      amount: giftCard.amount,
      campaignId: createDonationDto.campaignId,
      isAnonymous: createDonationDto.isAnonymous,
      userId: userId,
      paymentEntity: 'campaign_donation',
      giftCardId: createDonationDto.giftCardId,
    };
    const createTransferPayload: CreateTransferPayload = {
      amount: giftCard.amount,
      destinationAccountId: campaign.user.bankAccount.id,
      transferGroupId: giftCard.stripeTransferGroupId,
    };
    const { data, error } = await this.stripeService.createTransfer(
      createTransferPayload,
      metadata,
    );
    if (error) {
      throw new InternalServerErrorException(error);
    }
    return { result: data };
  }

  @Get()
  findAll() {
    return this.donationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.donationsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDonationDto: UpdateDonationDto,
  ) {
    return this.donationsService.update(+id, updateDonationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.donationsService.remove(+id);
  }
}
