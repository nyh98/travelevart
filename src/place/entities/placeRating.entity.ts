import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Check,
} from 'typeorm';
import { Place } from './place.entity';
import { User } from 'src/user/entities/user.entity';

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

  @Column({ type: 'tinyint' })
  ratingValue: number;
}
