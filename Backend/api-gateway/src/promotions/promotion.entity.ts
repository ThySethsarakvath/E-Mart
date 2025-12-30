import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Promotion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  imagePath: string;

  @Column('decimal', { precision: 10, scale: 2 })
  originalPrice: number;

  @Column('int')
  discountPercent: number;

  @Column('decimal', { precision: 10, scale: 2 })
  finalPrice: number;

  @Column('decimal', { precision: 2, scale: 1 })
  rating: number;

  @Column('int')
  reviewCount: number;
}
