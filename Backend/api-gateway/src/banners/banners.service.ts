import { Injectable } from '@nestjs/common';

@Injectable()
export class BannersService {
  getHeroBanner() {
    return {
      title: 'Welcome to E-Mart',
      subtitle: 'Everything you need, one platform',
      features: ['Fast Orders', 'Secure Payments', 'Digital Receipts'],
      button: {
        text: 'Shop Now',
        link: '/products',
      },
    };
  }
}
