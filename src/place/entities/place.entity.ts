import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Place {
  @PrimaryGeneratedColumn()
  placeId: number;

  @Column()
  address: string;

  @Column({ nullable: true })
  image: string;

  @Column()
  title: string;

  @Column('tinyint', { width: 1, default: 0 })
  event: number;

  @Column('decimal', { precision: 13, scale: 10 })
  mapx: number;

  @Column('decimal', { precision: 12, scale: 10 })
  mapy: number;

  @Column('text', { nullable: true })
  descreiption: string;

  @Column()
  region: string;
}