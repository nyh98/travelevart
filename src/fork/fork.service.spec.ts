import { Test, TestingModule } from '@nestjs/testing';
import { ForkService } from './fork.service';

describe('ForkService', () => {
  let service: ForkService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ForkService],
    }).compile();

    service = module.get<ForkService>(ForkService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
