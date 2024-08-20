import { Module, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TravelRoute } from './entities/travelroute.entity';
import { DetailTravel } from './entities/detailtravel.entity';
import { User } from 'src/user/entities/user.entity';
import { Place } from 'src/place/entities/place.entity';
import { Region } from 'src/place/entities/region.entity';
import { AuthModule } from 'src/auth/auth.module';
import { TravelRouteController } from './custom.controller';
import { TravelRouteService } from './custom.service';
import { authMiddleware } from 'src/auth/auth.middleware';
import { Post } from 'src/post/entities/post.entity';
import { Alert } from 'src/alert/entities/alert.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Alert ,TravelRoute, DetailTravel, User, Place, Region, Post, Alert]),
    AuthModule
  ],
  controllers: [TravelRouteController],
  providers: [TravelRouteService],
})
export class TravelRouteModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(authMiddleware).forRoutes(TravelRouteController);
  }
}
