import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Post } from '../../post/entities/post.entity'
import { Postlike } from '../../post/entities/postlike.entity'

@Entity('user')
export class User {
    @PrimaryGeneratedColumn()
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

    @OneToMany(() => Post, post => post.user)
    posts: Post[];

    @OneToMany(() => Postlike, postlike => postlike.user)
    postlikes: Postlike[];
}