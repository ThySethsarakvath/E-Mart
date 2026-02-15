/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// Backend/order-worker/src/banners/banners.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Banner } from './entity/banner.entity';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class BannersService {
  constructor(
    @InjectRepository(Banner)
    private readonly bannerRepo: Repository<Banner>,
    private readonly cloudinaryService: CloudinaryService, // ✅ Inject Cloudinary
  ) {}

  findAll() {
    return this.bannerRepo.find();
  }

  async create(dto: CreateBannerDto, file: Express.Multer.File) {
    if (!file) {
      throw new Error('Image file is required');
    }

    // ✅ Upload to Cloudinary
    const uploadResult = await this.cloudinaryService.uploadImage(
      file,
      'banners',
    );

    const banner = this.bannerRepo.create({
      title: dto.title,
      subtitle: dto.subtitle,
      imagePath: uploadResult.secure_url, // ✅ Store full Cloudinary URL
    });

    return {
      message: 'Banner created successfully',
      banner: await this.bannerRepo.save(banner),
    };
  }

  async update(id: number, dto: UpdateBannerDto, file?: Express.Multer.File) {
    const banner = await this.bannerRepo.findOne({ where: { id } });

    if (!banner) {
      throw new NotFoundException(`Banner with ID ${id} not found`);
    }

    // Update text fields
    if (dto.title) {
      banner.title = dto.title;
    }
    if (dto.subtitle) {
      banner.subtitle = dto.subtitle;
    }

    // Update image if new one uploaded
    if (file) {
      // ✅ Delete old image from Cloudinary
      const oldPublicId = this.cloudinaryService.extractPublicId(
        banner.imagePath,
      );
      if (oldPublicId) {
        await this.cloudinaryService.deleteImage(oldPublicId);
      }

      // ✅ Upload new image
      const uploadResult = await this.cloudinaryService.uploadImage(
        file,
        'banners',
      );
      banner.imagePath = uploadResult.secure_url;
    }

    return {
      message: 'Banner updated successfully',
      banner: await this.bannerRepo.save(banner),
    };
  }

  async remove(id: number) {
    const banner = await this.bannerRepo.findOne({ where: { id } });

    if (!banner) {
      throw new NotFoundException(`Banner with ID ${id} not found`);
    }

    // ✅ Delete image from Cloudinary
    const publicId = this.cloudinaryService.extractPublicId(banner.imagePath);
    if (publicId) {
      await this.cloudinaryService.deleteImage(publicId);
    }

    await this.bannerRepo.remove(banner);
    return {
      message: 'Banner deleted successfully',
    };
  }
}
