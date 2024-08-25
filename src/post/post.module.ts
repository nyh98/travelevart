import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Postlike } from './entities/postlike.entity';
import { User } from 'src/user/entities/user.entity';
import { authMiddleware } from 'src/auth/auth.middleware';
import { AuthModule } from 'src/auth/auth.module';
import { Comment } from 'src/comment/entities/comment.entity'
import { RedisModule } from 'src/redis/redis.module';
import { Postcontent } from './entities/postcontent.entity';
import { TravelRoute } from 'src/custom/entities/travelroute.entity';
import { S3Module } from 'src/s3/s3.module';
import { Alert } from 'src/alert/entities/alert.entity';
import { AlertModule } from 'src/alert/alert.module';
import { authOptionMiddleware } from 'src/auth/auth-option.middleware';

@Module({
  imports: [TypeOrmModule.forFeature([Alert, Post, Postlike, User, Comment, Postcontent, TravelRoute]), S3Module, AuthModule, RedisModule, AlertModule],
  controllers: [PostController],
  providers: [PostService],
  exports: [PostService],
})
export class PostModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(authMiddleware)
      .forRoutes(
        { path: 'posts', method: RequestMethod.POST },
        { path: 'posts/:id', method: RequestMethod.PATCH },
        { path: 'posts/:id', method: RequestMethod.DELETE },
        { path: 'posts/:id/likes', method: RequestMethod.POST },
        { path: 'posts/:id/likes', method: RequestMethod.DELETE },
        { path: 'posts/my', method: RequestMethod.GET },
      );
    consumer
      .apply(authOptionMiddleware)
      .forRoutes(
        { path: 'posts', method: RequestMethod.GET },
        { path: 'posts/popular', method: RequestMethod.GET },
        { path: 'posts/:id', method: RequestMethod.GET },
      );
  }
}
