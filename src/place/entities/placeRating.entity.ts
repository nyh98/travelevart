import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Place } from './place.entity';
import { User } from 'src/user/entities/user.entity';

enum RatingValue {
  ZERO = 0,
  ONE = 1,
  TWO = 2,
  THREE = 3,
  FOUR = 4,
  FIVE = 5,
}

@Entity('place_rating')
export class PlaceRating {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Place, (place) => place.rating)
  @JoinColumn({ name: 'placeId' })
  place: Place;

  @Column()
  placeId: number;

  @ManyToOne(() => User, (user) => user.placeRating)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @Column({ type: 'enum', enum: RatingValue })
  ratingValue: RatingValue;
}
