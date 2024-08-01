import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { DetailTravel } from 'src/custom/entities/detailtravel.entity';
import { TravelRoute } from 'src/custom/entities/travelroute.entity';

@Entity('diary')
export class Diary {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column()
  travelroute_id: number;

  @Column()
  detailtravel_id: number;

  @ManyToOne(() => User, user => user.diaries)
  @JoinColumn({ name: 'user_id'})
  user: User;

  @ManyToOne(() => DetailTravel, detailTravel => detailTravel.diaries)
  @JoinColumn({ name: 'detailtravel_id'})
  detailTravel: DetailTravel;

  @ManyToOne(() => TravelRoute, travelRoute => travelRoute.diaries)
  @JoinColumn({ name: 'travelroute_id'})
  travelRoute: TravelRoute;

  @Column('text')
  contents: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  diary_time: Date;

  @Column({
    type: 'tinyint',
    default: 0,
  })
  diary_range: number;
}
