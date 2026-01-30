import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// --- Imports from HEAD (Gateway/Auth) ---
import { GatewayController } from './gateway/gateway.controller';
import { ProxyService } from './proxy/proxy.service';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from './auth/auth.module';

// --- Imports from Remote (Features/DB) ---
import { BannersModule } from './banners/banners.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromotionsModule } from './promotions/promotions.module';
import { CategoriesModule } from './categories/categories.module';
import { ArrivalsModule } from './arrivals/arrivals.module';
import { ProductsModule } from './products/products.module';

@Module({
  imports: [
    // 1. Configuration & Global Utils
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '../.env' }),
    HttpModule,
    AuthModule,

    // 2. Feature Modules
    BannersModule,
    PromotionsModule,
    CategoriesModule,
    ArrivalsModule,
    ProductsModule,

    // 3. Database Connection
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'postgres',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'e_mart',
      autoLoadEntities: true,
      synchronize: true,
    }),
  ],
  
  controllers: [AppController, GatewayController],
  
  
  providers: [AppService, ProxyService],
})
export class AppModule {}