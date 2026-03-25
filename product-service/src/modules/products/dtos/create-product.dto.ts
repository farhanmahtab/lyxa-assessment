import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'iPhone 15' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 'Latest Apple smartphone' })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({ example: 999.99 })
  @IsNumber()
  @Min(0)
  price!: number;
}
