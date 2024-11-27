import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  InternalServerErrorException,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import {
  CreateNotificationDto,
  ScamNotificationDto,
} from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { Request } from 'express';
import { PrismaService } from 'src/common/data/prisma.service';
import { AccessTokenGuard } from 'src/common/guards/auth/access-token.guard';
import { GetCurrentUserId } from 'src/common/decorators/get-current-user-id.decorator';

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('email-templates')
  async getEmailTemplates() {
    const { data, error } = await this.notificationsService.getEmailTemplates();
    if (error) { 
      throw new InternalServerErrorException(error);
    }
    return data;
  }

  @Post('scam')
  async createScamNotification(@Body() dto: ScamNotificationDto) {
    const { data, error } =
      await this.notificationsService.createScamNotification(dto);

    if (error) {
      throw new InternalServerErrorException(error);
    }

    return data;
  }

  @Post('hook/campaign-update')
  async listenToCampaignUpdate(@Req() request: Request) {
    console.log('campaign update hook');
    if (request.body.type !== 'INSERT') {
      return;
    }
    const dbRecord = request.body.record as any;
    const campaign = await this.prisma.campaign.findUnique({
      where: {
        id: dbRecord.campaignId,
      },
    });

    // Find all the users who have donated to that campaign
    const receivers = await this.prisma.campaignDonation.findMany({
      where: {
        campaignId: dbRecord.campaignId,
      },
      distinct: ['userId'],
    });
    console.log('send notification');
    for (const receiver of receivers) {
      await this.notificationsService.createCampaignUpdateNotification({
        actorId: dbRecord.userId,
        description: dbRecord.title,
        title: `An update for ${campaign.title}`,
        entityId: dbRecord.id,
        receiverId: receiver.userId,
      });
    }
  }

  @Post()
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.create(createNotificationDto);
  }

  @UseGuards(AccessTokenGuard)
  @Get()
  async findAll(@GetCurrentUserId() userId: string) {
    return this.notificationsService.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.notificationsService.findOne(+id);
  }

  @Patch(':id')
  async update(@Param('id') id: string) {
    const { data, error } = await this.notificationsService.updateAsRead(id);
    if (error) {
      throw new InternalServerErrorException(error);
    }
    return data;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.notificationsService.remove(+id);
  }
}
