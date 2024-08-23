import { DetailTravel } from 'src/custom/entities/detailtravel.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Post } from './post.entity';

@Entity('postcontent')
export class Postcontent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  post_id: number;

  @Column()
  order: number;

  @Column({ type: 'text', nullable: true })
  contents: string;

  @Column({ length: 255, nullable: true })
  contents_img: string;

  @Column({ nullable: true })
  detailtravel_id: number;  // DetailTravel ID를 저장할 필드

  @ManyToOne(() => Post, (post) => post.postContents,  { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @ManyToOne(() => DetailTravel, (detailTravel) => detailTravel.postcontents)
  @JoinColumn({ name: 'detailtravel_id', referencedColumnName: 'id' })
  detailTravel: DetailTravel;
}
