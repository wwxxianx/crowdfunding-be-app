import { Injectable } from '@nestjs/common';
import { CreateScamReportDto } from './dto/create-scam-report.dto';
import { UpdateScamReportDto } from './dto/update-scam-report.dto';
import { PrismaService } from 'src/common/data/prisma.service';
import { StorageService } from 'src/storage/storage.service';
import { storageConstants } from 'src/common/constants/constants';
import { ScamReport } from '@prisma/client';

@Injectable()
export class ScamReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async create(
    userId: string,
    createScamReportDto: CreateScamReportDto,
    evidenceImageFiles?: Express.Multer.File[],
    documentFiles?: Express.Multer.File[],
  ): Promise<Result<ScamReport>> {
    try {
      let evidenceImageUrls = [];
      let documentUrls = [];
      console.log(createScamReportDto);
      console.log('document files: ', documentFiles);
      if (evidenceImageFiles) {
        for (const evidenceImage of evidenceImageFiles) {
          const filePath = `${createScamReportDto.campaignId}/images/${evidenceImage.originalname}`;
          const { data, error } = await this.storageService.uploadFile(
            storageConstants.SCAM_REPORT_BUCKET,
            filePath,
            evidenceImage.buffer,
            evidenceImage.mimetype,
          );
          if (error) {
            return { data: null, error: 'Failed to upload evidence image' };
          }
          evidenceImageUrls.push(data.publicUrl);
        }
      }
  
      if (documentFiles) {
        for (const document of documentFiles) {
          const filePath = `${createScamReportDto.campaignId}/documents/${document.originalname}`;
          const { data, error } = await this.storageService.uploadFile(
            storageConstants.SCAM_REPORT_BUCKET,
            filePath,
            document.buffer,
            document.mimetype,
          );
          if (error) {
            return { data: null, error: 'Failed to upload document' };
          }
          documentUrls.push(data.publicUrl);
        }
      }
      const scamReport = await this.prisma.scamReport.create({
        data: {
          userId: userId,
          campaignId: createScamReportDto.campaignId,
          description: createScamReportDto.description,
          evidenceUrls: evidenceImageUrls ?? undefined,
          documentUrls: documentUrls ?? undefined,
        },
      });
      return { data: scamReport, error: null };
    } catch (e) {
      return { data: null, error: 'Failed to create scam report' };
    }
  }

  async findAll(): Promise<Result<ScamReport[]>> {
    try {
      const scamReports = await this.prisma.scamReport.findMany({
        include: {
          user: true,
          campaign: true,
        },
      });
      return { data: scamReports, error: null };
    } catch (e) {
      return { data: null, error: 'Failed to fetch reports' };
    }
  }

  async findOne(id: string): Promise<Result<ScamReport>> {
    try {
      const scamReport = await this.prisma.scamReport.findUnique({
        where: {
          id: id,
        },
        include: {
          user: true,
          campaign: true,
        },
      });
      return { data: scamReport, error: null };
    } catch (e) {
      return { data: null, error: 'Failed to fetch report details' };
    }
  }

  async update(
    id: string,
    updateScamReportDto: UpdateScamReportDto,
  ): Promise<Result<ScamReport>> {
    try {
      const scamReport = await this.prisma.scamReport.update({
        where: {
          id: id,
        },
        data: {
          resolution: updateScamReportDto.resolution ?? undefined,
          resolvedAt: updateScamReportDto.resolution ? new Date() : undefined,
          status: updateScamReportDto.status ?? undefined,
        },
        include: {
          user: true,
          campaign: true,
        },
      });
      return { data: scamReport, error: null };
    } catch (e) {
      return { data: null, error: 'Failed to update report' };
    }
  }

  remove(id: number) {
    return `This action removes a #${id} scamReport`;
  }
}
