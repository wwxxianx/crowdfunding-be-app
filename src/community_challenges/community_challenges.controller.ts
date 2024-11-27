import {
  ArgumentMetadata,
  Body,
  Controller,
  Delete,
  Get,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Param,
  ParseFilePipe,
  Patch,
  PipeTransform,
  Post,
  Query,
  Req,
  UploadedFile,
  UploadedFiles,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { GetCurrentUserId } from 'src/common/decorators/get-current-user-id.decorator';
import { AccessTokenGuard } from 'src/common/guards/auth/access-token.guard';
import { CommunityChallengesService } from './community_challenges.service';
import { MultiPartJsonDto } from './dto/create-community-challenge.dto';
import { CreateParticipantDto } from './dto/create-participant.dto';
import {
  AdminUpdateChallengeParticipantDto,
  UpdateChallengeParticipantDto,
} from './dto/update-challenge-participant.dto';
import { Request } from 'express';
import { PrismaService } from 'src/common/data/prisma.service';
import { CommunityChallengeType } from '@prisma/client';

@Injectable()
export class FileSizeValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    // "value" is an object containing the file's attributes and metadata
    console.log('receive file value:', value);
    const oneKb = 1000;
    return value.size < oneKb;
  }
}

@Controller('community-challenges')
export class CommunityChallengesController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly communityChallengesService: CommunityChallengesService,
  ) {}

  // @UseGuards(AccessTokenGuard)
  // @Get('')
  // async findCurrentUserCompletedChallenge(@GetCurrentUserId() userId: string) {
  //   const participatedChallenges =
  //     await this.prisma.communityChallengeParticipant.findMany({
  //       where: {
  //         userId: userId,
  //       },
  //       include: {
  //         communityChallenge: {
  //           include: {
  //             targetCampaignCategories: true,
  //           },
  //         },
  //       },
  //     });
  //   if (!participatedChallenges) return;
  //   const donationChallenges = participatedChallenges.filter(
  //     (participatedChallenge) => {
  //       return (
  //         participatedChallenge.communityChallenge.challengeType ===
  //         CommunityChallengeType.DONATION
  //       );
  //     },
  //   )?.map((item) => {
  //     return item.communityChallenge;
  //   });
  //   if (!donationChallenges) return;
  // }

  @UseGuards(AccessTokenGuard)
  @Post('/participants')
  async createParticipant(
    @GetCurrentUserId() userId: string,
    @Body() createParticipantDto: CreateParticipantDto,
  ) {
    const { data, error } =
      await this.communityChallengesService.createParticipant(
        userId,
        createParticipantDto,
      );
    if (error) {
      throw new InternalServerErrorException(error);
    }
    return data;
  }

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'challengeImageFile', maxCount: 1 },
      { name: 'sponsorImageFile', maxCount: 1 },
    ]),
  )
  async createChallenge(
    @Body() createCommunityChallengeDtoJson: MultiPartJsonDto,
    @UploadedFiles()
    files: {
      challengeImageFile: Express.Multer.File;
      sponsorImageFile?: Express.Multer.File;
    },
  ) {
    const { challengeImageFile = null, sponsorImageFile = null } = files || {};
    const createCommunityChallengeDto = JSON.parse(
      createCommunityChallengeDtoJson.jsonData,
    );
    const { data, error } =
      await this.communityChallengesService.createChallenge(
        createCommunityChallengeDto,
        challengeImageFile,
        sponsorImageFile,
      );
    if (error) {
      throw new InternalServerErrorException(error);
    }
    return data;
  }

  @Patch('admin/:id')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'challengeImageFile', maxCount: 1 },
      { name: 'sponsorImageFile', maxCount: 1 },
    ]),
  )
  async updateChallenge(
    @Param('id') id: string,
    @Body() updateChallengeDtoJson: MultiPartJsonDto,
    @UploadedFiles()
    files: {
      challengeImageFile?: Express.Multer.File;
      sponsorImageFile?: Express.Multer.File;
    },
  ) {
    const { challengeImageFile = null, sponsorImageFile = null } = files || {};
    const updateCommunityChallengeDto = JSON.parse(
      updateChallengeDtoJson.jsonData,
    );
    const { data, error } =
      await this.communityChallengesService.updateChallenge(
        id,
        updateCommunityChallengeDto,
        challengeImageFile,
        sponsorImageFile,
      );
    if (error) {
      throw new InternalServerErrorException(error);
    }
    return data;
  }

  @Get()
  async findAll(@Query('isExpired') isExpired?: boolean) {
    const { data, error } =
      await this.communityChallengesService.findAll(isExpired);
    if (error) {
      throw new InternalServerErrorException(error);
    }
    return data;
  }

  @UseGuards(AccessTokenGuard)
  @Get('participants/:communityChallengeId')
  async findParticipantProgress(
    @GetCurrentUserId() userId: string,
    @Param('communityChallengeId') communityChallengeId: string,
  ) {
    const { data, error } =
      await this.communityChallengesService.findParticipantProgress(
        userId,
        communityChallengeId,
      );
    if (error) {
      throw new InternalServerErrorException(error);
    }
    if (!data) {
      throw new NotFoundException('No data found');
    }
    return data;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const { data, error } = await this.communityChallengesService.findOne(id);
    if (error) {
      throw new InternalServerErrorException(error);
    }
    return data;
  }

  @Patch('participants/admin')
  async adminUpdateParticipant(
    @Body() updateChallengeParticipantDto: AdminUpdateChallengeParticipantDto,
  ) {
    const { data, error } =
      await this.communityChallengesService.adminUpdateChallengeParticipant(
        updateChallengeParticipantDto,
      );
    if (error) {
      throw new InternalServerErrorException(error);
    }
    return data;
  }

  @Patch('participants')
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(FileInterceptor('imageFile'))
  async updateParticipant(
    @GetCurrentUserId() userId: string,
    @Body() updateChallengeParticipantDto: UpdateChallengeParticipantDto,
    @UploadedFile() imageFile: Express.Multer.File,
  ) {
    const { data, error } =
      await this.communityChallengesService.updateChallengeParticipant(
        userId,
        updateChallengeParticipantDto,
        imageFile,
      );
    if (error) {
      throw new InternalServerErrorException(error);
    }
    return data;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.communityChallengesService.remove(+id);
  }
}