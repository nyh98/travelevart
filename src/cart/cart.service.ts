import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { Place } from 'src/place/entities/place.entity';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(Place)
    private placeRepository: Repository<Place>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async addCart(placeId: string, userId: number): Promise<void> {
    const place = await this.placeRepository.findOne({ where: { id: +placeId } });
    if (!place) {
      throw new NotFoundException('없는 장소 입니다.');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('없는 사용자 입니다.');
    }

    const existingCartItem = await this.cartRepository.findOne({ where: { place: { id: +placeId }, user: { id: userId } } });
    if (existingCartItem) {
      throw new ConflictException('이미 찜한 장소입니다.');
    }

    const cartItem = new Cart();
    cartItem.place = place;
    cartItem.user = user;

    try {
      await this.cartRepository.save(cartItem);
    } catch (error) {
      throw new InternalServerErrorException('찜하기 실패.');
    }
  }

  async removeCart(placeId: string, userId: number) {
    const cartItem = await this.cartRepository.findOne({ where: { place: { id: +placeId }, user: { id: userId } } });
    if (!cartItem) {
      throw new NotFoundException('이미 삭제한 목록입니다.');
    }

    try {
      await this.cartRepository.delete(cartItem);
    } catch (error) {
      throw new InternalServerErrorException('찜 취소하기 실패');
    }
  }

  async getAllCartItems(userId: number): Promise<any[]> {
    const cartItems = await this.cartRepository.find({
      where: { user: { id: userId } },
      relations: ['place'],
    });

    if (!cartItems.length) {
      throw new NotFoundException('존재하지 않는 목록입니다.');
    }

    return cartItems.map(cartItem => {
      const { cart_id, place } = cartItem;

      return {
        cart_id,
        place: {
          placeId: place.id,
          address: place.address,
          image: place.image,
          title: place.title,
          event: place.event,
          region: place.region
        },
      };
    });
  }
}
