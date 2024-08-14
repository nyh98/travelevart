import { Controller, Get } from '@nestjs/common';

@Controller('healthcheck')
export class HealthCheckController {
  @Get()
  check(): string {
    return 'OK';
  }
}