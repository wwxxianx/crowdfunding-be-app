import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  InternalServerErrorException,
} from '@nestjs/common';
import { StateAndRegionsService } from './state-and-regions.service';
import { CreateStateAndRegionDto } from './dto/create-state-and-region.dto';
import { UpdateStateAndRegionDto } from './dto/update-state-and-region.dto';

@Controller('state-and-regions')
export class StateAndRegionsController {
  constructor(
    private readonly stateAndRegionsService: StateAndRegionsService,
  ) {}

  // @Post()
  // create(@Body() createStateAndRegionDto: CreateStateAndRegionDto) {
  //   return this.stateAndRegionsService.create(createStateAndRegionDto);
  // }

  @Get()
  async findAll() {
    const { data, error } = await this.stateAndRegionsService.findAll();
    if (error) {
      throw new InternalServerErrorException(error);
    }

    return data;
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.stateAndRegionsService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateStateAndRegionDto: UpdateStateAndRegionDto) {
  //   return this.stateAndRegionsService.update(+id, updateStateAndRegionDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.stateAndRegionsService.remove(+id);
  // }
}
