import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { DetailTravel } from 'src/custom/entities/detailtravel.entity';
import { TravelRoute } from 'src/custom/entities/travelroute.entity';

@Entity('diary')
export class Diary {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  travelrouteId: number;

  @Column()
  detailtravelId: number;

  @Column({default: 0})
  diaryImage: string;

  @ManyToOne(() => User, (user) => user.diaries)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => DetailTravel, (detailTravel) => detailTravel.diaries)
  @JoinColumn({ name: 'detailtravelId' })
  detailTravel: DetailTravel;

  @ManyToOne(() => TravelRoute, (travelRoute) => travelRoute.diaries, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'travelrouteId' })
  travelRoute: TravelRoute;

  @Column('text')
  contents: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  diaryTime: Date;

  @Column({
    type: 'tinyint',
    default: 0,
  })
  diaryRange: number;
}
