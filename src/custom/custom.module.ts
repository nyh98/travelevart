import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
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
import { AlertModule } from 'src/alert/alert.module';
import { authOptionMiddleware } from 'src/auth/auth-option.middleware';

@Module({
  imports: [
    TypeOrmModule.forFeature([Alert ,TravelRoute, DetailTravel, User, Place, Region, Post, Alert]),
    AuthModule,
    AlertModule
  ],
  controllers: [TravelRouteController],
  providers: [TravelRouteService],
})
export class TravelRouteModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
    .apply(authMiddleware)
    .forRoutes(
      { path: 'travelroutes/:userId', method: RequestMethod.GET },
      { path: 'travelroutes/:travelrouteId', method: RequestMethod.PATCH },
      { path: 'travelroutes/:travelrouteId/details', method: RequestMethod.PATCH },
      { path: 'travelroutes/:travelrouteId', method: RequestMethod.DELETE },
      { path: 'travelroutes/:travelrouteId/details', method: RequestMethod.DELETE },
      { path: 'travelroutes/:travelrouteId/details', method: RequestMethod.POST },
      { path: 'travelroutes/:travelrouteId/recommendation', method: RequestMethod.POST },
      { path: 'travelroutes/fork/:postId', method: RequestMethod.POST },
      { path: 'travelroutes', method: RequestMethod.POST },
      
    );

    consumer
    .apply(authOptionMiddleware)
    .forRoutes(
      { path: 'travelroutes/:travelrouteId/details', method: RequestMethod.GET },
    ) 
  }
  
}
