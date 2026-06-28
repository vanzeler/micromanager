import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsNumber, IsDateString, Min } from 'class-validator';

export class CreateLicencaDto {
  @ApiProperty({
    enum: ['office','adobe','delphi','visual_studio','teamviewer','antivirus','windows','outro'],
  })
  @IsEnum(['office','adobe','delphi','visual_studio','teamviewer','antivirus','windows','outro'])
  tipo: string;

  @ApiProperty({ example: 'Microsoft 365 Business' })
  @IsNotEmpty({ message: 'Software é obrigatório' })
  software: string;

  @ApiPropertyOptional({ example: '2024' })
  @IsOptional()
  versao?: string;

  @ApiPropertyOptional({ example: 'Microsoft' })
  @IsOptional()
  fabricante?: string;

  @ApiPropertyOptional()
  @IsOptional()
  chave_licenca?: string;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  quantidade_total?: number;

  @ApiPropertyOptional({ example: '2024-01-01' })
  @IsOptional()
  @IsDateString()
  data_compra?: string;

  @ApiPropertyOptional({ example: '2025-01-01' })
  @IsOptional()
  @IsDateString()
  data_expiracao?: string;

  @ApiPropertyOptional({ example: 12500.00 })
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
