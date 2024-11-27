import { Module } from '@nestjs/common';
import { StateAndRegionsService } from './state-and-regions.service';
import { StateAndRegionsController } from './state-and-regions.controller';

@Module({
  controllers: [StateAndRegionsController],
  providers: [StateAndRegionsService],
})
export class StateAndRegionsModule {}
