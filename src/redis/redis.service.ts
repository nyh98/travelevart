import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService {
  constructor(@Inject('REDIS_CLIENT') private redis: Redis) {}

  async setRefreshToken(key: string, valie: string, time: number) {
    await this.redis.set(key, valie, 'EX', time);
  }

  async getRefreshToken(userId: number) {
    return await this.redis.get(userId.toString());
  }

  async deleteRefreshToken(userId: number) {
    return await this.redis.del(userId.toString());
  }
}
