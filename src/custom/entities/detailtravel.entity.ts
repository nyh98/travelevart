import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Diary } from '../../diary/entities/diary.entity';
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
  routeIndex: number;  // 기존 count 컬럼 대체

  @Column()
  region_id: number;

  @Column({type: 'date'})
  date: Date;

  @Column({ nullable: true })
  contents: string;

  @Column()
  transportOption: string;

  @Column()
  address: string;

  @Column()
  placeTitle: string;

  @Column()
  placeImage: string;

  @Column({ nullable: true })
  mapLink: string;

  @ManyToOne(() => TravelRoute, (travelRoute) => travelRoute.detailTravels, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'travelroute_id' })
  travelRoute: TravelRoute;

  @ManyToOne(() => Place, (place) => place.detailTravel)
  @JoinColumn({ name: 'place_id' })
  place: Place;

  @ManyToOne(() => Region, (region) => region.detailTravels)
  @JoinColumn({ name: 'region_id' })
  region: Region;

  @OneToMany(() => Diary, (diary) => diary.detailTravel)
  diaries: Diary[];
}
