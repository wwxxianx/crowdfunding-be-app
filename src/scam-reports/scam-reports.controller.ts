import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  InternalServerErrorException,
} from '@nestjs/common';
import { ScamReportsService } from './scam-reports.service';
import { CreateScamReportDto } from './dto/create-scam-report.dto';
import { UpdateScamReportDto } from './dto/update-scam-report.dto';
import { AccessTokenGuard } from 'src/common/guards/auth/access-token.guard';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { GetCurrentUserId } from 'src/common/decorators/get-current-user-id.decorator';

@Controller('scam-reports')
export class ScamReportsController {
  constructor(private readonly scamReportsService: ScamReportsService) {}

  @UseGuards(AccessTokenGuard)
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'evidenceImageFiles', maxCount: 10 },
      { name: 'documentFiles', maxCount: 10 },
    ]),
  )
  async create(
    @GetCurrentUserId() userId: string,
    @Body() createScamReportDto: CreateScamReportDto,
    @UploadedFiles()
    files: {
      evidenceImageFiles?: Express.Multer.File[];
      documentFiles?: Express.Multer.File[];
    },
  ) {
    const { evidenceImageFiles = null, documentFiles = null } = files;
    const { data, error } = await this.scamReportsService.create(
      userId,
      createScamReportDto,
      evidenceImageFiles,
      documentFiles,
    );
    if (error) {
      throw new InternalServerErrorException(error);
    }
    return data;
  }

  @Get()
  async findAll() {
    const { data, error } = await this.scamReportsService.findAll();
    if (error) {
      throw new InternalServerErrorException(error);
    }
    return data;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const { data, error } = await this.scamReportsService.findOne(id);
    if (error) {
      throw new InternalServerErrorException(error);
    }
    return data;
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateScamReportDto: UpdateScamReportDto,
  ) {
    const { data, error } = await this.scamReportsService.update(
      id,
      updateScamReportDto,
    );
    if (error) {
      throw new InternalServerErrorException(error);
    }
    return data;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.scamReportsService.remove(+id);
  }
}
