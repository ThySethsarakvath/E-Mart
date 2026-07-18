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
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CategoriesService } from './categories.service';
import { CreateCategoriesDto } from './dto/create-categories.dto';
import { UpdateCategoriesDto } from './dto/update-categories.dto';
import { Public } from '../auth/decorator/public.decorator';
import { Roles } from '../auth/decorator/roles.decorator';
import { RolesGuard } from '../auth/guard/roles.guard';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get('subcategories')
  @Public()
  findAllSubs() {
    return this.categoriesService.findAllSubCategories();
  }

  @Get('subcategories/:id')
  @Public()
  findOneSub(@Param('id') id: string) {
    return this.categoriesService.findOneSubCategory(+id);
  }

  @Post('subcategories')
  @UseGuards(RolesGuard)
  @Roles('admin')
  createSub(@Body() body: { name: string; categoryId: number }) {
    return this.categoriesService.createSubCategory(body.name, body.categoryId);
  }

  @Delete('subcategories/:id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  removeSub(@Param('id') id: string) {
    return this.categoriesService.removeSubCategory(+id);
  }

  @Get()
  @Public()
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(+id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @UseInterceptors(FileInterceptor('image'))
  create(
    @Body() dto: CreateCategoriesDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.categoriesService.create(dto, file);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @UseInterceptors(FileInterceptor('image'))
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCategoriesDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.categoriesService.update(+id, dto, file);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(+id);
  }
}
