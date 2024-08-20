import { TravelRoute } from "src/custom/entities/travelroute.entity";
import { Postlike } from "src/post/entities/postlike.entity";
import { Comment } from '../../comment/entities/comment.entity'
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "src/user/entities/user.entity";

@Entity('alert')
export class Alert {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  rec_user_id: number;  // 알림 받는 유저

  @Column()
  send_user_id: number;  // 알림 보내는 유저

  @Column()
  type: string;  // 알림 타입 (커스텀 여행, 좋아요, 댓글)

  @Column({ nullable: true })
  travelRoute_id: number;  // 커스텀 여행 ID

  @Column({ nullable: true })
  postlike_id: number;  // 좋아요 ID

  @Column({ nullable: true })
  comment_id: number;  // 댓글 ID

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @ManyToOne(() => User, user => user.receivedAlerts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'rec_user_id', foreignKeyConstraintName: 'fk_alert_rec_user' })
  recUser: User;  // 알림 받는 유저

  @ManyToOne(() => User, user => user.sentAlerts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'send_user_id', foreignKeyConstraintName: 'fk_alert_send_user' })
  sendUser: User;  // 알림 보내는 유저

  @ManyToOne(() => TravelRoute, travelRoute => travelRoute.alert, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'travelRoute_id', foreignKeyConstraintName: 'fk_alert_travelRoute'  })
  travelRoute: TravelRoute;

  @ManyToOne(() => Postlike, postLike => postLike.alert, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'postlike_id', foreignKeyConstraintName: 'fk_alert_postlike'  })
  postlike: Postlike;

  @ManyToOne(() => Comment, comment => comment.alert, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'comment_id', foreignKeyConstraintName: 'fk_alert_comment'  })
  comment: Comment;
}