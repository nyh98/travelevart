import { Cart } from 'src/cart/entities/cart.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity()
export class Place {
  @PrimaryGeneratedColumn()
  placeId: number;

  @Column()
  address: string;

  @Column()
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

  @Column()
  region: string;

  @OneToMany(() => Cart, cart => cart.place)
  carts: Cart[];
}
