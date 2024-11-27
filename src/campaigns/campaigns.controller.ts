import { CACHE_MANAGER, CacheInterceptor } from '@nestjs/cache-manager';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  InternalServerErrorException,
  Param,
  ParseBoolPipe,
  ParseEnumPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { AsyncLocalStorage } from 'async_hooks';
import { Cache } from 'cache-manager';
import { storageConstants } from 'src/common/constants/constants';
import { PrismaService } from 'src/common/data/prisma.service';
import { GetCurrentUserId } from 'src/common/decorators/get-current-user-id.decorator';
import { HttpExceptionFilter } from 'src/common/error/http-exception.filter';
import { AccessTokenGuard } from 'src/common/guards/auth/access-token.guard';
import { generateArrayQueryParameter } from 'src/common/utils/generate-query-parameter';
import { StorageService } from 'src/storage/storage.service';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import {
  AdminUpdateCampaignDto,
  UpdateCampaignDto,
} from './dto/update-campaign.dto';
import { UpdateFundraiserDto } from './dto/update-fundraiser.dto';
import { ParseCreateCampaignDtoPipe } from './pipes/create-campaign-dto.pipe';
import { ParseUpdateCampaignDtoPipe } from './pipes/update-campaign-dto.pipe';
import { Campaign, IdentificationStatus } from '@prisma/client';
import { ParseOptionalEnumPipe } from 'src/common/pipes/optional-enum.pipe';
import { ParseOptionalBoolPipe } from 'src/common/pipes/optional-bool.pipe';

@Controller('campaigns')
export class CampaignsController {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheService: Cache,
    private readonly als: AsyncLocalStorage<Map<string, any>>,
    private readonly campaignsService: CampaignsService,
    private readonly storageService: StorageService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('close-to-target')
  async findCloseToTargetCampaigns() {
    const { data, error } =
      await this.campaignsService.findCloseToTargetCampaigns();
    if (error) {
      throw new InternalServerErrorException(error);
    }
    return data;
  }

  @Get('interested')
  @UseGuards(AccessTokenGuard)
  async findUserInterestedCampaigns(@GetCurrentUserId() userId: string) {
    const { data, error } =
      await this.campaignsService.findUserInterestedCampaigns(userId);
    if (error) {
      throw new InternalServerErrorException(error);
    }
    return data;
  }

  @Get('successful')
  async findSuccessfulCampaigns() {
    const { data, error } =
      await this.campaignsService.findSuccessfulCampaigns();
    if (error) {
      throw new InternalServerErrorException(error);
    }
    return data;
  }

  @UseGuards(AccessTokenGuard)
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'campaignImages', maxCount: 5 },
      { name: 'campaignVideo', maxCount: 1 },
      { name: 'beneficiaryImage', maxCount: 1 },
    ]),
  )
  @UseFilters(HttpExceptionFilter)
  @UsePipes(new ParseCreateCampaignDtoPipe())
  async create(
    @GetCurrentUserId() userId: string,
    @UploadedFiles()
    files: {
      campaignImages?: Express.Multer.File[];
      campaignVideo?: Express.Multer.File;
      beneficiaryImage?: Express.Multer.File;
    },
    @Body() createCampaignDto: CreateCampaignDto,
  ) {
    const {
      campaignImages = [],
      campaignVideo = null,
      beneficiaryImage = null,
    } = files || {};

    if (!campaignImages.length) {
      // Handle error
      throw new BadRequestException('campaign images is required');
    }
    const { data, error } = await this.campaignsService.create(
      userId,
      createCampaignDto,
      campaignImages,
      campaignVideo,
      beneficiaryImage,
    );
    if (error) {
      throw new InternalServerErrorException(error);
    }
    return data;
  }

  @Get()
  async findAll(
    @Query('userId') userId?: string,
    @Query('categoryIds') categoryIds?: string[],
    @Query('stateIds') stateIds?: string[],
    @Query('searchQuery') searchQuery?: string,
    @Query('isPublished', ParseOptionalBoolPipe) isPublished?: boolean,
    @Query('identification', new ParseOptionalEnumPipe(IdentificationStatus))
    identification?: IdentificationStatus | undefined,
  ) {
    const categoryIdsArray = generateArrayQueryParameter(categoryIds);
    const stateIdsArray = generateArrayQueryParameter(stateIds);

    const campaigns = await this.campaignsService.findAll({
      categoryIds: categoryIdsArray,
      stateIds: stateIdsArray,
      identificationStatus: identification,
      isPublished: isPublished,
      searchQuery: searchQuery,
      userId: userId,
    });
    return campaigns;
  }

  private _createCacheKey(): string {
    // Get the hashed url from middleware in appModule
    const url = this.als.getStore().get('url');
    return url;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const cacheKey = `campaign:${id}`;
    const ttl = 30 * 60 * 1000;
    // await this.cacheService.del(cacheKey);
    // const cacheData = await this.cacheService.get(cacheKey);
    // if (cacheData) {
    //   return cacheData;
    // }

    const { data, error } = await this.campaignsService.findOne(id);
    if (error) {
      throw new InternalServerErrorException(error);
    }
    await this.cacheService.set(cacheKey, data, ttl);
    return data;
  }

  @Get(':id/fundraiser')
  async findFundraiser(@Param('id') id: string) {
    return await this.campaignsService.findFundraiser(id);
  }

  @UseInterceptors(FileInterceptor('signatureFile'))
  @Patch(':id/fundraiser')
  async updateFundraiser(
    @Param('id') id: string,
    @Body() updateFundraiserDto: UpdateFundraiserDto,
    @UploadedFile() signatureFile?: Express.Multer.File,
  ) {
    const { data, error } = await this.campaignsService.updateFundraiser(
      id,
      updateFundraiserDto,
      signatureFile,
    );
    if (error) {
      throw new InternalServerErrorException(error);
    }
    return data;
  }

  @UseGuards(AccessTokenGuard)
  @Patch(':id')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'campaignImages', maxCount: 5 },
      { name: 'campaignVideo', maxCount: 1 },
      { name: 'beneficiaryImage', maxCount: 1 },
    ]),
  )
  @UseFilters(HttpExceptionFilter)
  @UsePipes(new ParseUpdateCampaignDtoPipe())
  async update(
    @GetCurrentUserId() userId: string,
    @Param('id') campaignId: string,
    @Body() updateCampaignDto: UpdateCampaignDto,
    @UploadedFiles()
    files: {
      campaignImages?: Express.Multer.File[];
      campaignVideo?: Express.Multer.File;
      beneficiaryImage?: Express.Multer.File;
    },
  ) {
    const {
      campaignImages = [],
      campaignVideo = null,
      beneficiaryImage = null,
    } = files || {};
    var campaignImageUrls = [];
    var beneficiaryImageUrl: string;
    var thumbnailUrl: string;
    var videoUrl: string;

    if (!updateCampaignDto.oriCampaignImagesId?.length) {
      // Delete all old images
      await this.prisma.campaignImage.deleteMany({
        where: {
          campaignId: campaignId,
        },
      });
    } else {
      await this.prisma.campaignImage.deleteMany({
        where: {
          campaignId: campaignId,
          id: {
            notIn: updateCampaignDto.oriCampaignImagesId,
          },
        },
      });
    }

    if (campaignImages) {
      // Generate new image
      for (const imageFile of campaignImages) {
        const filePath = `${storageConstants.CAMPAIGN_IMAGE_PATH}/${imageFile.originalname}`;
        const { data, error } = await this.storageService.uploadFile(
          storageConstants.CAMPAIGN_BUCKET,
          filePath,
          imageFile.buffer,
          imageFile.mimetype,
        );

        if (error) {
          throw new InternalServerErrorException(error);
        }

        campaignImageUrls.push(data.publicUrl);
      }
    }

    if (beneficiaryImage) {
      // Generate beneficiary image Url
      const filePath = `${storageConstants.CAMPAIGN_BENEFICIARY_IMAGE_PATH}/${beneficiaryImage.originalname}`;
      const { data, error } = await this.storageService.uploadFile(
        storageConstants.CAMPAIGN_BUCKET,
        filePath,
        beneficiaryImage.buffer,
        beneficiaryImage.mimetype,
      );

      if (error) {
        throw new InternalServerErrorException(error);
      }
      beneficiaryImageUrl = data.publicUrl;
    }

    if (campaignVideo) {
      // Generate video Url
      const filePath = `${storageConstants.CAMPAIGN_VIDEO_PATH}/${campaignVideo.originalname}`;
      const { data, error } = await this.storageService.uploadFile(
        storageConstants.CAMPAIGN_BUCKET,
        filePath,
        campaignVideo.buffer,
        campaignVideo.mimetype,
      );

      if (error) {
        throw new InternalServerErrorException(error);
      }
      videoUrl = data.publicUrl;
    }

    const campaignImagesData =
      campaignImageUrls?.map((url) => ({
        imageUrl: url,
      })) ?? [];

    if (campaignImagesData?.length) {
      console.log('something here');
    } else {
      console.log('nothing here');
    }

    return await this.prisma.campaign.update({
      where: {
        id: campaignId,
      },
      data: {
        beneficiaryName: updateCampaignDto.beneficiaryName ?? undefined,
        title: updateCampaignDto.title ?? undefined,
        description: updateCampaignDto.description ?? undefined,
        targetAmount: updateCampaignDto.targetAmount ?? undefined,
        contactPhoneNumber: updateCampaignDto.contactPhoneNumber ?? undefined,
        beneficiaryAgeGroup: updateCampaignDto.beneficiaryAgeGroup ?? undefined,
        campaignCategory: updateCampaignDto.categoryId
          ? { connect: { id: updateCampaignDto.categoryId } }
          : undefined,
        stateAndRegion: updateCampaignDto.stateId
          ? { connect: { id: updateCampaignDto.stateId } }
          : undefined,
        user: { connect: { id: userId } },
        thumbnailUrl: thumbnailUrl ?? undefined,
        beneficiaryImageUrl: beneficiaryImageUrl ?? undefined,
        images: campaignImagesData?.length
          ? {
              createMany: {
                data: campaignImagesData,
              },
            }
          : undefined,
        videoUrl: videoUrl ?? undefined,
      },
      include: {
        user: true,
        images: true,
        campaignCategory: true,
        stateAndRegion: true,
      },
    });
  }

  @Patch('admin/:id')
  @UseFilters(HttpExceptionFilter)
  async adminUpdateCampaign(
    @Param('id') campaignId: string,
    @Body() updateCampaignDto: AdminUpdateCampaignDto,
  ) {
    return await this.campaignsService.adminUpdateCampaign(
      campaignId,
      updateCampaignDto,
    );
  }
}
