import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateBannerDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  title?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  subtitle?: string;
}
