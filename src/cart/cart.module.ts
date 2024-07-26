import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { Place } from 'src/place/entities/place.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cart, Place])],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule {}
