import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categories } from './entities/categories.entity';
import { SubCategory } from './entities/subcategory.entity';
import { CreateCategoriesDto } from './dto/create-categories.dto';
import { UpdateCategoriesDto } from './dto/update-categories.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Categories)
    private readonly categoriesRepo: Repository<Categories>,

    @InjectRepository(SubCategory)
    private readonly subCategoriesRepo: Repository<SubCategory>,

    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(
    dto: CreateCategoriesDto,
    file: Express.Multer.File,
  ): Promise<Categories> {
    if (!file) {
      throw new Error('Image file is required');
    }
    const uploadResult = await this.cloudinaryService.uploadImage(
      file,
      'categories',
    );

    const category = this.categoriesRepo.create({
      name: dto.name,
      imagePath: uploadResult.secure_url,
    });

    return this.categoriesRepo.save(category);
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

  async update(
    id: number,
    dto: UpdateCategoriesDto,
    file?: Express.Multer.File,
  ) {
    const category = await this.findOne(id);

    if (dto.name) {
      category.name = dto.name;
    }

    if (file) {
      const oldPublicId = this.cloudinaryService.extractPublicId(
        category.imagePath,
      );
      if (oldPublicId) {
        await this.cloudinaryService.deleteImage(oldPublicId);
      }
      const uploadResult = await this.cloudinaryService.uploadImage(
        file,
        'categories',
      );
      category.imagePath = uploadResult.secure_url;
    }

    return this.categoriesRepo.save(category);
  }

  async remove(id: number) {
    const category = await this.findOne(id);

    const publicId = this.cloudinaryService.extractPublicId(category.imagePath);
    if (publicId) {
      await this.cloudinaryService.deleteImage(publicId);
    }

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
      relations: ['category'],
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
