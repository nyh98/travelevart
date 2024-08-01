import { Test, TestingModule } from '@nestjs/testing';
import { ForkController } from './fork.controller';
import { ForkService } from './fork.service';

describe('ForkController', () => {
  let controller: ForkController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ForkController],
      providers: [ForkService],
    }).compile();

    controller = module.get<ForkController>(ForkController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
