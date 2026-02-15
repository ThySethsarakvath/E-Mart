/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CategoriesService } from './categories.service';
import { CreateCategoriesDto } from './dto/create-categories.dto';
import { UpdateCategoriesDto } from './dto/update-categories.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get('subcategories')
  findAllSubs() {
    return this.categoriesService.findAllSubCategories();
  }

  @Get('subcategories/:id')
  findOneSub(@Param('id') id: string) {
    return this.categoriesService.findOneSubCategory(+id);
  }

  @Post('subcategories')
  createSub(@Body() body: { name: string; categoryId: number }) {
    return this.categoriesService.createSubCategory(body.name, body.categoryId);
  }

  @Delete('subcategories/:id')
  removeSub(@Param('id') id: string) {
    return this.categoriesService.removeSubCategory(+id);
  }

  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(+id);
  }

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  create(
    @Body() dto: CreateCategoriesDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.categoriesService.create(dto, file);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('image'))
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCategoriesDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.categoriesService.update(+id, dto, file);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(+id);
  }
}
