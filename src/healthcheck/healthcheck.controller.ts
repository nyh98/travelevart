import { Controller, Get } from '@nestjs/common';

@Controller('healthcheck')
export class HealthCheckController {
  @Get()
  check(): string {
    console.log("여기다@@@@@@@@@@@@@@@@@@@");
    return 'OK';
  }
}