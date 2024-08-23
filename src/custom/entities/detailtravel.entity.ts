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
import { Postcontent } from 'src/post/entities/postcontent.entity';

@Entity('detailtravel')
export class DetailTravel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  travelrouteId: number;

  @Column({ nullable: true })
  placeId: number;

  @Column({ nullable: true })
  routeIndex: number;  // 기존 count 컬럼 대체

  @Column({ nullable: true })
  regionId: number;

  @Column({type: 'date'})
  date: Date;

  @Column({ nullable: true })
  contents: string;

  @Column({ nullable: true })
  transportOption: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  placeTitle: string;

  @Column({ nullable: true })
  placeImage: string;

  @Column({ nullable: true })
  mapLink: string;

  @ManyToOne(() => TravelRoute, (travelRoute) => travelRoute.detailTravels, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'travelrouteId' })
  travelRoute: TravelRoute;

  @ManyToOne(() => Place, (place) => place.detailTravel)
  @JoinColumn({ name: 'placeId' })
  place: Place;

  @ManyToOne(() => Region, (region) => region.detailTravels)
  @JoinColumn({ name: 'regionId' })
  region: Region;

  @OneToMany(() => Diary, (diary) => diary.detailTravel)
  diaries: Diary[];

  @OneToMany(() => Postcontent, (postcontent) => postcontent.detailTravel)
  postcontents: Postcontent[];
}
