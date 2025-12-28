/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable } from '@nestjs/common';

@Injectable()
export class BannersService {
  private banners: any[] = [];

  findAll() {
    return this.banners;
  }

  create(data: any) {
    const banner = {
      title: data.title,
      subtitle: data.subtitle,
      imageUrl: data.image ? `/uploads/${data.image.filename}` : null,
    };

    this.banners.push(banner);

    return {
      message: 'Banner created successfully',
      banner,
    };
  }
}
