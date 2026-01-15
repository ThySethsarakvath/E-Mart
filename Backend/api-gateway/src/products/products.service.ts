import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { UpdateProductDto } from './dto/update-product.dto';
import { Categories } from '../categories/entities/categories.entity';
import { SubCategory } from '../categories/entities/subcategory.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,

    @InjectRepository(Categories)
    private categoryRepo: Repository<Categories>,

    @InjectRepository(SubCategory)
    private subCategoryRepo: Repository<SubCategory>,
  ) {}

  async create(createProductDto: CreateProductDto, imageFilename: string) {
   
    const category = await this.categoryRepo.findOne({
      where: { id: +createProductDto.categoryId },
    });
    if (!category) throw new NotFoundException('Category not found');

   
    let subCategory: SubCategory | null = null;
    if (createProductDto.subCategoryId) {
      subCategory = await this.subCategoryRepo.findOne({
        where: { id: +createProductDto.subCategoryId },
      });
      if (!subCategory) throw new NotFoundException('SubCategory not found');
    }

    
    const newProduct = this.productsRepository.create({
      ...createProductDto,
      imagePath: imageFilename, 
      category: category,
      ...(subCategory && { subCategory }),
    });

    return this.productsRepository.save(newProduct);
  }

  findAll() {
    return this.productsRepository.find({
      relations: ['category', 'subCategory'],
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number) {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: ['category', 'subCategory'],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  findByCategory(categoryId: number) {
    return this.productsRepository.find({
      where: { categoryId: categoryId },
      relations: ['subCategory'],
    });
  }

  async remove(id: number) {
    const product = await this.findOne(id);

    if (product.imagePath) {
      try {
        await unlink(join('./uploads/products', product.imagePath));
      } catch (error) {
        // Ignore file not found errors
      }
    }

    return this.productsRepository.remove(product);
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
    imageFilename: string | null,
  ) {
    const product = await this.findOne(id);
    
    // Update basic fields
    Object.assign(product, updateProductDto);

    // Update Image if provided
    if (imageFilename) {
      if (product.imagePath) {
        try {
          await unlink(join('./uploads/products', product.imagePath));
        } catch (err) {
          console.error('Error deleting old image:', err);
        }
      }
      product.imagePath = imageFilename;
    }

    // Update Category Relation
    if (updateProductDto.categoryId) {
      const category = await this.categoryRepo.findOne({
        where: { id: +updateProductDto.categoryId },
      });
      if (!category) throw new NotFoundException('Category not found');
      product.category = category;
    }

    // Update SubCategory Relation
    if (updateProductDto.subCategoryId) {
      const subCategory = await this.subCategoryRepo.findOne({
        where: { id: +updateProductDto.subCategoryId },
      });
      if (!subCategory) throw new NotFoundException('SubCategory not found');
      product.subCategory = subCategory;
    }

    return this.productsRepository.save(product);
  }
}