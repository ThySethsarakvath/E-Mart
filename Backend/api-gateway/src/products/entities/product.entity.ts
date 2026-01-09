import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Categories } from '../../categories/entities/categories.entity';
import { SubCategory } from '../../categories/entities/subcategory.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('decimal')
  price: number;

  @Column({ nullable: true })
  description: string;

  @Column()
  imagePath: string;

  
  @Column()
  categoryId: number; 

  
  @ManyToOne(() => Categories, (category) => category.products, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'categoryId' })
  category: Categories;  

 
  @Column({ nullable: true })
  subCategoryId: number;

  @ManyToOne(() => SubCategory, (sub) => sub.products, { nullable: true })
  @JoinColumn({ name: 'subCategoryId' })
  subCategory: SubCategory;
}