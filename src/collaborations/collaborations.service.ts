import { Injectable } from '@nestjs/common';
import { CreateCollaborationDto } from './dto/create-collaboration.dto';
import { UpdateCollaborationDto } from './dto/update-collaboration.dto';
import { PrismaService } from 'src/common/data/prisma.service';
import { Collaboration } from '@prisma/client';
import { CollaborationFilter } from './dto/filters';

@Injectable()
export class CollaborationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createCollaborationDto: CreateCollaborationDto,
  ): Promise<Result<Collaboration>> {
    try {
      const collaboration = await this.prisma.collaboration.create({
        data: {
          campaign: {
            connect: {
              id: createCollaborationDto.campaignId,
            },
          },
          reward: createCollaborationDto.reward,
        },
        include: {
          campaign: {
            include: {
              campaignCategory: true,
              stateAndRegion: true,
              user: true,
            },
          },
          organization: {
            include: {
              createdBy: true,
            },
          },
        },
      });
      return { data: collaboration, error: null };
    } catch (e) {
      return { data: null, error: 'Failed to launch collaboration' };
    }
  }

  async findAll(filter: CollaborationFilter): Promise<Result<Collaboration[]>> {
    try {
      const { isPending, organizationId, campaignId } = filter;
      const whereClause: any = {};

      if (isPending === true) {
        whereClause.organizationId = null;
      } else if (isPending === false) {
        whereClause.organizationId = { not: null };
      }

      if (organizationId) {
        whereClause.organizationId = organizationId;
      }

      if (campaignId) {
        whereClause.campaignId = campaignId;
      }

      const collaborations = await this.prisma.collaboration.findMany({
        where: whereClause,
        include: {
          campaign: {
            include: {
              campaignCategory: true,
              user: true,
              stateAndRegion: true,
              donations: true,
            },
          },
          organization: {
            include: {
              createdBy: true,
            },
          },
          cancelledBy: true,
        },
      });
      const formmatedCollaborations = collaborations?.map((collaboration) => {
        return {
          ...collaboration,
          campaign: {
            ...collaboration.campaign,
            raisedAmount: collaboration.campaign.donations?.reduce(
              (prev, current) => prev + current.amount,
              0,
            ),
          },
        };
      });
      return { data: formmatedCollaborations, error: null };
    } catch (e) {
      return { data: null, error: 'Failed to fetch collaborations' };
    }
  }

  async findOne(campaignId: string): Promise<Result<Collaboration>> {
    try {
      const collaboration = await this.prisma.collaboration.findUnique({
        where: {
          campaignId: campaignId,
        },
        include: {
          campaign: {
            include: {
              campaignCategory: true,
            },
          },
          organization: {
            include: {
              createdBy: true,
            },
          },
        },
      });
      return { data: collaboration, error: null };
    } catch (e) {
      return { data: null, error: 'Failed to fetch collaboration details' };
    }
  }

  async update(
    id: string,
    dto: UpdateCollaborationDto,
  ): Promise<Result<Collaboration>> {
    try {
      const collaboration = await this.prisma.collaboration.update({
        where: {
          id: id,
        },
        data: {
          reward: dto.reward ? dto.reward : undefined,
        },
        include: {
          campaign: {
            include: {
              campaignCategory: true,
              stateAndRegion: true,
              user: true,
            },
          },
          organization: {
            include: {
              createdBy: true,
            },
          },
        },
      });
      return { data: collaboration, error: null };
    } catch (e) {
      return { data: null, error: 'Failed to update this collaboration' };
    }
  }

  async organizationAcceptCollaboration(id: string, userId: string) {
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          id: userId,
        },
        include: {
          organization: {
            include: {
              bankAccount: true,
              createdBy: true,
            },
          },
        },
      });
      // Check organization bank status
      if (!user.organization.bankAccount) {
        return {
          error:
            'Collaboration required organization to set up a bank account with our Stripe platform',
        };
      }
      if (
        !user.organization.bankAccount.payoutsEnabled ||
        !user.organization.bankAccount.detailsSubmitted ||
        !user.organization.bankAccount.chargesEnabled
      ) {
        return {
          error:
            "Your organization's bank account is not in valid status, please check your bank account status",
        };
      }
      const collaboration = await this.prisma.collaboration.update({
        where: {
          id: id,
        },
        data: {
          organization: {
            connect: {
              id: user.organization.id,
            },
          },
        },
        include: {
          campaign: {
            include: {
              campaignCategory: true,
              stateAndRegion: true,
              user: true,
            },
          },
          organization: {
            include: {
              createdBy: true,
            },
          },
        },
      });
      return { data: collaboration, error: null };
    } catch (e) {
      return { data: null, error: 'Failed to update this collaboration' };
    }
  }

  remove(id: number) {
    return `This action removes a #${id} collaboration`;
  }
}
