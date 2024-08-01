import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);
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

  // 인기 여행게시판 캐시 관리
  async setPopularTravelPostsCache(value: string, ttl: number) {
    const cacheKey = 'popularTravelPosts';
    this.logger.debug(`인기 여행게시판 캐시 저장: ${cacheKey}`);
    await this.redis.set(cacheKey, value, 'EX', ttl);
  }

  async getPopularTravelPostsCache(): Promise<string | null> {
    const cacheKey = 'popularTravelPosts';
    this.logger.debug(`인기 여행게시판 캐시 호출: ${cacheKey}`);
    return await this.redis.get(cacheKey);
  }

  async deletePopularTravelPostsCache() {
    const cacheKey = 'popularTravelPosts';
    this.logger.debug(`인기 여행게시판 캐시 삭제: ${cacheKey}`);
    await this.redis.del(cacheKey);
  }

  // 인기 자유게시판 캐시 관리
  async setPopularNormalPostsCache(value: string, ttl: number) {
    const cacheKey = 'popularNormalPosts';
    this.logger.debug(`인기 자유게시판 캐시 저장: ${cacheKey}`);
    await this.redis.set(cacheKey, value, 'EX', ttl);
  }

  async getPopularNormalPostsCache(): Promise<string | null> {
    const cacheKey = 'popularNormalPosts';
    this.logger.debug(`인기 자유게시판 캐시 호출: ${cacheKey}`);
    return await this.redis.get(cacheKey);
  }

  async deletePopularNormalPostsCache() {
    const cacheKey = 'popularNormalPosts';
    this.logger.debug(`인기 자유게시판 캐시 삭제: ${cacheKey}`);
    await this.redis.del(cacheKey);
  }
}
