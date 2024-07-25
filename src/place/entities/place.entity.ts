import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Place {
  @PrimaryGeneratedColumn()
  placeId: number;

  @Column()
  address: string;

  @Column()
  image: string;

  @Column()
  title: string;

  @Column()
  event: number;
}
