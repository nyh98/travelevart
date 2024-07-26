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
import { MailModule } from './mail/mail.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    UserModule,
    TypeOrmModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get('DB_HOST'),
        port: 3306,
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_DATABASE'),
        synchronize: true,
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }),
    PostModule,
    CommentModule,
    AlertModule,
    PlaceModule,
    CartModule,
    CustomModule,
    DiaryModule,
    MailModule,
    RedisModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
