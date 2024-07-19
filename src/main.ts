import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  //서버 시작지점
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
