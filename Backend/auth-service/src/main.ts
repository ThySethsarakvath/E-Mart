import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: ['https://e-mart-frontend-38lv.onrender.com'],
    credentials: true,
  });

  await app.listen(3000);
  console.log(`Auth Service is running on: ${await app.getUrl()}`);
}
bootstrap();
