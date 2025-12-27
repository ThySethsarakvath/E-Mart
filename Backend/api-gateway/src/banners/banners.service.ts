/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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
      imageName: data.image?.originalname,
      imageType: data.image?.mimetype,
    };
    this.banners.push(banner);
    return { message: 'Banner created successfully', banner };
  }
}
