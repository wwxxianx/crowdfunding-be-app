import { Inject, Injectable } from '@nestjs/common';
import {
  CampaignDonation,
  CommunityChallengeParticipant,
  GiftCard,
  IdentificationStatus,
  Prisma,
  User,
} from '@prisma/client';
import { PrismaService } from 'src/common/data/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { storageConstants } from 'src/common/constants/constants';
import { StorageService } from 'src/storage/storage.service';
import { UserGiftCard } from './entities/gift-card.entity';
import {
  TaxReceiptGenerator,
  TaxReceiptPayload,
} from 'src/common/utils/tax-generator';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { redisConstants } from 'src/common/constants/redis';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    private readonly taxReceiptGenerator: TaxReceiptGenerator,
    @Inject(CACHE_MANAGER) private readonly cacheService: Cache,
  ) {}

  async updateLegalIdentity(
    userId: string,
    files: {
      selfieImage?: Express.Multer.File;
      idFrontImage?: Express.Multer.File;
      idBackImage?: Express.Multer.File;
    },
  ) {
    try {
      const { selfieImage, idFrontImage, idBackImage } = files;
      let selfieImageUrl, idFrontImageUrl, idBackImageUrl;
      if (selfieImage) {
        console.log(selfieImage);
        const filePath = `${userId}/selfie/${selfieImage[0].originalname}`;
        const { data, error } = await this.storageService.uploadFile(
          storageConstants.USER_BUCKET,
          filePath,
          selfieImage[0].buffer,
          selfieImage[0].mimetype,
        );
        if (error) {
          return { error };
        }
        selfieImageUrl = data.publicUrl;
      }

      if (idFrontImage) {
        const filePath = `${userId}/id-front/${idFrontImage[0].originalname}`;
        const { data, error } = await this.storageService.uploadFile(
          storageConstants.USER_BUCKET,
          filePath,
          idFrontImage[0].buffer,
          idFrontImage[0].mimetype,
        );
        if (error) {
          return { error };
        }
        idFrontImageUrl = data.publicUrl;
      }

      if (idBackImage) {
        const filePath = `${userId}/id-back/${idBackImage[0].originalname}`;
        const { data, error } = await this.storageService.uploadFile(
          storageConstants.USER_BUCKET,
          filePath,
          idBackImage[0].buffer,
          idBackImage[0].mimetype,
        );
        if (error) {
          return { error };
        }
        idBackImageUrl = data.publicUrl;
      }
      const updatedUser = await this.prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          selfieImageUrl: selfieImageUrl,
          idFrontImageUrl: idFrontImageUrl,
          idBackImageUrl: idBackImageUrl,
          identificationStatus: IdentificationStatus.UNDER_REVIEW,
        },
      });
      return { data: updatedUser };
    } catch (e) {
      return { error: 'Failed to upload' };
    }
  }

  async findUserSubmittedScamReports(userId: string) {
    try {
      const data = await this.prisma.scamReport.findMany({
        where: {
          userId: userId,
        },
        include: {
          campaign: true,
        },
      });
      return { data };
    } catch (e) {
      return { data: null, error: 'Failed to fetch user submitted reports' };
    }
  }

  async findUserDonations(userId: string): Promise<Result<CampaignDonation[]>> {
    try {
      const userDonations = await this.prisma.campaignDonation.findMany({
        where: {
          userId: userId,
        },
        include: {
          campaign: {
            include: {
              campaignCategory: true,
              stateAndRegion: true,
              donations: true,
            },
          },
          user: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      return { data: userDonations };
    } catch (e) {
      return { data: null, error: 'Failed to fetch user donations' };
    }
  }

  async findUserDonationGroupByYear(userId: string) {
    try {
      // Group user donation by year
      const userDonations = await this.prisma.campaignDonation.findMany({
        where: {
          userId: userId,
        },
        include: {
          campaign: true,
          user: true,
        },
        take: 3,
        orderBy: {
          createdAt: 'desc',
        },
      });
      if (!userDonations) {
        return userDonations;
      }
      // Group donation by year
      const groupedUserDonations = userDonations.reduce((acc, donation) => {
        const year = new Date(donation.createdAt).getFullYear();
        if (!acc[year]) {
          acc[year] = [];
        }
        acc[year].push(donation);
        return acc;
      }, {});
      return groupedUserDonations;
    } catch (e) {}
  }

  async findUserDonationReceipt(userId: string, year?: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
      });
      if (!user.identityNumber) {
        return {
          error:
            'Please complete your identity number (NRIC/Passpoer No.) first',
        };
      }
      if (!user.phoneNumber) {
        return { error: 'Please complete your phone number first' };
      }
      if (!user.address) {
        return { error: 'Please complete your address first' };
      }
      const receipt = await this.prisma.taxReceiptReports.findFirst({
        where: {
          userId: userId,
          year: year,
        },
        include: {
          user: true,
        },
      });
      if (receipt) {
        return { data: receipt };
      }

      // Generate receipt
      // 1. Check user have donations at that year
      const userDonations = await this.findUserDonationGroupByYear(userId);
      if (!userDonations) {
        return { error: 'No donations found' };
      }
      if (!userDonations[`${year}`]) {
        return { error: `No donation found for year ${year}` };
      }
      // 2. Generate donation receipt
      const receiptPDF = await this.taxReceiptGenerator.createReceipt(
        userDonations[`${year}`],
      );
      const filePath = `receipt/${userId}/donation_receipt_${year}.pdf`;
      const { data, error } = await this.storageService.uploadFile(
        storageConstants.USER_BUCKET,
        filePath,
        receiptPDF,
        'application/pdf',
      );
      if (error) {
        return { error: `Failed to upload receipt pdf file: ${error}` };
      }
      const newReceipt = await this.prisma.taxReceiptReports.create({
        data: {
          userId: userId,
          year: year,
          receiptFileUrl: data.publicUrl,
        },
      });
      return { data: newReceipt };
    } catch (error) {
      return { error: `Failed to find receipt: ${error}` };
    }
  }

  async findParticipatedChallenges(
    userId: string,
  ): Promise<Result<CommunityChallengeParticipant[]>> {
    try {
      const data = await this.prisma.communityChallengeParticipant.findMany({
        where: {
          userId: userId,
        },
        include: {
          communityChallenge: true,
          user: true,
        },
      });
      return { data };
    } catch (e) {
      return { data: null, error: 'Failed to fetch user challenges' };
    }
  }

  async findUserGiftCardsByUserId(
    userId: string,
  ): Promise<Result<UserGiftCard | null>> {
    try {
      const giftCards = await this.prisma.giftCard.findMany({
        where: {
          OR: [
            {
              senderId: userId,
            },
            {
              receiverId: userId,
            },
          ],
        },
        include: {
          campaignDonation: {
            include: {
              user: true,
              campaign: true,
            },
          },
          sender: true,
          receiver: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (!giftCards) {
        return { data: null };
      }

      // Format
      const formattedGiftCards = {
        sent: giftCards.filter((giftCard) => giftCard.senderId === userId),
        received: giftCards.filter(
          (giftCard) => giftCard.receiverId === userId,
        ),
      };
      return { data: formattedGiftCards };
    } catch (e) {
      return { error: 'Failed to fetch user gift cards', data: null };
    }
  }

  async findAll(userName?: string, email?: string) {
    try {
      const cachedData = await this.cacheService.get(
        redisConstants.USER_KEY + `${userName ?? `name:${userName}`}`,
      );
      if (cachedData) {
        return { data: cachedData };
      }
      const users = await this.prisma.user.findMany({
        where: {
          OR: [
            {
              fullName: userName
                ? {
                    contains: userName,
                    mode: 'insensitive',
                  }
                : undefined,
            },
            {
              email: email
                ? {
                    contains: email,
                    mode: 'insensitive',
                  }
                : undefined,
            },
          ],
        },
      });
      await this.cacheService.set(
        redisConstants.USER_KEY + `${userName ?? `name:${userName}`}`,
        users,
      );
      return { data: users };
    } catch {
      return { data: null, error: 'Failed to fetch users' };
    }
  }

  async findOne(id: string): Promise<Result<User>> {
    try {
      const user = await this.prisma.user.findUniqueOrThrow({
        where: {
          id: id,
        },
        include: {
          preference: {
            include: {
              favouriteCampaignCategories: true,
            },
          },
          organization: {
            include: {
              createdBy: true,
            },
          },
        },
      });
      return { data: user, error: null };
    } catch (e) {
      return { data: null, error: 'Failed to fetch user details' };
    }
  }

  async updateProfile(
    userId: string,
    updateUserDto: UpdateUserDto,
    profileImageFile?: Express.Multer.File,
  ): Promise<Result<User>> {
    let profileImageUrl = '';
    if (profileImageFile != null) {
      const profileImageFilePath = `${storageConstants.USER_IMAGE_PATH}/${userId}/${profileImageFile.originalname}`;
      const { data, error } = await this.storageService.uploadFile(
        storageConstants.USER_BUCKET,
        profileImageFilePath,
        profileImageFile.buffer,
        profileImageFile.mimetype,
      );
      if (error)
        return { data: null, error: 'Failed to upload profile image.' };
      profileImageUrl = data.publicUrl;
    }
    const user = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        fullName: updateUserDto.fullName?.length
          ? updateUserDto.fullName
          : undefined,
        isOnboardingCompleted:
          updateUserDto?.isOnboardingCompleted == null
            ? undefined
            : updateUserDto.isOnboardingCompleted,
        phoneNumber: updateUserDto.phoneNumber?.length
          ? updateUserDto.phoneNumber
          : undefined,
        profileImageUrl: profileImageUrl?.length ? profileImageUrl : undefined,
        address: updateUserDto.address?.length
          ? updateUserDto.address
          : undefined,
        identityNumber: updateUserDto.identityNumber?.length
          ? updateUserDto.identityNumber
          : undefined,
        onesignalId: updateUserDto.onesignalId?.length
          ? updateUserDto.onesignalId
          : undefined,
        preference: updateUserDto.favouriteCategoriesId?.length
          ? {
              update: {
                favouriteCampaignCategories: {
                  set: updateUserDto.favouriteCategoriesId.map((id) => ({
                    id,
                  })),
                },
              },
            }
          : undefined,
      },
      include: {
        organization: {
          include: {
            createdBy: true,
          },
        },
        preference: {
          include: {
            favouriteCampaignCategories: true,
          },
        },
      },
    });
    return { data: user, error: null };
    try {
    } catch (e) {
      return { data: null, error: 'Failed to update user' };
    }
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
