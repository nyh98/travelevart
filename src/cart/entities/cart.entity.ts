import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Place } from 'src/place/entities/place.entity';
import { User } from 'src/user/entities/user.entity';

@Entity('cart')
export class Cart {
  @PrimaryGeneratedColumn()
  cartId: number;

  @ManyToOne(() => Place, place => place.carts, { eager: true })
  @JoinColumn({ name: 'placeId' })
  place: Place;

  @Column()
  placeId: number;

  @ManyToOne(() => User, user => user.carts)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;
}
