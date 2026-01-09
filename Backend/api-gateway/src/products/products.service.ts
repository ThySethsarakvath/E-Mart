import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { unlink } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  create(createProductDto: CreateProductDto, imageFilename: string) {
    const newProduct = this.productsRepository.create({
      ...createProductDto,
      imagePath: imageFilename,
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
    });
  }

  async remove(id: number) {
    const product = await this.findOne(id);

    if (product.imagePath) {
      try {
        await unlink(join('./uploads/products', product.imagePath));
      } catch (error) {}
    }

    return this.productsRepository.remove(product);
  }
}
