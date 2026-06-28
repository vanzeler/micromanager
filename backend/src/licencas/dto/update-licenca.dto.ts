import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsNumber, IsDateString, Min } from 'class-validator';

export class UpdateLicencaDto {
  @ApiPropertyOptional()
  @IsOptional()
  software?: string;

  @ApiPropertyOptional()
  @IsOptional()
  versao?: string;

  @ApiPropertyOptional()
  @IsOptional()
  fabricante?: string;

  @ApiPropertyOptional()
  @IsOptional()
  chave_licenca?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  quantidade_total?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  quantidade_usada?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  data_compra?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  data_expiracao?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  valor?: number;

  @ApiPropertyOptional()
  @IsOptional()
  fornecedor?: string;

  @ApiPropertyOptional({
    enum: ['ativa','expirada','cancelada','suspensa'],
  })
  @IsOptional()
  @IsEnum(['ativa','expirada','cancelada','suspensa'])
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  observacoes?: string;
}
