/* eslint-disable no-empty */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Promotion } from './entities/promotion.entity';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { CreatePromotionDto } from './dto/create-promotion.dto';

@Injectable()
export class PromotionsService {
  constructor(
    @InjectRepository(Promotion)
    private readonly promotionRepo: Repository<Promotion>,
  ) {}

  findAll() {
    return this.promotionRepo.find();
  }

  async create(dto: CreatePromotionDto, file: Express.Multer.File) {
    // dto already has numbers because of @Type(() => Number) in DTO
    const finalPrice =
      dto.originalPrice - (dto.originalPrice * dto.discountPercent) / 100;

    const promotion = this.promotionRepo.create({
      ...dto,
      imagePath: file.filename,
      finalPrice: finalPrice,
    });

    return {
      message: 'Promotion created successfully',
      promotion: await this.promotionRepo.save(promotion),
    };
  }

  async update(
    id: number,
    dto: UpdatePromotionDto,
    file?: Express.Multer.File,
  ) {
    const promotion = await this.promotionRepo.findOne({ where: { id } });

    if (!promotion) {
      throw new NotFoundException(`Promotion with ID ${id} not found`);
    }

    // This automatically updates name, rating, reviewCount, etc.
    // No more parseFloat() needed because dto.rating is already a number!
    Object.assign(promotion, dto);

    // Recalculate finalPrice if price or discount changed
    if (dto.originalPrice !== undefined || dto.discountPercent !== undefined) {
      promotion.finalPrice =
        promotion.originalPrice -
        (promotion.originalPrice * promotion.discountPercent) / 100;
    }

    if (file) {
      try {
        await unlink(join('./uploads/promotions', promotion.imagePath));
      } catch (error) {
        // Ignore if old file is missing
      }
      promotion.imagePath = file.filename;
    }

    return {
      message: 'Promotion updated successfully',
      promotion: await this.promotionRepo.save(promotion),
    };
  }

  async remove(id: number) {
    const promotion = await this.promotionRepo.findOne({ where: { id } });

    if (!promotion) {
      throw new NotFoundException(`Promotion with ID ${id} not found`);
    }

    try {
      await unlink(join('./uploads/promotions', promotion.imagePath));
    } catch (error) {}

    await this.promotionRepo.remove(promotion);

    return {
      message: 'Promotion deleted successfully',
    };
  }
}
