import { Injectable } from '@nestjs/common';
import { CampaignUpdate } from '@prisma/client';
import { storageConstants } from 'src/common/constants/constants';
import { PrismaService } from 'src/common/data/prisma.service';
import { StorageService } from 'src/storage/storage.service';
import {
  CreateCampaignUpdateDto,
  CreateCampaignUpdateRecommendationDto,
} from './dto/create-campaign-update.dto';
import { OpenAIService } from 'src/openai/openai.service';

@Injectable()
export class CampaignUpdatesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    private readonly openaiService: OpenAIService,
  ) {}

  async createCampaignUpdateRecommendation(
    dto: CreateCampaignUpdateRecommendationDto,
  ): Promise<Result<{ title: string; description: string }>> {
    const campaign = await this.prisma.campaign.findUnique({
      where: {
        id: dto.campaignId,
      },
      include: {
        campaignCategory: true,
      },
    });

    return await this.openaiService.createCampaignUpdatePostRecommendation({
      campaignCategory: campaign.campaignCategory,
      topic: dto.topic,
    });
  }

  async create(
    userId: string,
    createCampaignUpdateDto: CreateCampaignUpdateDto,
    imageFiles?: Express.Multer.File[],
  ): Promise<Result<CampaignUpdate>> {
    try {
      let imageUrls = [];
      const fileObjects = Object.values(imageFiles);
      if (fileObjects.length) {
        for (const imageFile of fileObjects) {
          const filePath = `${storageConstants.CAMPAIGN_UPDATE_IMAGE_PATH}/${createCampaignUpdateDto.campaignId}/${imageFile.originalname}`;
          const { data, error } = await this.storageService.uploadFile(
            storageConstants.CAMPAIGN_BUCKET,
            filePath,
            imageFile.buffer,
            imageFile.mimetype,
          );
          if (!error) {
            imageUrls.push(data.publicUrl);
          }
        }
      }

      const data = await this.prisma.campaignUpdate.create({
        data: {
          description: createCampaignUpdateDto.description,
          title: createCampaignUpdateDto.title,
          campaign: {
            connect: {
              id: createCampaignUpdateDto.campaignId,
            },
          },
          user: {
            connect: {
              id: userId,
            },
          },
          images: !imageUrls.length
            ? undefined
            : {
                createMany: {
                  data: imageUrls.map((imageUrl) => ({
                    imageUrl,
                  })),
                },
              },
        },
        include: {
          user: true,
          images: true,
        },
      });
      return { data };
    } catch (e) {
      return { error: 'Failed to create campaign update', data: null };
    }
  }
}
