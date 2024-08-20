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
import { TravelRoute } from 'src/custom/entities/travelroute.entity';
import { Alert } from './entities/alert.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Alert, Postlike, Comment, User, Post, TravelRoute]), AuthModule],
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