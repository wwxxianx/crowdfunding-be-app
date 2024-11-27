import {
  Body,
  Controller,
  InternalServerErrorException,
  Post,
  UploadedFiles,
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ParseCreateCampaignDtoPipe } from 'src/campaigns/pipes/create-campaign-dto.pipe';
import { GetCurrentUserId } from 'src/common/decorators/get-current-user-id.decorator';
import { HttpExceptionFilter } from 'src/common/error/http-exception.filter';
import { AccessTokenGuard } from 'src/common/guards/auth/access-token.guard';
import { CampaignUpdatesService } from './campaign-updates.service';
import {
  CreateCampaignUpdateDto,
  CreateCampaignUpdateRecommendationDto,
} from './dto/create-campaign-update.dto';

@Controller('campaign-updates')
export class CampaignUpdatesController {
  constructor(
    private readonly campaignUpdatesService: CampaignUpdatesService,
  ) {}

  @Post('recommendation')
  async createCampaignUpdateRecommendation(
    @Body() dto: CreateCampaignUpdateRecommendationDto,
  ) {
    const { data, error } =
      await this.campaignUpdatesService.createCampaignUpdateRecommendation(dto);
    if (error) {
      throw new InternalServerErrorException(error);
    }
    return data;
  }

  @UseGuards(AccessTokenGuard)
  @Post('')
  @UseInterceptors(FilesInterceptor('imageFiles'))
  @UseFilters(HttpExceptionFilter)
  @UsePipes(new ParseCreateCampaignDtoPipe())
  async createCampaignUpdate(
    @GetCurrentUserId() userId: string,
    @UploadedFiles() imageFiles: Express.Multer.File[],
    @Body() createCampaignUpdateDto: CreateCampaignUpdateDto,
  ) {
    const { data, error } = await this.campaignUpdatesService.create(
      userId,
      createCampaignUpdateDto,
      imageFiles,
    );

    if (error) {
      throw new InternalServerErrorException(error);
    }

    return data;
  }
}
