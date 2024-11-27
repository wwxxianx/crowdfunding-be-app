// scam-reports/scam-reports.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/common/data/prisma.service';
import { StorageService } from 'src/storage/storage.service';
import { ScamReport } from '@prisma/client';
import { ScamReportsService } from '../scam-reports.service';
import { CreateScamReportDto } from '../dto/create-scam-report.dto';
import { prismaMock, storageMock } from 'src/test/mock';


describe('ScamReportsService', () => {
  let service: ScamReportsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScamReportsService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: StorageService,
          useValue: storageMock,
        },
      ],
    }).compile();

    service = module.get<ScamReportsService>(ScamReportsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a scam report with uploaded files', async () => {
      const createScamReportDto: CreateScamReportDto = {
        campaignId: '123',
        description: 'Test description',
      };

      const userId = 'user-123';
      const mockScamReport = {
        id: 'report-123',
        ...createScamReportDto,
        userId,
        evidenceUrls: ['evidence-url'],
        documentUrls: ['document-url'],
      } as ScamReport;

      storageMock.uploadFile.mockResolvedValue({
        data: { publicUrl: 'evidence-url' },
        error: null,
      });

      prismaMock.scamReport.create.mockResolvedValue(mockScamReport);

      const result = await service.create(
        userId,
        createScamReportDto,
        [{ originalname: 'image.png', buffer: Buffer.from(''), mimetype: 'image/png' } as Express.Multer.File],
        [{ originalname: 'document.pdf', buffer: Buffer.from(''), mimetype: 'application/pdf' } as Express.Multer.File],
      );

      expect(result.data).toEqual(mockScamReport);
      expect(result.error).toBeNull();
    });

    it('should handle upload errors', async () => {
      const createScamReportDto: CreateScamReportDto = {
        campaignId: '123',
        description: 'Test description',
      };

      const userId = 'user-123';

      storageMock.uploadFile.mockResolvedValue({
        data: null,
        error: 'Upload error',
      });

      const result = await service.create(
        userId,
        createScamReportDto,
        [{ originalname: 'image.png', buffer: Buffer.from(''), mimetype: 'image/png' } as Express.Multer.File],
        [{ originalname: 'document.pdf', buffer: Buffer.from(''), mimetype: 'application/pdf' } as Express.Multer.File],
      );

      expect(result.data).toBeNull();
      expect(result.error).toBe('Failed to upload evidence image');
    });
  });

  describe('findAll', () => {
    it('should return all scam reports', async () => {
      const mockScamReports = [
        { id: 'report-1', userId: 'user-1', campaignId: 'campaign-1', description: 'Test 1' },
        { id: 'report-2', userId: 'user-2', campaignId: 'campaign-2', description: 'Test 2' },
      ] as ScamReport[];

      prismaMock.scamReport.findMany.mockResolvedValue(mockScamReports);

      const result = await service.findAll();

      expect(result.data).toEqual(mockScamReports);
      expect(result.error).toBeNull();
    });

    it('should handle errors', async () => {
      prismaMock.scamReport.findMany.mockRejectedValue(new Error('Error'));

      const result = await service.findAll();

      expect(result.data).toBeNull();
      expect(result.error).toBe('Failed to fetch reports');
    });
  });

  describe('findOne', () => {
    it('should return a scam report by id', async () => {
      const mockScamReport = { id: 'report-1', userId: 'user-1', campaignId: 'campaign-1', description: 'Test 1' } as ScamReport;

      prismaMock.scamReport.findUnique.mockResolvedValue(mockScamReport);

      const result = await service.findOne('report-1');

      expect(result.data).toEqual(mockScamReport);
      expect(result.error).toBeNull();
    });

    it('should handle errors', async () => {
      prismaMock.scamReport.findUnique.mockRejectedValue(new Error('Error'));

      const result = await service.findOne('report-1');

      expect(result.data).toBeNull();
      expect(result.error).toBe('Failed to fetch report details');
    });
  });
});
