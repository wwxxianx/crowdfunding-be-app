import { Module } from '@nestjs/common';
import { ScamReportsService } from './scam-reports.service';
import { ScamReportsController } from './scam-reports.controller';
import { StorageModule } from 'src/storage/storage.module';

@Module({
  imports: [StorageModule],
  controllers: [ScamReportsController],
  providers: [ScamReportsService],
})
export class ScamReportsModule {}
