import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { ProxyService } from './proxy/proxy.service';
import { GatewayController } from './gateway/gateway.controller';
import { validateEnvironment } from './config/environment';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `../.env`,
      validate: validateEnvironment,
    }),
    HttpModule,
  ],
  controllers: [AppController, GatewayController],
  providers: [ProxyService, AppService],
})
export class AppModule {}
