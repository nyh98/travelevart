import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Post } from '../../post/entities/post.entity';
import { Postlike } from '../../post/entities/postlike.entity';
import { Comment } from '../../comment/entities/comment.entity';
import { Diary } from 'src/diary/entities/diary.entity';
import { Cart } from 'src/cart/entities/cart.entity';
import { PlaceRating } from 'src/place/entities/placeRating.entity';
import { TravelRoute } from 'src/custom/entities/travelroute.entity';
import { Alert } from 'src/alert/entities/alert.entity';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  profile_img: string;

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

  @OneToMany(() => Post, (post) => post.user)
  post: Post[];

  @OneToMany(() => Postlike, (postlike) => postlike.user)
  postlike: Postlike[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comment: Comment[];

  @OneToMany(() => Diary, (diary) => diary.user)
  diaries: Diary[];

  @OneToMany(() => Cart, (cart) => cart.user)
  carts: Cart[];

  @OneToMany(() => PlaceRating, (rating) => rating.user)
  placeRating: PlaceRating[];

  @OneToMany(() => TravelRoute, (travelroute) => travelroute.user)
  travelRoutes: TravelRoute[];

  @OneToMany(() => Alert, alert => alert.recUser)
  receivedAlerts: Alert[];

  @OneToMany(() => Alert, alert => alert.sendUser)
  sentAlerts: Alert[];
}
