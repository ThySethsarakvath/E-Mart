/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { join } from 'path';
import { mkdirSync } from 'fs';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  try {
    mkdirSync('./uploads/banners', { recursive: true });
    mkdirSync('./uploads/promotions', { recursive: true });
    mkdirSync('./uploads/categories', { recursive: true });
    mkdirSync('./uploads/arrivals', { recursive: true });
    mkdirSync('./uploads/products', { recursive: true });
  } catch (error) {
    /* empty */
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  const corsOrigins =
    configService.get<string>('FRONTEND_URL')?.split(',').filter(Boolean) || [];

  app.enableCors({
    origin: [...corsOrigins, 'http://localhost:5173'],
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
}

bootstrap();
