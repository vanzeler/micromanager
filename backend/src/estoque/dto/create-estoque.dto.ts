import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateEstoqueDto {
  @ApiProperty({ example: 'Memória RAM 8GB DDR4' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  nome: string;

  @ApiPropertyOptional()
  @IsOptional()
  descricao?: string;

  @ApiPropertyOptional({ example: 'Memória' })
  @IsOptional()
  categoria?: string;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  quantidade?: number;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  quantidade_minima?: number;

  @ApiPropertyOptional({ example: 'unidade' })
  @IsOptional()
  unidade?: string;

  @ApiPropertyOptional({ example: 'Prateleira B2' })
  @IsOptional()
  localizacao?: string;

  @ApiPropertyOptional()
  @IsOptional()
  fornecedor?: string;

  @ApiPropertyOptional({ example: 180.00 })
  @IsOptional()
  @IsNumber()
  preco_unitario?: number;
}
