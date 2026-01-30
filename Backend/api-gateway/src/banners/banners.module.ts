import { Module } from '@nestjs/common';
import { BannersController } from './banners.controller';
import { BannersService } from './banners.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Banner } from './banner.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Banner])],
  controllers: [BannersController],
  providers: [BannersService],
})
export class BannersModule {}
