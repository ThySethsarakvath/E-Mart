/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Banner } from './entity/banner.entity';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';

@Injectable()
export class BannersService {
  constructor(
    @InjectRepository(Banner)
    private readonly bannerRepo: Repository<Banner>,
  ) {}

  findAll() {
    return this.bannerRepo.find();
  }

  async create(dto: CreateBannerDto, file: Express.Multer.File) {
    const banner = this.bannerRepo.create({
      title: dto.title,
      subtitle: dto.subtitle,
      imagePath: file.filename,
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

    // Update text fields from the DTO
    if (dto.title) {
      banner.title = dto.title;
    }
    if (dto.subtitle) {
      banner.subtitle = dto.subtitle;
    }

    // Update image if a new one was uploaded
    if (file) {
      try {
        await unlink(join('./uploads/banners', banner.imagePath));
      } catch (error) {
        // Logic remains the same: ignore if file is missing
      }
      banner.imagePath = file.filename;
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
    // Delete image file
    try {
      await unlink(join('./uploads/banners', banner.imagePath));
    } catch (error) {
      // Ignore error if file doesn't exist
    }
    await this.bannerRepo.remove(banner);
    return {
      message: 'Banner deleted successfully',
    };
  }
}
