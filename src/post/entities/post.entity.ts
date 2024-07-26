import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from '../../user/entities/user.entity';
import { Postlike } from './postlike.entity'

@Entity('post')
export class Post {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    user_id: number;

    @Column({ nullable: true })
    travelRoute_id: number;

    @Column({ length: 100 })
    title: string;

    @Column('text')
    contents: string;

    @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @Column({ default: 0 })
    view_count: number;

    @ManyToOne(() => User, user => user.posts)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @OneToMany(() => Postlike, postLike => postLike.post)
    postlikes: Postlike[];
}