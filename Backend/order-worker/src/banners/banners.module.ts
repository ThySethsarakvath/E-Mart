import { Module } from '@nestjs/common';
import { BannersController } from './banners.controller';
import { BannersService } from './banners.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Banner } from './entity/banner.entity';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [TypeOrmModule.forFeature([Banner]), CloudinaryModule],
  controllers: [BannersController],
  providers: [BannersService],
})
export class BannersModule {}
