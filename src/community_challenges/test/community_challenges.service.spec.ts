import { Test, TestingModule } from '@nestjs/testing';
import { CommunityChallengesService } from '../community_challenges.service';

describe('CommunityChallengesService', () => {
  let service: CommunityChallengesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CommunityChallengesService],
    }).compile();

    service = module.get<CommunityChallengesService>(
      CommunityChallengesService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
