import { Test, TestingModule } from '@nestjs/testing';
import { CheersService } from './cheers.service';

describe('CheersService', () => {
  let service: CheersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CheersService],
    }).compile();

    service = module.get<CheersService>(CheersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
