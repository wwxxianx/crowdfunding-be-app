import { Injectable } from '@nestjs/common';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { PrismaService } from 'src/common/data/prisma.service';
import { Organization, User } from '@prisma/client';
import { JoinOrganizationDto } from './dto/join-organization.dto';
import { StorageService } from 'src/storage/storage.service';
import { storageConstants } from 'src/common/constants/constants';

const INVITATION_CODE_LENGTH = 15;

@Injectable()
export class OrganizationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async findByInvitationCode(
    invitationCode: string,
  ): Promise<Result<Organization>> {
    try {
      const organization = await this.prisma.organization.findUniqueOrThrow({
        where: {
          invitationCode: invitationCode,
        },
        include: {
          createdBy: true,
        },
      });
      if (!organization) {
        return {
          data: null,
          error: 'Failed to find organization with this code.',
        };
      }
      return { data: organization, error: null };
    } catch (e) {
      return { data: null, error: 'Failed to find your organization' };
    }
  }

  async joinOrganization(
    userId: string,
    joinOrganizationDto: JoinOrganizationDto,
  ): Promise<Result<User>> {
    try {
      const user = await this.prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          organization: {
            connect: {
              id: joinOrganizationDto.organizationId,
            },
          },
          isOnboardingCompleted: true,
        },
        include: {
          organization: {
            include: {
              createdBy: true,
            },
          },
          bankAccount: true,
          preference: {
            include: {
              favouriteCampaignCategories: true,
            },
          },
        },
      });
      return { data: user, error: null };
    } catch (e) {
      return { data: null, error: 'Failed to join into this organization' };
    }
  }

  _generateCode() {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < INVITATION_CODE_LENGTH; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length),
      );
    }
    return result;
  }

  async _generateInvitationCode() {
    let code;
    let isUnique = false;

    while (!isUnique) {
      code = this._generateCode();
      const existingTeam = await this.prisma.organization.findUnique({
        where: { invitationCode: code },
      });
      if (!existingTeam) {
        isUnique = true;
      }
    }

    return code;
  }

  async create(
    userId: string,
    createOrganizationDto: CreateOrganizationDto,
    imageFile?: Express.Multer.File,
  ): Promise<Result<User>> {
    try {
      let imageFileUrl;
      if (imageFile != null) {
        // upload file
        const { data, error } = await this.storageService.uploadFile(
          storageConstants.ORGANIZATION_BUCKET,
          `${storageConstants.ORGANIZATION_IMAGE_PATH}/${createOrganizationDto.name}`,
          imageFile.buffer,
          imageFile.mimetype,
        );
        if (error) {
          return { data: null, error: 'Failed to upload image' };
        }
        imageFileUrl = data.publicUrl;
      }
      const code = await this._generateInvitationCode();
      const user = await this.prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          createdOrganization: {
            create: {
              name: createOrganizationDto.name,
              email: createOrganizationDto.email,
              invitationCode: code,
              imageUrl: imageFileUrl ?? undefined,
              contactPhoneNumber: createOrganizationDto.contactPhoneNumber,
              isVerified: false,
              slogan: createOrganizationDto.slogan,
            },
          },
          isOnboardingCompleted: true,
        },
        include: {
          // organization: true,
          createdOrganization: true,
        },
      });
      const updatedUser = await this.prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          organization: {
            connect: {
              id: user.createdOrganization[0].id,
            },
          },
        },
        include: {
          organization: {
            include: {
              createdBy: true,
            },
          },
        },
      });
      return { data: updatedUser, error: null };
    } catch (e) {
      console.log(e);
      return {
        data: null,
        error: 'Failed to create organization, please try again later.',
      };
    }
  }

  async findAll(limit?: number): Promise<Result<Organization[]>> {
    try {
      const organizations = await this.prisma.organization.findMany({
        take: limit == null || limit == 0 ? undefined : limit,
        include: {
          createdBy: true,
        },
      });
      return { data: organizations, error: null };
    } catch (e) {
      return { data: null, error: 'Failed to fetch organization' };
    }
  }

  async findOne(id: string): Promise<Result<Organization>> {
    try {
      const organization = await this.prisma.organization.findUniqueOrThrow({
        where: {
          id: id,
        },
        include: {
          members: {
            take: 3,
            orderBy: {
              createdAt: 'asc',
            },
          },
          createdBy: true,
          bankAccount: true,
        },
      });
      return { data: organization, error: null };
    } catch (e) {
      return { data: null, error: 'Failed to fetch organization' };
    }
  }

  async findAllMembers(id: string): Promise<Result<User[]>> {
    try {
      const members = await this.prisma.user.findMany({
        where: {
          organizationId: id,
        },
      });
      return { data: members, error: null };
    } catch (e) {
      return { data: null, error: 'Failed to fetch organization' };
    }
  }

  async update(
    id: string,
    updateOrganizationDto: UpdateOrganizationDto,
    imageFile?: Express.Multer.File,
  ): Promise<Result<Organization>> {
    try {
      let imageFileUrl: string | null = null;
      if (imageFile != null) {
        // upload file
        const { data, error } = await this.storageService.uploadFile(
          storageConstants.ORGANIZATION_BUCKET,
          `${storageConstants.ORGANIZATION_IMAGE_PATH}/${imageFile.originalname}`,
          imageFile.buffer,
          imageFile.mimetype,
        );
        if (error) {
          return { data: null, error: 'Failed to upload image' };
        }
        imageFileUrl = data.publicUrl;
      }
      const organization = await this.prisma.organization.update({
        where: {
          id: id,
        },
        data: {
          name: updateOrganizationDto.name.length
            ? updateOrganizationDto.name
            : undefined,
          imageUrl: imageFileUrl ?? undefined,
          contactPhoneNumber: updateOrganizationDto.contactPhoneNumber.length
            ? updateOrganizationDto.contactPhoneNumber
            : undefined,
          email: updateOrganizationDto.email.length
            ? updateOrganizationDto.email
            : undefined,
          slogan: updateOrganizationDto.slogan?.length
            ? updateOrganizationDto.slogan
            : undefined,
        },
        include: {
          members: {
            take: 3,
          },
          createdBy: true,
          bankAccount: true,
        },
      });
      return { data: organization, error: null };
    } catch (e) {
      return { data: null, error: 'Failed to update organization' };
    }
  }

  remove(id: number) {
    return `This action removes a #${id} organization`;
  }
}
