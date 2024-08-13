import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Post } from '../../post/entities/post.entity';
import { TravelRoute } from './travelroute.entity';

@Entity('fork')
export class Fork {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  post_id: number;

  @Column()
  user_id: number;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  forked_at: Date;

  @ManyToOne(() => User, user => user.forks)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Post, post => post.forks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: Post;

}
