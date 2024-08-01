import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Region {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  region: string;
}
