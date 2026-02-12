import { IsNotEmpty, IsString, IsNumber, Min, Max, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePromotionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @Type(() => Number) // Converts string from form-data to number
  @IsNumber()
  @IsPositive()
  originalPrice: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercent: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(5)
  rating: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  reviewCount: number;
}
