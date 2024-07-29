import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { DetailTravel } from 'src/custom/entities/detailtravel.entity';
import { CustomTravel } from 'src/custom/entities/customtravel.entity';

@Entity('diary')
export class Diary {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column()
  customtravel_id: number;

  @Column()
  detailtravel_id: number;

  @ManyToOne(() => User, user => user.diaries)
  @JoinColumn({ name: 'user_id'})
  user: User;

  @ManyToOne(() => DetailTravel, detailTravel => detailTravel.diaries)
  @JoinColumn({ name: 'detailtravel_id'})
  detailTravel: DetailTravel;

  @ManyToOne(() => CustomTravel, customTravel => customTravel.diaries)
  @JoinColumn({ name: 'customtravel_id'})
  customTravel: CustomTravel;

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
