import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostModule } from './post/post.module';
import { CommentModule } from './comment/comment.module';
import { AlertModule } from './alert/alert.module';
import { PlaceModule } from './place/place.module';
import { CartModule } from './cart/cart.module';
import { CustomModule } from './custom/custom.module';
import { DiaryModule } from './diary/diary.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'travelevart-db.cv4i2yycua0x.ap-northeast-2.rds.amazonaws.com',
      port: 3306,
      username: 'admin',
      password: 'ckstlr0504!',
      database: 'travelevart_DB',
      synchronize: true,
      autoLoadEntities: true,
      retryDelay: 3000000, //임시로 db연결 재시도 타임 겁나 늘려놓았음
    }),
    PostModule,
    CommentModule,
    AlertModule,
    PlaceModule,
    CartModule,
    CustomModule,
    DiaryModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
