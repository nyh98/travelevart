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

  @ManyToOne(() => Post, (post) => post.postContents)
  @JoinColumn({ name: 'post_id' })
  post: Post;
}
