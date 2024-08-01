// src/diary/diary.module.ts

import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Diary } from './entities/diary.entity';
import { DiaryService } from './diary.service';
import { DiaryController } from './diary.controller';
import { authMiddleware } from '../auth/auth.middleware';
import { AuthModule } from '../auth/auth.module';
import { User } from 'src/user/entities/user.entity';
import { DetailTravel } from 'src/custom/entities/detailtravel.entity';
import { TravelRoute } from 'src/custom/entities/travelroute.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([Diary, User, DetailTravel, TravelRoute]),
    AuthModule,
  ],
  controllers: [DiaryController],
  providers: [DiaryService],
})
export class DiaryModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(authMiddleware)
      .forRoutes(DiaryController);
  }
}
