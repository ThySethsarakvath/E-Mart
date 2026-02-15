/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });

  const configService = app.get(ConfigService);
  const corsOrigins =
    configService.get<string>('FRONTEND_URL')?.split(',').filter(Boolean) || [];

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: [...corsOrigins, 'http://localhost:5173'],
    credentials: true,
  });

  const port = process.env.PORT || 3000;
  const server = await app.listen(port);
  server.setTimeout(60000);
}

bootstrap();
