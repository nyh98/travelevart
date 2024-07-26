import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Post } from '../../post/entities/post.entity'
import { Postlike } from '../../post/entities/postlike.entity'

@Entity('user')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    profile_img: string;

    @Column('varchar', { length: 100 })
    provider: string;

    @Column('varchar', { length: 100 })
    user_name: string;

    @Column({ nullable: true })
    uid: string;

    @Column({ type: 'tinyint', default: 0 })
    role: number;

    @Column({ nullable: true })
    email: string;

    @Column({ nullable: true })
    password: string;

    @OneToMany(() => Post, post => post.user)
    posts: Post[];

    @OneToMany(() => Postlike, postlike => postlike.user)
    postlikes: Postlike[];
}