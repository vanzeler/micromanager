import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, Min } from 'class-validator';

export class UpdateEstoqueDto {
  @ApiPropertyOptional()
  @IsOptional()
  nome?: string;

  @ApiPropertyOptional()
  @IsOptional()
  descricao?: string;

  @ApiPropertyOptional()
  @IsOptional()
  categoria?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  quantidade?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  quantidade_minima?: number;

  @ApiPropertyOptional()
  @IsOptional()
  unidade?: string;

  @ApiPropertyOptional()
  @IsOptional()
  localizacao?: string;

  @ApiPropertyOptional()
  @IsOptional()
  fornecedor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  preco_unitario?: number;
}
