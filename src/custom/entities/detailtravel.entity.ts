import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Diary } from '../../diary/entities/diary.entity';
import internal from 'stream';
import { TravelRoute } from './travelroute.entity';
import { Place } from 'src/place/entities/place.entity';
import { Region } from 'src/place/entities/region.entity';

@Entity('detailtravel')
export class DetailTravel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  travelroute_id: number;
  
  @Column()
  place_id: number;
  
  @Column()
  count: number;

  @Column()
  region_id: number;

  @Column()
  date: Date;

  @Column()
  time: string;

  @Column()
  contents: string;

  @Column()
  traffic_info: string;

  @Column()
  starting_point: string;

  @Column()
  detailtravel_image: string;

  @ManyToOne(() => TravelRoute, (travelRoute) => travelRoute.detailTravels)
  @JoinColumn({ name: 'travelroute_id' })
  travelRoute: TravelRoute;

  @ManyToOne(() => Place, (place) => place.detailTravel)
  @JoinColumn({ name: 'place_id' })
  place: Place;

  @ManyToOne(() => Region, (region) => region.detailTravels)
  @JoinColumn({ name: 'region_id' })
  region: Region;

  @OneToMany(() => Diary, diary => diary.detailTravel)
  diaries: Diary[];
}
