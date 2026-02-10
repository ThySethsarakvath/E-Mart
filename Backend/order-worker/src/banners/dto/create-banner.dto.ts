import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateBannerDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  subtitle: string;
}
