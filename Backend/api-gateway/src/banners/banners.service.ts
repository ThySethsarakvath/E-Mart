/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Banner } from './banner.entity';

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
}
