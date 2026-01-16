/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Arrival } from './entities/arrivals.entities';
import { unlink } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class ArrivalsService {
  constructor(
    @InjectRepository(Arrival)
    private readonly arrivalsRepo: Repository<Arrival>,
  ) {}

  findAll() {
    return this.arrivalsRepo.find();
  }

  async create(data: any) {
    const arrival = this.arrivalsRepo.create({
      title: data.title,
      subtitle: data.subtitle,
      imagePath: data.image.filename,
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
      try {
        await unlink(join('./uploads/arrivals', arrival.imagePath));
      } catch (error) {
        // Ignore
      }
      arrival.imagePath = data.image.filename;
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

    try {
      await unlink(join('./uploads/arrivals', arrival.imagePath));
    } catch (error) {
      // Ignore
    }

    await this.arrivalsRepo.remove(arrival);

    return {
      message: 'Arrival deleted successfully',
    };
  }
}
