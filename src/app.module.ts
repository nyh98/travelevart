import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostModule } from './post/post.module';
import { CommentModule } from './comment/comment.module';
import { AlertModule } from './alert/alert.module';
import { PlaceModule } from './place/place.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '1234',
      database: 'test',
      synchronize: true,
      autoLoadEntities: true,
      retryDelay: 3000000, //임시로 db연결 재시도 타임 겁나 늘려놓았음
    }),
    PostModule,
    CommentModule,
    AlertModule,
    PlaceModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
