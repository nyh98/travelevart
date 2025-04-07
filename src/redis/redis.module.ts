// import { Global, Module } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { Redis } from 'ioredis';
// import { RedisService } from './redis.service';

// @Global()
// @Module({
//   providers: [
//     {
//       provide: 'REDIS_CLIENT',
//       useFactory: (configService: ConfigService) => {
//         const host = configService.get<string>('REDIS_HOST', 'localhost');
//         const port = configService.get<number>('REDIS_PORT', 6379);

//         return new Redis(port, host, {
//           retryStrategy: (time) => time + 30000000, // redis 재연결 시도 시간 설정
//         });
//       },
//         inject: [ConfigService],
//     },
//     RedisService,
//   ],
//   exports: [RedisService],
// })
// export class RedisModule {}
