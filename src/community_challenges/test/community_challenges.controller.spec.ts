import { Test, TestingModule } from '@nestjs/testing';
import { CommunityChallengesController } from '../community_challenges.controller';
import { CommunityChallengesService } from '../community_challenges.service';

describe('CommunityChallengesController', () => {
  let controller: CommunityChallengesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommunityChallengesController],
      providers: [CommunityChallengesService],
    }).compile();

    controller = module.get<CommunityChallengesController>(
      CommunityChallengesController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
