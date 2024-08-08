import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('event')
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('datetime', { name: 'start_day' })
  startDay: Date;

  @Column('datetime', { name: 'end_day' })
  endDay: Date;

  @Column()
  title: string;

  @Column()
  region: string;

  @Column()
  image: string;

  @Column()
  summary: string;

  @Column('text', { name: 'detail_info' })
  detailInfo: string;

  @Column('text', { name: 'event_info' })
  eventInfo: string;

  @Column()
  tel: string;

  @Column()
  address: string;

  @Column({ name: 'event_address' })
  eventAddress: string;

  @Column()
  site: string;

  @Column()
  price: string;

  @Column()
  host: string;

  @Column({ name: 'view_count', default: 0 })
  viewCount: number;
}
