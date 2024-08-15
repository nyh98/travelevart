import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Diary } from '../../diary/entities/diary.entity';
import { User } from 'src/user/entities/user.entity';
import { DetailTravel } from './detailtravel.entity';
import { Post } from 'src/post/entities/post.entity';
import { Fork } from './fork.entity';

@Entity('travelroute')
export class TravelRoute {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;
  
  @Column()
  travelName: string;
  
  @Column({
    type: 'tinyint',
    default: 0,
  })
  travelrouteRange: number;

  @Column({type: 'date'})
  startDate: Date;
  
  @Column({type: 'date'})
  endDate: Date;

  @ManyToOne(() => User, (user) => user.travelRoutes)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => DetailTravel, (detailTravel) => detailTravel.travelRoute)
  detailTravels: DetailTravel[];

  @OneToMany(() => Diary, (diary) => diary.travelRoute)
  diaries: Diary[];

  @OneToMany(()=> Post, (post) => post.travelRoute)
  post: Post[];

}
