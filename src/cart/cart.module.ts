import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { Place } from 'src/place/entities/place.entity';
import { authMiddleware } from 'src/auth/auth.middleware';
import { User } from 'src/user/entities/user.entity';
import { AuthModule } from 'src/auth/auth.module';
import { authOptionMiddleware } from 'src/auth/auth-option.middleware';

@Module({
  imports: [TypeOrmModule.forFeature([Cart, Place, User]), AuthModule],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})

export class CartModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(authMiddleware).forRoutes(
      { path: 'carts/:placeId', method: RequestMethod.POST },
      { path: 'carts/:placeId', method: RequestMethod.DELETE },
    );

    consumer.apply(authOptionMiddleware).forRoutes(
      { path: 'carts/:userId', method: RequestMethod.GET },
    );
  }
}
