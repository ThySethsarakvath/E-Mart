/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
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
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ArrivalsService } from './arrivals.service';

@Controller('arrivals')
export class ArrivalsController {
  constructor(private readonly arrivalsService: ArrivalsService) {}

  @Get()
  getAll() {
    return this.arrivalsService.findAll();
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/arrivals',
        filename: (req, file, callback) => {
          const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, `${uniqueName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  create(@Body() body: any, @UploadedFile() file: any) {
    return this.arrivalsService.create({
      title: body.title,
      subtitle: body.subtitle,
      link: body.link,
      image: file,
    });
  }

  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/arrivals',
        filename: (req, file, callback) => {
          const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, `${uniqueName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
    @UploadedFile() file?: any,
  ) {
    return this.arrivalsService.update(id, {
      title: body.title,
      subtitle: body.subtitle,
      link: body.link,
      image: file,
    });
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.arrivalsService.remove(id);
  }
}
