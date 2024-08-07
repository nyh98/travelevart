import { Cart } from 'src/cart/entities/cart.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Region } from './region.entity';
import { PlaceRating } from './placeRating.entity';
import { DetailTravel } from 'src/custom/entities/detailtravel.entity';

@Entity('place')
export class Place {
  @PrimaryGeneratedColumn()
  placeId: number;

  @Column()
  address: string;

  @Column({ nullable: true })
  image: string;

  @Column()
  title: string;

  @Column('tinyint', { width: 1, default: 0 })
  event: number;

  @Column('decimal', { precision: 13, scale: 10 })
  mapx: number;

  @Column('decimal', { precision: 12, scale: 10 })
  mapy: number;

  @Column('text', { nullable: true })
  descreiption: string;

  @Column({ name: 'view_count', default: 0 })
  viewCount: number;

  @OneToMany(() => Cart, (cart) => cart.place)
  carts: Cart[];

  @ManyToOne(() => Region, (region) => region.places)
  @JoinColumn({ name: 'regionId' })
  region: Region;

  @Column()
  regionId: number;

  @OneToMany(() => PlaceRating, (placeRating) => placeRating.place)
  rating: PlaceRating[];

  @OneToMany(() => DetailTravel, (detailTravel) => detailTravel.place)
  detailTravel: DetailTravel[];
}
