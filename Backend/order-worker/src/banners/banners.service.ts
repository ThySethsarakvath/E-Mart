/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Banner } from './banner.entity';
import { unlink } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class BannersService {
  constructor(
    @InjectRepository(Banner)
    private readonly bannerRepo: Repository<Banner>,
  ) {}

  findAll() {
    return this.bannerRepo.find();
  }

  async create(data: any) {
    const banner = this.bannerRepo.create({
      title: data.title,
      subtitle: data.subtitle,
      imagePath: data.image.filename,
    });

    return {
      message: 'Banner created successfully',
      banner: await this.bannerRepo.save(banner),
    };
  }

  async update(id: number, data: any) {
    const banner = await this.bannerRepo.findOne({ where: { id } });

    if (!banner) {
      throw new NotFoundException(`Banner with ID ${id} not found`);
    }

    // Update fields if provided
    if (data.title) {
      banner.title = data.title;
    }
    if (data.subtitle) {
      banner.subtitle = data.subtitle;
    }

    // If new image is uploaded, delete old image and update path
    if (data.image) {
      // Delete old image file
      try {
        await unlink(join('./uploads/banners', banner.imagePath));
      } catch (error) {
        // Ignore error if file doesn't exist
      }
      banner.imagePath = data.image.filename;
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
