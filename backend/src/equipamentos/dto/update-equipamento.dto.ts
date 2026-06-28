import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsDateString, IsNumber } from 'class-validator';

export class UpdateEquipamentoDto {
  @ApiPropertyOptional()
  @IsOptional()
  codigo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum([
    'computador','notebook','monitor','impressora','telefone',
    'tablet','nobreak','switch','roteador','servidor','periferico','outro',
  ])
  tipo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  marca?: string;

  @ApiPropertyOptional()
  @IsOptional()
  modelo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  numero_serie?: string;

  @ApiPropertyOptional()
  @IsOptional()
  patrimonio?: string;

  @ApiPropertyOptional()
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

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  data_compra?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  valor_compra?: number;

  @ApiPropertyOptional()
  @IsOptional()
  nota_fiscal?: string;

  @ApiPropertyOptional()
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
