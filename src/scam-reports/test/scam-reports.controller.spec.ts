import { Test, TestingModule } from '@nestjs/testing';
import { ScamReportsController } from '../scam-reports.controller';
import { ScamReportsService } from '../scam-reports.service';

describe('ScamReportsController', () => {
  let controller: ScamReportsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScamReportsController],
      providers: [ScamReportsService],
    }).compile();

    controller = module.get<ScamReportsController>(ScamReportsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
