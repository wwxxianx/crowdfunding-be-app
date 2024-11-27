import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/common/data/prisma.service';
import { mockReset } from 'jest-mock-extended';
import { UserFavouriteCampaignsService } from '../user-favourite-campaigns.service';
import { prismaMock } from 'src/test/mock';
import { CreateUserFavouriteCampaignDto } from '../dto/create-user-favourite-campaign.dto';
import { UserFavouriteCampaign } from '@prisma/client';

describe('UserFavouriteCampaignsService', () => {
  let service: UserFavouriteCampaignsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserFavouriteCampaignsService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<UserFavouriteCampaignsService>(UserFavouriteCampaignsService);
  });

  beforeEach(() => {
    mockReset(prismaMock);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a favourite campaign successfully', async () => {
      const userId = 'testUserId';
      const createUserFavouriteCampaignDto: CreateUserFavouriteCampaignDto = {
        campaignId: 'testCampaignId',
      };
      const mockData: UserFavouriteCampaign = {
        userId: userId,
        campaignId: createUserFavouriteCampaignDto.campaignId,
        createdAt: new Date(),
      };

      prismaMock.userFavouriteCampaign.create.mockResolvedValue(mockData);

      const result = await service.create(userId, createUserFavouriteCampaignDto);
      expect(result.data).toEqual(mockData);
    });

    it('should return error when creating a favourite campaign fails', async () => {
      const userId = 'testUserId';
      const createUserFavouriteCampaignDto: CreateUserFavouriteCampaignDto = {
        campaignId: 'testCampaignId',
      };

      prismaMock.userFavouriteCampaign.create.mockRejectedValue(new Error('Error'));

      const result = await service.create(userId, createUserFavouriteCampaignDto);
      expect(result.error).toBe('Failed to create favourite');
      expect(result.data).toBeNull();
    });
  });

  describe('findAllByUserId', () => {
    it('should fetch all favourite campaigns for a user successfully', async () => {
      const userId = 'testUserId';
      const mockData: UserFavouriteCampaign[] = [{
        userId: userId,
        campaignId: 'testCampaignId',
        createdAt: new Date(),
      }];

      prismaMock.userFavouriteCampaign.findMany.mockResolvedValue(mockData);

      const result = await service.findAllByUserId(userId);
      expect(result.data).toEqual(mockData);
    });

    it('should return error when fetching favourite campaigns for a user fails', async () => {
      const userId = 'testUserId';

      prismaMock.userFavouriteCampaign.findMany.mockRejectedValue(new Error('Error'));

      const result = await service.findAllByUserId(userId);
      expect(result.error).toBe('Failed to fetch user\'s favourite campaigns');
      expect(result.data).toBeNull();
    });
  });

  describe('remove', () => {
    it('should remove a favourite campaign successfully', async () => {
      const userId = 'testUserId';
      const deleteUserFavouriteCampaignDto: CreateUserFavouriteCampaignDto = {
        campaignId: 'testCampaignId',
      };
      const mockData: UserFavouriteCampaign = {
        userId: userId,
        campaignId: deleteUserFavouriteCampaignDto.campaignId,
        createdAt: new Date(),
      };

      prismaMock.userFavouriteCampaign.delete.mockResolvedValue(mockData);

      const result = await service.remove(userId, deleteUserFavouriteCampaignDto);
      expect(result.data).toEqual(mockData);
    });

    it('should return error when removing a favourite campaign fails', async () => {
      const userId = 'testUserId';
      const deleteUserFavouriteCampaignDto: CreateUserFavouriteCampaignDto = {
        campaignId: 'testCampaignId',
      };

      prismaMock.userFavouriteCampaign.delete.mockRejectedValue(new Error('Error'));

      const result = await service.remove(userId, deleteUserFavouriteCampaignDto);
      expect(result.error).toBe('Failed to remove favourite');
      expect(result.data).toBeNull();
    });
  });
});
