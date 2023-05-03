import { Test, TestingModule } from '@nestjs/testing';
import { BetsService } from './bets.service';

describe('BetsService', () => {
  let service: BetsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BetsService],
    }).compile();

    service = module.get<BetsService>(BetsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
