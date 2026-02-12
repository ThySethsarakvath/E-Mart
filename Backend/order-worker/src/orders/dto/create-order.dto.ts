import {
  IsNumber,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEmail,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderItemDto {
  @IsNumber()
  @IsNotEmpty()
  productId: number;

  @IsString()
  @IsNotEmpty()
  productName: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;
}

export class CreateOrderDto {
  @IsOptional()
  @IsNumber()
  userId?: number;

  @IsString()
  @IsNotEmpty()
  customerFirstName: string;

  @IsString()
  @IsNotEmpty()
  customerLastName: string;

  @IsEmail()
  @IsNotEmpty()
  customerEmail: string;

  @IsString()
  @IsNotEmpty()
  customerPhone: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  @IsOptional()
  @IsString()
  notes?: string;
}
