import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Categories } from './categories.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('subcategories')
export class SubCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string; 

 
  @ManyToOne(() => Categories, (category) => category.subCategories, { onDelete: 'CASCADE' })
  category: Categories;

  @Column()
  categoryId: number;

  
  @OneToMany(() => Product, (product) => product.subCategory)
  products: Product[];
}