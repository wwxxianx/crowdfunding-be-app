import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  InternalServerErrorException,
  Param,
  Patch,
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
import { Cache } from 'cache-manager';
import { PrismaService } from 'src/common/data/prisma.service';
import { GetCurrentUserId } from 'src/common/decorators/get-current-user-id.decorator';
import { HttpExceptionFilter } from 'src/common/error/http-exception.filter';
import { AccessTokenGuard } from 'src/common/guards/auth/access-token.guard';
import { ParseOptionalIntPipe } from 'src/common/pipes/optional-int.pipe';
import { UpdateUserDto } from './dto/update-user.dto';
import { ParseUserProfileDtoPipe } from './pipes/user-profile-dto.pipe';
import { UsersService } from './users.service';
// const { Configuration, OpenAIApi } = require("openai");

@Controller('users')
export class UsersController {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheService: Cache,
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
  ) {}

  @Patch('legal-identity')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'selfieImage', maxCount: 1 },
      { name: 'idFrontImage', maxCount: 1 },
      { name: 'idBackImage', maxCount: 1 },
    ]),
  )
  @UseGuards(AccessTokenGuard)
  async updateLegalIdentity(
    @GetCurrentUserId() userId: string,
    @UploadedFiles()
    files: {
      selfieImage?: Express.Multer.File;
      idFrontImage?: Express.Multer.File;
      idBackImage?: Express.Multer.File;
    },
  ) {
    const { data, error } = await this.usersService.updateLegalIdentity(
      userId,
      files,
    );
    if (error) {
      throw new InternalServerErrorException(error);
    }
    return data;
  }

  @Get('scam-reports')
  @UseGuards(AccessTokenGuard)
  async findUserSubmittedScamReports(@GetCurrentUserId() userId: string) {
    const { data, error } =
      await this.usersService.findUserSubmittedScamReports(userId);
    if (error) {
      throw new InternalServerErrorException(error);
    }
    return data;
  }

  @Get('donations')
  @UseGuards(AccessTokenGuard)
  async findUserDonations(@GetCurrentUserId() userId: string) {
    const { data, error } = await this.usersService.findUserDonations(userId);
    if (error) {
      throw new InternalServerErrorException(error);
    }
    return data;
  }

  @Get('tax-receipts')
  @UseGuards(AccessTokenGuard)
  async findUserTaxReceipt(
    @GetCurrentUserId() userId: string,
    @Query('year', ParseOptionalIntPipe) year?: number,
  ) {
    const { data, error } = await this.usersService.findUserDonationReceipt(
      userId,
      year,
    );
    if (error) {
      throw new InternalServerErrorException(error);
    }
    return data;
  }

  @UseGuards(AccessTokenGuard)
  @Get('community-challenges')
  async findAllParticipatedChallenges(@GetCurrentUserId() userId: string) {
    const { data, error } =
      await this.usersService.findParticipatedChallenges(userId);
    if (error) {
      throw new InternalServerErrorException(error);
    }
    return data;
  }

  @UseGuards(AccessTokenGuard)
  @Get('gift-cards')
  async findAllGiftCards(@GetCurrentUserId() userId: string) {
    const { data, error } =
      await this.usersService.findUserGiftCardsByUserId(userId);
    if (error) {
      throw new InternalServerErrorException(error);
    }
    if (data == null) {
      return [];
    }
    return data;
  }

  @UseGuards(AccessTokenGuard)
  @Get('received-gift-card-num')
  async findNumOfReceivedGiftCard(@GetCurrentUserId() userId: string) {
    const numOfGiftCards = await this.prisma.giftCard.count({
      where: {
        receiverId: userId,
        campaignDonation: null,
      },
    });
    return { numOfGiftCards };
  }

  @Get()
  async findAll(
    @Query('userName') userName?: string,
    @Query('email') email?: string,
  ) {
    const { data, error } = await this.usersService.findAll(userName, email);
    if (error) {
      throw new InternalServerErrorException(error);
    }
    return data;
  }

  @UseGuards(AccessTokenGuard)
  @Get('profile')
  async findOne(@GetCurrentUserId() userId: string) {
    const cacheKey = `cache:users:${userId}`;
    const cachedData = await this.cacheService.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    const { data, error } = await this.usersService.findOne(userId);
    if (error) {
      throw new BadRequestException(error);
    }
    await this.cacheService.set(cacheKey, data, 5000);
    return data;
  }

  @UseGuards(AccessTokenGuard)
  @Patch()
  @UseInterceptors(FileInterceptor('profileImageFile'))
  @UsePipes(new ParseUserProfileDtoPipe())
  @UseFilters(HttpExceptionFilter)
  async update(
    @GetCurrentUserId() userId: string,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() profileImageFile?: Express.Multer.File,
  ) {
    const { data, error } = await this.usersService.updateProfile(
      userId,
      updateUserDto,
      profileImageFile,
    );
    if (error) {
      throw new InternalServerErrorException(error);
    }
    return data;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
