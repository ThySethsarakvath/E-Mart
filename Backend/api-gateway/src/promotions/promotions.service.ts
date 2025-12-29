import { Injectable } from '@nestjs/common';

@Injectable()
export class PromotionsService {
  private promotions = [
    {
      id: 1,
      name: 'Sweet Banana',
      imagePath: 'banana.jpg',
      originalPrice: 6,
      discountPercent: 50,
      finalPrice: 3,
      rating: 4.8,
      reviewCount: 88,
    },
    {
      id: 2,
      name: 'Raw Meat Beef - 250g',
      imagePath: 'beef.jpg',
      originalPrice: 10,
      discountPercent: 20,
      finalPrice: 8,
      rating: 4.6,
      reviewCount: 75,
    },
  ];

  findAllPromotions() {
    return this.promotions;
  }
}
