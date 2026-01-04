/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categories } from './entities/categories.entity';
import { CreateCategoriesDto } from './dto/create-categories.dto';
import { UpdateCategoriesDto } from './dto/update-categories.dto';
import { unlink } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Categories)
    private readonly categoriesRepo: Repository<Categories>,
  ) {}

  async create(
    dto: CreateCategoriesDto,
    imagePath: string,
  ): Promise<Categories> {
    const categories = this.categoriesRepo.create({
      name: dto.name,
      imagePath,
    });

    return this.categoriesRepo.save(categories);
  }

  async findAll(): Promise<Categories[]> {
    return this.categoriesRepo.find();
  }

  async update(id: string, updateCategoriesDto: UpdateCategoriesDto) {
    const categories = await this.categoriesRepo.findOne({ where: { id } });

    if (!categories) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    if (updateCategoriesDto.name) {
      categories.name = updateCategoriesDto.name;
    }

    if (updateCategoriesDto.imagePath) {
      try {
        await unlink(join('./uploads/categories', categories.imagePath));
      } catch (error) {
        // Ignore
      }
      categories.imagePath = updateCategoriesDto.imagePath;
    }

    const updatedCategory = await this.categoriesRepo.save(categories);

    return {
      message: 'Category updated successfully',
      categories: updatedCategory,
    };
  }

  async remove(id: string) {
    const categories = await this.categoriesRepo.findOne({ where: { id } });

    if (!categories) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    try {
      await unlink(join('./uploads/categories', categories.imagePath));
    } catch (error) {
      //Ingore
    }

    await this.categoriesRepo.remove(categories);
    return {
      message: 'Category deleted successfully',
    };
  }
}
