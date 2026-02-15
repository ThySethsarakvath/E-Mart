/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Arrival } from './entities/arrivals.entities';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class ArrivalsService {
  constructor(
    @InjectRepository(Arrival)
    private readonly arrivalsRepo: Repository<Arrival>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  findAll() {
    return this.arrivalsRepo.find();
  }

  async create(data: any) {
    if (!data.image) {
      throw new Error('Image file is required');
    }

    const uploadResult = await this.cloudinaryService.uploadImage(
      data.image,
      'arrivals',
    );

    const arrival = this.arrivalsRepo.create({
      title: data.title,
      subtitle: data.subtitle,
      imagePath: uploadResult.secure_url,
      link: data.link || null,
    });

    return {
      message: 'Arrival created successfully',
      arrival: await this.arrivalsRepo.save(arrival),
    };
  }

  async update(id: number, data: any) {
    const arrival = await this.arrivalsRepo.findOne({ where: { id } });

    if (!arrival) {
      throw new NotFoundException(`Arrival with ID ${id} not found`);
    }

    if (data.title) {
      arrival.title = data.title;
    }
    if (data.subtitle) {
      arrival.subtitle = data.subtitle;
    }
    if (data.link !== undefined) {
      arrival.link = data.link;
    }

    if (data.image) {
      const oldPublicId = this.cloudinaryService.extractPublicId(
        arrival.imagePath,
      );
      if (oldPublicId) {
        await this.cloudinaryService.deleteImage(oldPublicId);
      }
      const uploadResult = await this.cloudinaryService.uploadImage(
        data.image,
        'arrivals',
      );
      arrival.imagePath = uploadResult.secure_url;
    }

    return {
      message: 'Arrival updated successfully',
      arrival: await this.arrivalsRepo.save(arrival),
    };
  }

  async remove(id: number) {
    const arrival = await this.arrivalsRepo.findOne({ where: { id } });

    if (!arrival) {
      throw new NotFoundException(`Arrival with ID ${id} not found`);
    }
    const publicId = this.cloudinaryService.extractPublicId(arrival.imagePath);
    if (publicId) {
      await this.cloudinaryService.deleteImage(publicId);
    }

    await this.arrivalsRepo.remove(arrival);

    return {
      message: 'Arrival deleted successfully',
    };
  }
}
