import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Fork } from './entities/fork.entity';
import { ForkService } from './fork.service';
import { ForkController } from './fork.controller';
import { authMiddleware } from 'src/auth/auth.middleware';
import { User } from 'src/user/entities/user.entity';
import { Post } from 'src/post/entities/post.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Fork, Post, User]),
  AuthModule
  ],
  controllers: [ForkController],
  providers: [ForkService],
})
export class ForkModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(authMiddleware)
      .forRoutes(ForkController);
  }
}
