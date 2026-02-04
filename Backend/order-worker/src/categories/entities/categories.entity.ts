import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity'; 
import { SubCategory } from './subcategory.entity';
@Entity('categories')
export class Categories {
  @PrimaryGeneratedColumn()
  id: number; 

  @Column({ unique: true })
  name: string;

  @Column()
  imagePath: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  
 @OneToMany(() => Product, (product) => product.category)
  products: Product[];

  
  @OneToMany(() => SubCategory, (subCategory) => subCategory.category)
  subCategories: SubCategory[]; 
}