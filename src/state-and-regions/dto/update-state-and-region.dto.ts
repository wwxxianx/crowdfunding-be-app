import { PartialType } from '@nestjs/mapped-types';
import { CreateStateAndRegionDto } from './create-state-and-region.dto';

export class UpdateStateAndRegionDto extends PartialType(CreateStateAndRegionDto) {}
