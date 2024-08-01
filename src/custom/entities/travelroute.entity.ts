import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Diary } from '../../diary/entities/diary.entity';

@Entity('travelroute')
export class TravelRoute {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: string;
  
  @Column()
  travel_name: string;
  
  @Column({
    type: 'tinyint',
    default: 0,
  })
  travelroute_range: number;

  @Column()
  name: string;

  @OneToMany(() => Diary, diary => diary.travelRoute)
  diaries: Diary[];
}
