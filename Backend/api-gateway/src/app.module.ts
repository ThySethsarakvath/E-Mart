import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BannersModule } from './banners/banners.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromotionsModule } from './promotions/promotions.module';
import { CategoriesModule } from './categories/categories.module';
import { ArrivalsModule } from './arrivals/arrivals.module';
import { ProductsModule } from './products/products.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'), 
      serveRoot: '/uploads',                     
    }),

    BannersModule,
    PromotionsModule,
    CategoriesModule,
    ArrivalsModule,
    ProductsModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'emart-db',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'e_mart',
      autoLoadEntities: true,
      synchronize: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}