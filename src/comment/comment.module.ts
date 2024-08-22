import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { AuthModule } from 'src/auth/auth.module';
import { authMiddleware } from 'src/auth/auth.middleware';
import { User } from 'src/user/entities/user.entity';
import { Post } from 'src/post/entities/post.entity';
import { Alert } from 'src/alert/entities/alert.entity';
import { AlertModule } from 'src/alert/alert.module';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, User, Post, Alert]), AuthModule, AlertModule],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(authMiddleware)
      .exclude(
        { path: 'comments/:postId', method: RequestMethod.GET },        
      )
      .forRoutes(CommentController);
  }
}
