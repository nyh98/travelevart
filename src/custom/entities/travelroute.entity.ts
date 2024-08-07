import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Diary } from '../../diary/entities/diary.entity';
import { User } from 'src/user/entities/user.entity';
import { DetailTravel } from './detailtravel.entity';
import { Post } from 'src/post/entities/post.entity';

@Entity('travelroute')
export class TravelRoute {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;
  
  @Column()
  travel_name: string;
  
  @Column({
    type: 'tinyint',
    default: 0,
  })
  travelroute_range: number;

  @ManyToOne(() => User, (user) => user.travelRoutes)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => DetailTravel, (detailTravel) => detailTravel.travelRoute)
  detailTravels: DetailTravel[];

  @OneToMany(() => Diary, (diary) => diary.travelRoute)
  diaries: Diary[];

  @OneToMany(()=> Post, (post) => post.travelRoute)
  post: Post[];
}
