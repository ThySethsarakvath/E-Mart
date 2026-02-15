/* eslint-disable no-empty */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Promotion } from './entities/promotion.entity';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class PromotionsService {
  constructor(
    @InjectRepository(Promotion)
    private readonly promotionRepo: Repository<Promotion>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  findAll() {
    return this.promotionRepo.find();
  }

  async create(dto: CreatePromotionDto, file: Express.Multer.File) {
    if (!file) {
      throw new Error('Image file is required');
    }
    const uploadResult = await this.cloudinaryService.uploadImage(
      file,
      'promotions',
    );

    const finalPrice =
      dto.originalPrice - (dto.originalPrice * dto.discountPercent) / 100;

    const promotion = this.promotionRepo.create({
      ...dto,
      imagePath: uploadResult.secure_url,
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

    Object.assign(promotion, dto);

    if (dto.originalPrice !== undefined || dto.discountPercent !== undefined) {
      promotion.finalPrice =
        promotion.originalPrice -
        (promotion.originalPrice * promotion.discountPercent) / 100;
    }

    if (file) {
      const oldPublicId = this.cloudinaryService.extractPublicId(
        promotion.imagePath,
      );
      if (oldPublicId) {
        await this.cloudinaryService.deleteImage(oldPublicId);
      }
      const uploadResult = await this.cloudinaryService.uploadImage(
        file,
        'promotions',
      );
      promotion.imagePath = uploadResult.secure_url;
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

    const publicId = this.cloudinaryService.extractPublicId(
      promotion.imagePath,
    );
    if (publicId) {
      await this.cloudinaryService.deleteImage(publicId);
    }

    await this.promotionRepo.remove(promotion);

    return {
      message: 'Promotion deleted successfully',
    };
  }
}
