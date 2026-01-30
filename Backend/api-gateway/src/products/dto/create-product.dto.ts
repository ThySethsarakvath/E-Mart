import { IsString, IsNotEmpty, IsNumber, Min, MinLength, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;
  @IsNotEmpty() 
  @Type(() => Number)
  @IsNumber()
  categoryId: number;
}