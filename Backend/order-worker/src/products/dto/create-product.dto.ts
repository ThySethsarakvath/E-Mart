// create-product.dto.ts
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @Type(() => Number) // 👈 Convert "99.99" to 99.99
  @IsNumber()
  price: number;

  @IsString()
  description: string;

  @Type(() => Number) // 👈 Convert "5" to 5
  @IsNumber()
  categoryId: number;

  @IsOptional()
  imagePath: string;

  @IsOptional()
  @Type(() => Number)
  subCategoryId?: number;
}
