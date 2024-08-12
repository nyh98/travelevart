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

  @Column()
  date: Date;

  @Column()
  playTime: string;  // 기존 time 컬럼 대체

  @Column({ nullable: true })
  contents: string;

  @Column()
  transportOption: string;  // 기존 traffic_info 컬럼 대체

  @Column({ nullable: true })
  starting_point: string;

  @Column()
  detailtravel_image: string;

  @Column()
  address: string;  // 새로운 컬럼 추가

  @Column()
  placeTitle: string;  // 새로운 컬럼 추가

  @Column()
  placeImage: string;  // 새로운 컬럼 추가

  @Column()
  day: number;  // 새로운 컬럼 추가

  @Column({ nullable: true })
  mapLink: string;  // 새로운 컬럼 추가

  @Column({ nullable: true })
  accommodation_day: number;  // 새로운 숙소 관련 컬럼 추가

  @Column({ nullable: true })
  accommodation_address: string;  // 새로운 숙소 관련 컬럼 추가

  @Column({ nullable: true })
  accommodation_title: string;  // 새로운 숙소 관련 컬럼 추가

  @Column({ nullable: true })
  accommodation_reservationLink: string;  // 새로운 숙소 관련 컬럼 추가

  @ManyToOne(() => TravelRoute, (travelRoute) => travelRoute.detailTravels)
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
