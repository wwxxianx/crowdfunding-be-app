import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/common/data/prisma.service';
import { StorageService } from 'src/storage/storage.service';
import { mockReset } from 'jest-mock-extended';
import { UsersService } from '../users.service';
import { prismaMock, storageMock } from 'src/test/mock';
import { GiftCard, User } from '@prisma/client';
import {
  campaignDonationSamples,
  fileSamples,
  giftCardSamples,
  userSamples,
} from 'src/test/mock/mock-data';
import { UpdateUserDto } from '../dto/update-user.dto';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: StorageService,
          useValue: storageMock,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  beforeEach(() => {
    mockReset(prismaMock);
    mockReset(storageMock);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findUserGiftCardsByUserId', () => {
    it('should fetch user gift cards successfully', async () => {
      const userId = userSamples[0].id;
      const mockData: GiftCard[] = giftCardSamples;

      prismaMock.giftCard.findMany.mockResolvedValue(mockData);

      const result = await service.findUserGiftCardsByUserId(userId);
      expect(result.data).toEqual({
        sent: [mockData[0]],
        received: [],
      });
    });

    it('should return error when fetching user gift cards fails', async () => {
      const userId = 'invalidId';

      prismaMock.giftCard.findMany.mockRejectedValue(new Error('Error'));

      const result = await service.findUserGiftCardsByUserId(userId);
      expect(result.error).toBe('Failed to fetch user gift cards');
      expect(result.data).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should fetch all users based on query', async () => {
      const userName = userSamples[0].fullName;
      const email = userSamples[0].email;
      const mockData: User[] = userSamples;

      prismaMock.user.findMany.mockResolvedValue(mockData);

      const result = await service.findAll(userName, email);
      expect(result).toEqual(mockData);
    });
  });

  describe('findUserDonations', () => {
    it('should fetch user donations successfully', async () => {
      const userId = userSamples[0].id;
      const mockData = campaignDonationSamples;

      prismaMock.campaignDonation.findMany.mockResolvedValue(mockData);

      const result = await service.findUserDonationGroupByYear(userId);
      expect(result.data).toEqual(mockData);
    });

    it('should return error when fetching user donations fails', async () => {
      const userId = 'invalidId';

      prismaMock.campaignDonation.findMany.mockRejectedValue(
        new Error('Error'),
      );

      const result = await service.findUserDonationGroupByYear(userId);
      expect(result.error).toBe('Failed to fetch donation history.');
      expect(result.data).toBeNull();
    });
  });

  describe('findOne', () => {
    it('should fetch a user successfully', async () => {
      const userId = userSamples[0].id;
      const mockData = userSamples[0];

      prismaMock.user.findUniqueOrThrow.mockResolvedValue(mockData);

      const result = await service.findOne(userId);
      expect(result.data).toEqual(mockData);
    });

    it('should return error when fetching user details fails', async () => {
      const userId = 'invalidId';

      prismaMock.user.findUniqueOrThrow.mockRejectedValue(new Error('Error'));

      const result = await service.findOne(userId);
      expect(result.error).toBe('Failed to fetch user details');
      expect(result.data).toBeNull();
    });
  });

  describe('updateProfile', () => {
    it('should update user profile successfully', async () => {
      const userId = 'testUserId';
      const updateUserDto: UpdateUserDto = {
        fullName: 'Updated Name',
        phoneNumber: '123456789',
        favouriteCategoriesId: ['categoryId'],
        profileImageUrl: null,
        isOnboardingCompleted: true,
      };
      const profileImageFile = fileSamples[0];

      const mockUploadResponse = {
        data: { publicUrl: 'http://example.com/profile.png' },
        error: null,
      };
      const mockUserData = userSamples[0];

      storageMock.uploadFile.mockResolvedValue(mockUploadResponse);
      prismaMock.user.update.mockResolvedValue(mockUserData);

      const result = await service.updateProfile(
        userId,
        updateUserDto,
        profileImageFile,
      );
      expect(result.data).toEqual(mockUserData);
    });

    it('should return error when updating user profile fails', async () => {
      const userId = 'invalidId';
      let updateUserDto: any;

      prismaMock.user.update.mockRejectedValue(new Error('Error'));

      const result = await service.updateProfile(userId, updateUserDto);
      expect(result.error).toBe('Failed to update user');
      expect(result.data).toBeNull();
    });
  });
});
