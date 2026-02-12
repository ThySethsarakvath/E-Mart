import { IsOptional, IsString, IsNumber, Min, Max, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdatePromotionDto {
  @IsString()
  @IsOptional()
  name?: string;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  @IsOptional()
  originalPrice?: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  discountPercent?: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(5)
  @IsOptional()
  rating?: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  reviewCount?: number;
}
