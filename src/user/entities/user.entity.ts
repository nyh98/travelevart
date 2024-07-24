import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('increment', { unsigned: true })
  id: number;

  @Column()
  profile_img: string;

  @Column('varchar', { length: 100 })
  provider: string;

  @Column('varchar', { unique: true, length: 100 })
  user_name: string;

  @Column()
  uid: string;

  @Column({ type: 'tinyint', default: 0, width: 1 })
  role: number;
}
