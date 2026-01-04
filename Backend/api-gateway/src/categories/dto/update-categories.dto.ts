/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class UpdateCategoriesDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Name must be 3 characters long' })
  name: string;

  @IsString()
  imagePath: string;
}
