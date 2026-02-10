import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from './auth/auth.module';
import { ProxyService } from './proxy/proxy.service';
import { GatewayController } from './gateway/gateway.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env`,
    }),
    HttpModule,
    AuthModule,
  ],
  controllers: [AppController, GatewayController],
  providers: [ProxyService, AppService],
})
export class AppModule {}
