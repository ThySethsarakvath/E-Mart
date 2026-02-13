/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsString, IsNotEmpty, MinLength, IsOptional } from 'class-validator';

export class CreateCategoriesDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Name must be 3 characters long' })
  name: string;

  @IsOptional()
  @IsString()
  imagePath: string;
}
