import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { Place } from 'src/place/entities/place.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(Place)
    private placeRepository: Repository<Place>,
  ) {}
  async addCart(placeId: string): Promise<void> {
    const place = await this.placeRepository.findOne({ where: { placeId: +placeId } });
    if (!place) {
      throw new NotFoundException('없는 장소 입니다.');
    }

    const existingCartItem = await this.cartRepository.findOne({ where: { place: { placeId: +placeId } } });
    if (existingCartItem) {
      throw new ConflictException('이미 찜한 장소입니다.');
    }

    const cartItem = new Cart();
    cartItem.place = place;

    try {
      await this.cartRepository.save(cartItem);
    } catch (error) {
      throw new InternalServerErrorException('찜하기 실패.');
    }
  }
  async removeCart(placeId: string) {
    const cartItem = await this.cartRepository.findOne({ where: { place: { placeId: +placeId }} });
    if (!cartItem) {
      throw new NotFoundException('이미 삭제한 목록입니다.');
    }

    try {
      await this.cartRepository.delete(cartItem);
    } catch (error) {
      throw new InternalServerErrorException('찜 취소하기 실패');
    }
  }

  async getCartDetails(placeId: string): Promise<any> {
    const cartItem = await this.cartRepository.findOne({
      where: { place: { placeId: +placeId } },
      relations: ['place'],
    });

    if (!cartItem) {
      throw new NotFoundException('존재하지 않는 목록입니다.');
    }

    const { cart_id, place } = cartItem;

    return {
      cart_id,
      place: {
        placeId: place.placeId,
        address: place.address,
        image: place.image,
        title: place.title,
        event: place.event,
      },
    };
  }

  async getAllCartItems(): Promise<any[]> {
    const cartItems = await this.cartRepository.find({ relations: ['place'] });

    return cartItems.map(cartItem => ({
      cart_id: cartItem.cart_id,
      placeId: cartItem.place.placeId,
    }));
  }
}
