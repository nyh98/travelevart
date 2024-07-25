import { Place } from 'src/place/entities/place.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity()
export class Cart {
  @PrimaryGeneratedColumn()
  cart_id: string;

  @Column()
  user_id: string;

  @ManyToOne(() => Place)
  @JoinColumn({ name: 'place_id' })
  place: Place;
}
