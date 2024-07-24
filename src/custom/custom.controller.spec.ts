import { Test, TestingModule } from '@nestjs/testing';
import { CustomController } from './custom.controller';
import { CustomService } from './custom.service';

describe('CustomController', () => {
  let controller: CustomController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomController],
      providers: [CustomService],
    }).compile();

    controller = module.get<CustomController>(CustomController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
