/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BannersModule } from './banners/banners.module';
import { PromotionsModule } from './promotions/promotions.module';
import { CategoriesModule } from './categories/categories.module';
import { ArrivalsModule } from './arrivals/arrivals.module';
import { ProductsModule } from './products/products.module';
import { PaymentsModule } from './payments/payments.module';
import { OrdersModule } from './orders/orders.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env',
    }),

    BannersModule,
    PromotionsModule,
    CategoriesModule,
    ArrivalsModule,
    ProductsModule,
    PaymentsModule,
    OrdersModule,
    CloudinaryModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const dbUrl = config.get<string>('DATABASE_EMART_URL');
        console.log('DATABASE_EMART_URL:', dbUrl); // <-- debug log

        return {
          type: 'postgres',
          url: dbUrl,
          ssl: { rejectUnauthorized: false },
          autoLoadEntities: true,
          synchronize: true,
        };
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
