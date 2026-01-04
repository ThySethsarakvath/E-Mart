import { IsString, IsNotEmpty, MinLength, IsOptional } from 'class-validator';

export class CreateArrivalDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Title must be at least 3 characters long' })
  title: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10, { message: 'Description must be at least 10 characters long' })
  subtitle: string;

  @IsString()
  @IsOptional()
  link?: string;
}
