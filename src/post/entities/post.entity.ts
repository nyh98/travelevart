import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from '../../user/entities/user.entity';
import { Postlike } from './postlike.entity'
import { Comment } from '../../comment/entities/comment.entity'
import { Postcontent } from "./postcontent.entity";
import { TravelRoute } from "src/custom/entities/travelroute.entity";

@Entity('post')
@Index('idx_post_created_at', ['created_at'])
export class Post {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    user_id: number;

    @Column({ nullable: true })
    travelRoute_id: number;

    @Column({ length: 100 })
    title: string;

    @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @Column({ default: 0 })
    view_count: number;

    @ManyToOne(() => User, user => user.post)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @OneToMany(() => Postlike, postLike => postLike.post)
    postlike: Postlike[];

    @OneToMany(() => Comment, comment => comment.post)
    comment: Comment[];

    @OneToMany(() => Postcontent, postContent => postContent.post)
    postContents: Postcontent[];

    @ManyToOne(() => TravelRoute, travelRoute => travelRoute.post, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'travelRoute_id' })
    travelRoute: TravelRoute;
}