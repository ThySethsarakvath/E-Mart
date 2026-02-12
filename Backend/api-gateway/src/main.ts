/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  // 🚨 Disable Nest global body parsing (IMPORTANT)
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
    origin: true,
    credentials: true,
  });

  const server = await app.listen(3000);
  server.setTimeout(60000);

  console.log(`API Gateway running at ${await app.getUrl()}`);
}

bootstrap();
