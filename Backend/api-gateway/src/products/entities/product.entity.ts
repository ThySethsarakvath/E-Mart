import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Categories } from '../../categories/entities/categories.entity';
import { SubCategory } from '../../categories/entities/subcategory.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('text', { nullable: true })
  description: string;  // <--- Added this back

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column()
  imagePath: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Categories, (category) => category.products, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'categoryId' })
  category: Categories;

  @Column({ nullable: true })
  categoryId: number;

  @ManyToOne(() => SubCategory, (subCategory) => subCategory.products, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'subCategoryId' })
  subCategory: SubCategory;

  @Column({ nullable: true })
  subCategoryId: number;
}