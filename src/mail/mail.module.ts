import { MiddlewareConsumer, Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { ConfigModule } from '@nestjs/config/dist';
import { AuthModule } from 'src/auth/auth.module';
import { authMiddleware } from 'src/auth/auth.middleware';

@Module({
  imports: [ConfigModule, AuthModule],
  controllers: [MailController],
  providers: [MailService],
})
export class MailModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(authMiddleware)
      .exclude()
      .forRoutes(MailController);
  }
}
