import { Test, TestingModule } from '@nestjs/testing';
import { CheersController } from './cheers.controller';

describe('CheersController', () => {
  let controller: CheersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CheersController],
    }).compile();

    controller = module.get<CheersController>(CheersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
