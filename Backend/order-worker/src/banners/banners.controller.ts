/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
// Backend/order-worker/src/banners/banners.controller.ts
import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  UploadedFile,
  UseInterceptors,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BannersService } from './banners.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';

@Controller('banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Get()
  getAll() {
    return this.bannersService.findAll();
  }

  @Post()
  @UseInterceptors(FileInterceptor('image')) // ✅ Simplified - no disk storage
  create(
    @Body() body: CreateBannerDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.bannersService.create(body, file);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('image')) // ✅ Simplified - no disk storage
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateBannerDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    console.log('PATCH HIT IN ORDER WORKER', id);
    return this.bannersService.update(id, body, file);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    console.log('DELETE HIT IN ORDER WORKER', id);
    return this.bannersService.remove(id);
  }
}
