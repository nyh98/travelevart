import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('increment', { unsigned: true })
  id: number;

  @Column()
  profile_img: string;

  @Column()
  provider: string;

  @Column({ unique: true })
  user_name: string;

  @Column({ type: 'tinyint', default: 0 })
  role: number;
}
