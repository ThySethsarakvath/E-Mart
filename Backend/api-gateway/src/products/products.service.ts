import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { Categories } from '../categories/entities/categories.entity';
@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async create(dto: CreateProductDto, imagePath: string): Promise<Product> {
    const product = this.productRepo.create({
      ...dto,
      imagePath,
      category: { id: dto.categoryId } as Categories,
    });
    return this.productRepo.save(product);
  }

  async findAll(): Promise<Product[]> {
    return this.productRepo.find({
      relations: ['category'], 
    });
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepo.findOne({ where: { id } });
    if (!product) throw new NotFoundException(`Product with ID ${id} not found`);
    return product;
  }

  async update(id: number, dto: UpdateProductDto) {
    const product = await this.findOne(id);

    if (dto.name) product.name = dto.name;
    if (dto.description) product.description = dto.description;
    if (dto.price) product.price = dto.price;

    if (dto.imagePath) {
      try {
        await unlink(join('./uploads/products', product.imagePath));
      } catch (error) {
        
      }
      product.imagePath = dto.imagePath;
    }

    return this.productRepo.save(product);
  }

  async remove(id: number) {
    const product = await this.findOne(id);
    try {
      await unlink(join('./uploads/products', product.imagePath));
    } catch (error) {
      // Ignore
    }
    return this.productRepo.remove(product);
  }
}