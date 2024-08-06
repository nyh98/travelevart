import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Place } from './place.entity';
import { DetailTravel } from 'src/custom/entities/detailtravel.entity';

@Entity('region')
export class Region {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  region: string;

  @OneToMany(() => Place, (place) => place.region)
  places: Place[];

  @OneToMany(() => DetailTravel, (detailTravel) => detailTravel.region)
  detailTravels: DetailTravel[];
}
