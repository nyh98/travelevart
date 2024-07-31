import { MiddlewareConsumer, Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { Place } from 'src/place/entities/place.entity';
import { authMiddleware } from 'src/auth/auth.middleware';
import { User } from 'src/user/entities/user.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Cart, Place, User]),
  AuthModule,
  ],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule {
  configure(consumer: MiddlewareConsumer) {
  consumer
    .apply(authMiddleware)
    .forRoutes(CartController);
  }
}
