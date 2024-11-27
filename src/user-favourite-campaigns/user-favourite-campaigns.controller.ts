import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Post,
  UseGuards
} from '@nestjs/common';
import { GetCurrentUserId } from 'src/common/decorators/get-current-user-id.decorator';
import { AccessTokenGuard } from 'src/common/guards/auth/access-token.guard';
import { CreateUserFavouriteCampaignDto } from './dto/create-user-favourite-campaign.dto';
import { UserFavouriteCampaignsService } from './user-favourite-campaigns.service';

@Controller('user-favourite-campaigns')
export class UserFavouriteCampaignsController {
  constructor(
    private readonly userFavouriteCampaignsService: UserFavouriteCampaignsService,
  ) {}

  @UseGuards(AccessTokenGuard)
  @Post()
  async create(
    @GetCurrentUserId() userId: string,
    @Body() createUserFavouriteCampaignDto: CreateUserFavouriteCampaignDto,
  ) {
    const { data, error } = await this.userFavouriteCampaignsService.create(
      userId,
      createUserFavouriteCampaignDto,
    );
    if (error) {
      throw new InternalServerErrorException(error);
    }
    return data;
  }

  @UseGuards(AccessTokenGuard)
  @Get()
  async findAll(@GetCurrentUserId() userId: string) {
    const { data, error } = await this.userFavouriteCampaignsService.findAllByUserId(userId);
    if (error) {
      throw new InternalServerErrorException(error);
    }
    return data;
  }

  @UseGuards(AccessTokenGuard)
  @Delete()
  async remove(
    @GetCurrentUserId() userId: string,
    @Body() deleteUserFavouriteCampaignDto: CreateUserFavouriteCampaignDto,
  ) {
    const { data, error } = await this.userFavouriteCampaignsService.remove(
      userId,
      deleteUserFavouriteCampaignDto,
    );
    if (error) {
      throw new InternalServerErrorException(error);
    }
    return data;
  }
}
