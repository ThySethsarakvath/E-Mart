import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GatewayController } from './gateway/gateway.controller';
import { ProxyService } from './proxy/proxy.service';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '../.env' }),
    HttpModule,
    AuthModule,
  ],
  controllers: [AppController, GatewayController],
  providers: [AppService, ProxyService],
})
export class AppModule {}
