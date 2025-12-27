/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BannersService } from './banners.service';
import type { Multer } from 'multer';

@Controller('banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Get()
  getAll() {
    return this.bannersService.findAll();
  }

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  create(@Body() body: any, @UploadedFile() file: Multer.File) {
    return this.bannersService.create({
      ...body,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      image: file,
    });
  }
}
