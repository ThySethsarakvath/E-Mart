export class CreateProductDto {
  name: string;
  price: number;
  description: string;
  categoryId: number; 
  imagePath: string;
  
  
  subCategoryId?: number;
  rating?: number;
  reviewCount?: number;
}