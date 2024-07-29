import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Diary } from '../../diary/entities/diary.entity';

@Entity('customtravel')
export class CustomTravel {
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
  custom_range: number;

  @Column()
  name: string;

  @OneToMany(() => Diary, diary => diary.customTravel)
  diaries: Diary[];
}
