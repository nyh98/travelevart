import { Global, Module } from '@nestjs/common';
import { Redis } from 'ioredis';
import { RedisService } from './redis.service';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: () =>
        new Redis(6379, 'travelevart-backend-redis-1', {
          retryStrategy: (time) => time + 30000000, //redis 재연결 시도 임시로 겁나 늘려놓았음
        }),
    },
    RedisService,
  ],
  exports: [RedisService],
})
export class RedisModule {}
