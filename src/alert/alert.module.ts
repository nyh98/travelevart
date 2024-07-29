import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AlertService } from './alert.service';
import { AlertController } from './alert.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { Postlike } from 'src/post/entities/postlike.entity';
import { Comment } from 'src/comment/entities/comment.entity';
import { User } from 'src/user/entities/user.entity';
import { authMiddleware } from 'src/auth/auth.middleware';
import { Post } from 'src/post/entities/post.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Postlike, Comment, User, Post]), AuthModule],
  controllers: [AlertController],
  providers: [AlertService],
})
export class AlertModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(authMiddleware)
      .exclude()
      .forRoutes(AlertController);
  }
}
