import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Diary } from '../../diary/entities/diary.entity';
import internal from 'stream';

@Entity('detailtravel')
export class DetailTravel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  custom_id: string;
  
  @Column()
  place_id: string;
  
  @Column()
  count: number;

  @Column({
    default: null,
  })
  date: Date;

  @Column({
    default: 0,
  })
  time: string;

  @Column({
    default: 0,
  })
  contents: string;

  @Column({
    default: 0,
  })
  traffic_info: string;

  @Column()
  starting_point: string;


  @OneToMany(() => Diary, diary => diary.detailTravel)
  diaries: Diary[];
}
