import { Test, TestingModule } from '@nestjs/testing';
import { StateAndRegionsController } from '../state-and-regions.controller';
import { StateAndRegionsService } from '../state-and-regions.service';

describe('StateAndRegionsController', () => {
  let controller: StateAndRegionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StateAndRegionsController],
      providers: [StateAndRegionsService],
    }).compile();

    controller = module.get<StateAndRegionsController>(
      StateAndRegionsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
