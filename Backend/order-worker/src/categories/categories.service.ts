import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categories } from './entities/categories.entity';
import { SubCategory } from './entities/subcategory.entity';
import { CreateCategoriesDto } from './dto/create-categories.dto';
import { UpdateCategoriesDto } from './dto/update-categories.dto';
import { unlink } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Categories)
    private readonly categoriesRepo: Repository<Categories>,

    @InjectRepository(SubCategory)
    private readonly subCategoriesRepo: Repository<SubCategory>,
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
    return this.categoriesRepo.find({
      relations: ['products', 'subCategories', 'products.subCategory'],
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Categories> {
    const category = await this.categoriesRepo.findOne({
      where: { id },
      relations: ['products', 'subCategories', 'products.subCategory'],
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async update(id: number, updateCategoriesDto: UpdateCategoriesDto) {
    const category = await this.findOne(id);

    if (updateCategoriesDto.name) {
      category.name = updateCategoriesDto.name;
    }

    if (updateCategoriesDto.imagePath) {
      try {
        await unlink(join('./uploads/categories', category.imagePath));
      } catch (error) {}
      category.imagePath = updateCategoriesDto.imagePath;
    }

    return this.categoriesRepo.save(category);
  }

  async remove(id: number) {
    const category = await this.findOne(id);

    try {
      await unlink(join('./uploads/categories', category.imagePath));
    } catch (error) {}

    return this.categoriesRepo.remove(category);
  }

  async createSubCategory(name: string, categoryId: number) {
    const parentCategory = await this.categoriesRepo.findOne({
      where: { id: categoryId },
    });

    if (!parentCategory) {
      throw new NotFoundException(`Category with ID ${categoryId} not found`);
    }

    const subCategory = this.subCategoriesRepo.create({
      name,
      category: parentCategory,
      categoryId: categoryId,
    });

    return this.subCategoriesRepo.save(subCategory);
  }

  async findAllSubCategories() {
    return this.subCategoriesRepo.find({
      relations: ['category'], // Load parent info
    });
  }

  async findOneSubCategory(id: number) {
    const sub = await this.subCategoriesRepo.findOne({
      where: { id },
      relations: ['category'],
    });

    if (!sub) {
      throw new NotFoundException(`SubCategory with ID ${id} not found`);
    }
    return sub;
  }

  async removeSubCategory(id: number) {
    const sub = await this.subCategoriesRepo.findOne({ where: { id } });

    if (!sub) {
      throw new NotFoundException(`SubCategory with ID ${id} not found`);
    }

    return this.subCategoriesRepo.remove(sub);
  }
}
