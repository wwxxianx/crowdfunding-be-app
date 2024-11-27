import { Injectable } from '@nestjs/common';
import { CreateCampaignCommentDto } from './dto/create-campaign-comment.dto';
import { UpdateCampaignCommentDto } from './dto/update-campaign-comment.dto';
import { PrismaService } from 'src/common/data/prisma.service';
import { CreateCampaignReplyDto } from './dto/create-campaign-reply.dto';

@Injectable()
export class CampaignCommentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    createCampaignCommentDto: CreateCampaignCommentDto,
  ) {
    return await this.prisma.campaignComment.create({
      data: {
        comment: createCampaignCommentDto.comment,
        user: {
          connect: {
            id: userId,
          },
        },
        campaign: {
          connect: {
            id: createCampaignCommentDto.campaignId,
          },
        },
      },
      include: {
        user: true,
        parent: true,
        replies: true,
      },
    });
  }

  async createReply(
    userId: string,
    createCampaignReplyDto: CreateCampaignReplyDto,
  ) {
    return await this.prisma.campaignComment.create({
      data: {
        user: {
          connect: {
            id: userId,
          },
        },
        campaign: {
          connect: {
            id: createCampaignReplyDto.campaignId,
          },
        },
        comment: createCampaignReplyDto.comment,
        parent: {
          connect: {
            id: createCampaignReplyDto.parentId,
          },
        },
      },
      include: {
        user: true,
        replies: true,
      },
    });
  }

  findAll() {
    return `This action returns all campaignComments`;
  }

  findOne(id: number) {
    return `This action returns a #${id} campaignComment`;
  }

  update(id: number, updateCampaignCommentDto: UpdateCampaignCommentDto) {
    return `This action updates a #${id} campaignComment`;
  }

  remove(id: number) {
    return `This action removes a #${id} campaignComment`;
  }
}
