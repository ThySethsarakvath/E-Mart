/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Promotion } from './promotion.entity';
import { unlink } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class PromotionsService {
  constructor(
    @InjectRepository(Promotion)
    private readonly promotionRepo: Repository<Promotion>,
  ) {}

  findAll() {
    return this.promotionRepo.find();
  }

  async create(data: any) {
    const originalPrice = parseFloat(data.originalPrice);
    const discountPercent = parseInt(data.discountPercent);
    const finalPrice = originalPrice - (originalPrice * discountPercent) / 100;

    const promotion = this.promotionRepo.create({
      name: data.name,
      imagePath: data.image.filename,
      originalPrice: originalPrice,
      discountPercent: discountPercent,
      finalPrice: finalPrice,
      rating: parseFloat(data.rating),
      reviewCount: parseInt(data.reviewCount),
    });

    return {
      message: 'Promotion created successfully',
      promotion: await this.promotionRepo.save(promotion),
    };
  }

  async update(id: number, data: any) {
    const promotion = await this.promotionRepo.findOne({ where: { id } });

    if (!promotion) {
      throw new NotFoundException(`Promotion with ID ${id} not found`);
    }

    // Update fields if provided
    if (data.name) {
      promotion.name = data.name;
    }
    if (data.rating) {
      promotion.rating = parseFloat(data.rating);
    }
    if (data.reviewCount) {
      promotion.reviewCount = parseInt(data.reviewCount);
    }

    // Recalculate finalPrice if originalPrice or discountPercent changes
    if (data.originalPrice) {
      promotion.originalPrice = parseFloat(data.originalPrice);
    }
    if (data.discountPercent) {
      promotion.discountPercent = parseInt(data.discountPercent);
    }

    // Calculate finalPrice
    if (data.originalPrice || data.discountPercent) {
      promotion.finalPrice =
        promotion.originalPrice -
        (promotion.originalPrice * promotion.discountPercent) / 100;
    }

    // If new image is uploaded, delete old image and update path
    if (data.image) {
      // Delete old image file
      try {
        await unlink(join('./uploads/promotions', promotion.imagePath));
      } catch (error) {
        // Ignore error if file doesn't exist
      }
      promotion.imagePath = data.image.filename;
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

    // Delete image file
    try {
      await unlink(join('./uploads/promotions', promotion.imagePath));
    } catch (error) {
      // Ignore error if file doesn't exist
    }

    await this.promotionRepo.remove(promotion);

    return {
      message: 'Promotion deleted successfully',
    };
  }
}
