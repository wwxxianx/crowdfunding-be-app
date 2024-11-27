import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { StorageModule } from 'src/storage/storage.module';
import { TaxReceiptGenerator } from 'src/common/utils/tax-generator';

@Module({
  imports: [StorageModule],
  controllers: [UsersController],
  providers: [UsersService, TaxReceiptGenerator],
})
export class UsersModule {}
