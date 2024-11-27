import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  InternalServerErrorException,
  UseGuards,
  Query,
} from '@nestjs/common';
import { CollaborationsService } from './collaborations.service';
import { CreateCollaborationDto } from './dto/create-collaboration.dto';
import { UpdateCollaborationDto } from './dto/update-collaboration.dto';
import { AccessTokenGuard } from 'src/common/guards/auth/access-token.guard';
import { ParseOptionalEnumPipe } from 'src/common/pipes/optional-enum.pipe';
import { CollaborationFilter } from './dto/filters';
import { ParseOptionalBoolPipe } from 'src/common/pipes/optional-bool.pipe';
import { GetCurrentUserId } from 'src/common/decorators/get-current-user-id.decorator';

@Controller('collaborations')
export class CollaborationsController {
  constructor(private readonly collaborationsService: CollaborationsService) {}

  @UseGuards(AccessTokenGuard)
  @Post()
  async create(@Body() createCollaborationDto: CreateCollaborationDto) {
    const { data, error } = await this.collaborationsService.create(
      createCollaborationDto,
    );
    if (error) {
      throw new InternalServerErrorException(error);
    }
    return data;
  }

  @Get()
  async findAll(
    @Query('isPending', ParseOptionalBoolPipe,) isPending?: boolean,
    @Query('organizationId') organizationId?: string,
    @Query('campaignId') campaignId?: string,
  ) {
    const filter: CollaborationFilter = {
      isPending: isPending,
      organizationId: organizationId,
      campaignId: campaignId,
    } 
    const { data, error } = await this.collaborationsService.findAll(filter);
    if (error) {
      throw new InternalServerErrorException(error);
    }
    return data;
  }

  @Get(':id')
  async findOne(@Param('id') campaignId: string) {
    const { data, error } =
      await this.collaborationsService.findOne(campaignId);
    if (error) {
      throw new InternalServerErrorException(error);
    }
    return data;
  }

  @Patch(':id')
  @UseGuards(AccessTokenGuard)
  async update(
    @GetCurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() updateCollaborationDto: UpdateCollaborationDto,
  ) {
    const { data, error } = await this.collaborationsService.update(
      id,
      updateCollaborationDto,
    );
    if (error) {
      throw new InternalServerErrorException(error);
    }
    return data;
  }

  @Patch(":id/accept")
  @UseGuards(AccessTokenGuard)
  async organizationAcceptCollaboration(
    @GetCurrentUserId() userId: string,
    @Param('id') id: string,
  ) {
    const { data, error } = await this.collaborationsService.organizationAcceptCollaboration(
      id,
      userId,
    );
    if (error) {
      throw new InternalServerErrorException(error);
    }
    return data;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.collaborationsService.remove(+id);
  }
}
