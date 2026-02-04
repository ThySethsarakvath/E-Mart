/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
<<<<<<< HEAD
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  console.log('JWT_ACCESS_SECRET:', configService.get('JWT_ACCESS_SECRET'));
  console.log('JWT_ACCESS_EXPIRES:', configService.get('JWT_ACCESS_EXPIRES'));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: true,
    credentials: true,
  });

  const server = await app.listen(3000);

  // Increase server timeout to 60 seconds
  server.setTimeout(60000);

  console.log(`API Gateway is running on: ${await app.getUrl()}`);
=======
import { join } from 'path';
import { mkdirSync } from 'fs';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
async function bootstrap() {
  try {
    mkdirSync('./uploads/banners', { recursive: true });
    mkdirSync('./uploads/promotions', { recursive: true });
    mkdirSync('./uploads/categories', { recursive: true });
    mkdirSync('./uploads/arrivals', { recursive: true });
    mkdirSync('./uploads/products', { recursive: true });
  } catch (error) {
    // Directory already exists
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.enableCors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true,
  });

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });
  
  await app.listen(process.env.PORT ?? 3000);
>>>>>>> sitha-feature
}
bootstrap();
