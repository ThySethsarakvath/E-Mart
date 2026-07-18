/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Categories } from '../categories/entities/categories.entity';
import { SubCategory } from '../categories/entities/subcategory.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,

    @InjectRepository(Categories)
    private categoryRepo: Repository<Categories>,

    @InjectRepository(SubCategory)
    private subCategoryRepo: Repository<SubCategory>,

    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(createProductDto: CreateProductDto, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Product image is required');
    }

    const catId = Number(createProductDto.categoryId);
    if (isNaN(catId)) {
      throw new BadRequestException(
        `Invalid Category ID: ${createProductDto.categoryId}`,
      );
    }

    const category = await this.categoryRepo.findOne({
      where: { id: catId },
    });
    if (!category) throw new NotFoundException('Category not found');

    let subCategory: SubCategory | null = null;
    if (createProductDto.subCategoryId) {
      subCategory = await this.subCategoryRepo.findOne({
        where: { id: +createProductDto.subCategoryId },
      });
      if (!subCategory) throw new NotFoundException('SubCategory not found');
    }
    const uploadResult = await this.cloudinaryService.uploadImage(
      file,
      'products',
    );

    const newProduct = this.productsRepository.create({
      ...createProductDto,
      imagePath: uploadResult.secure_url,
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

  findBySubCategory(subCategoryId: number) {
    return this.productsRepository.find({
      where: { subCategoryId },
      relations: ['category', 'subCategory'],
      order: { id: 'ASC' },
    });
  }

  async remove(id: number) {
    const product = await this.findOne(id);
    if (product.imagePath) {
      const publicId = this.cloudinaryService.extractPublicId(
        product.imagePath,
      );
      if (publicId) {
        await this.cloudinaryService.deleteImage(publicId);
      }
    }

    return this.productsRepository.remove(product);
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
    file?: Express.Multer.File,
  ) {
    const product = await this.findOne(id);
    Object.assign(product, updateProductDto);
    if (file) {
      if (product.imagePath) {
        const oldPublicId = this.cloudinaryService.extractPublicId(
          product.imagePath,
        );
        if (oldPublicId) {
          await this.cloudinaryService.deleteImage(oldPublicId);
        }
      }

      const uploadResult = await this.cloudinaryService.uploadImage(
        file,
        'products',
      );
      product.imagePath = uploadResult.secure_url;
    }

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
