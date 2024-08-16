import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { TravelRoute } from './travelroute.entity';

@Entity('fork')
export class Fork {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  travelroute_id: number;

  @Column()
  user_id: number;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ default: false })
  check: boolean;

  @ManyToOne(() => User, user => user.forks)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => TravelRoute, travelroute => travelroute.fork, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'travelroute_id'})
  travelroute: TravelRoute;
}
