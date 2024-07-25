import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('increment', { unsigned: true })
  id: number;

  @Column({ nullable: true })
  profile_img: string | null;

  @Column('varchar', { length: 100 })
  provider: string;

  @Column('varchar', { length: 100 })
  user_name: string;

  @Column({ nullable: true })
  uid: string | null;

  @Column({ type: 'tinyint', default: 0, width: 1 })
  role: number;

  @Column({ nullable: true, unique: true })
  email: string | null;

  @Column({ nullable: true })
  password: string;
}
