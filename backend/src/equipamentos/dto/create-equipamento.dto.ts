import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsNumber,
} from 'class-validator';

export class CreateEquipamentoDto {
  @ApiProperty({ example: 'NB-010' })
  @IsNotEmpty({ message: 'Código é obrigatório' })
  codigo: string;

  @ApiProperty({
    enum: [
      'computador','notebook','monitor','impressora','telefone',
      'tablet','nobreak','switch','roteador','servidor','periferico','outro',
    ],
  })
  @IsEnum([
    'computador','notebook','monitor','impressora','telefone',
    'tablet','nobreak','switch','roteador','servidor','periferico','outro',
  ])
  tipo: string;

  @ApiPropertyOptional({ example: 'Dell' })
  @IsOptional()
  marca?: string;

  @ApiPropertyOptional({ example: 'Latitude 5540' })
  @IsOptional()
  modelo?: string;

  @ApiPropertyOptional({ example: 'SN123456' })
  @IsOptional()
  numero_serie?: string;

  @ApiPropertyOptional()
  @IsOptional()
  patrimonio?: string;

  @ApiPropertyOptional({
    enum: ['disponivel', 'em_uso', 'manutencao', 'descartado', 'reservado'],
  })
  @IsOptional()
  @IsEnum(['disponivel', 'em_uso', 'manutencao', 'descartado', 'reservado'])
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  colaborador_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  setor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  cidade?: string;

  @ApiPropertyOptional()
  @IsOptional()
  processador?: string;

  @ApiPropertyOptional()
  @IsOptional()
  memoria_ram?: string;

  @ApiPropertyOptional()
  @IsOptional()
  armazenamento?: string;

  @ApiPropertyOptional()
  @IsOptional()
  sistema_operacional?: string;

  @ApiPropertyOptional()
  @IsOptional()
  ip_address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  hostname?: string;

  @ApiPropertyOptional({ example: '2024-01-15' })
  @IsOptional()
  @IsDateString()
  data_compra?: string;

  @ApiPropertyOptional({ example: 5800.00 })
  @IsOptional()
  @IsNumber()
  valor_compra?: number;

  @ApiPropertyOptional()
  @IsOptional()
  nota_fiscal?: string;

  @ApiPropertyOptional({ example: '2026-12-31' })
  @IsOptional()
  @IsDateString()
  garantia_ate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  fornecedor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  observacoes?: string;
}
