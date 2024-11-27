import { Module } from '@nestjs/common';
import { DonationsService } from './donations.service';
import { DonationsController } from './donations.controller';
import { StripeModule } from 'src/stripe/stripe.module';

@Module({
  imports: [StripeModule.forRootAsync()],
  controllers: [DonationsController],
  providers: [DonationsService],
})
export class DonationsModule {}
