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
  console.log('JWT_ACCESS_SECRET:', configService.get('JWT_ACCESS_SECRET'));
  console.log('JWT_ACCESS_EXPIRES:', configService.get('JWT_ACCESS_EXPIRES'));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: [
      'https://e-mart-frontend-38lv.onrender.com',
      'http://localhost:5173',
    ],
    credentials: true,
  });

  const port = process.env.PORT || 3000;
  const server = await app.listen(port);
  server.setTimeout(60000);

  console.log(`API Gateway running on port ${port}`);
}

bootstrap();
