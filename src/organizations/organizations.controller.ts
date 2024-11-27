import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  InternalServerErrorException,
  BadRequestException,
  UseInterceptors,
  UploadedFile,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { AccessTokenGuard } from 'src/common/guards/auth/access-token.guard';
import { GetCurrentUserId } from 'src/common/decorators/get-current-user-id.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { JoinOrganizationDto } from './dto/join-organization.dto';
import { ParseOptionalIntPipe } from 'src/common/pipes/optional-int.pipe';

@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @UseGuards(AccessTokenGuard)
  @UseInterceptors(FileInterceptor('imageFile'))
  @Post()
  async create(
    @GetCurrentUserId() userId: string,
    @Body() createOrganizationDto: CreateOrganizationDto,
    @UploadedFile() imageFile?: Express.Multer.File,
  ) {
    const { data, error } = await this.organizationsService.create(
      userId,
      createOrganizationDto,
      imageFile,
    );
    if (error) {
      throw new InternalServerErrorException(error);
    }
    // return invitation code
    return data;
  }

  @UseGuards(AccessTokenGuard)
  @Post('join')
  async joinOrganization(
    @GetCurrentUserId() userId: string,
    @Body() joinOrganizationDto: JoinOrganizationDto,
  ) {
    const { data, error } = await this.organizationsService.joinOrganization(
      userId,
      joinOrganizationDto,
    );
    if (error) {
      throw new InternalServerErrorException(error);
    }
    return data;
  }

  @Get()
  async findAll(@Query('limit', ParseOptionalIntPipe) limit?: number) {
    const { data, error } = await this.organizationsService.findAll(limit);
    if (error) {
      throw new BadRequestException(error);
    }
    return data;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const { data, error } = await this.organizationsService.findOne(id);
    if (error) {
      throw new BadRequestException(error);
    }
    return data;
  }

  @Get(':id/members')
  async findAllMembers(@Param('id') id: string) {
    const { data, error } = await this.organizationsService.findAllMembers(id);
    if (error) {
      throw new BadRequestException(error);
    }
    return data;
  }

  @Get('invitation/:code')
  async findByInvitationCode(@Param('code') invitationCode: string) {
    const { data, error } =
      await this.organizationsService.findByInvitationCode(invitationCode);
    if (error) {
      throw new BadRequestException(
        'Failed to find your organization with this code.',
      );
    }
    return data;
  }

  @Patch(':id')
  // @UseGuards(AccessTokenGuard)
  @UseInterceptors(FileInterceptor('imageFile'))
  async update(
    @Param('id') id: string,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
    @UploadedFile() imageFile?: Express.Multer.File,
  ) {
    const { data, error } = await this.organizationsService.update(
      id,
      updateOrganizationDto,
      imageFile,
    );
    if (error) {
      throw new InternalServerErrorException(error);
    }
    return data;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.organizationsService.remove(+id);
  }
}
