// create-product.dto.ts
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @Type(() => Number)
  @IsNumber()
  price: number;

  @IsString()
  description: string;

  @Type(() => Number)
  @IsNumber()
  categoryId: number;

  @IsOptional()
  imagePath: string;

  @IsOptional()
  @Type(() => Number)
  subCategoryId?: number;
}
