import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsBoolean, IsEnum, IsDateString } from 'class-validator';

export class UpdateDesligamentoDto {
  @ApiPropertyOptional({
    enum: ['pendente','em_andamento','concluido','cancelado'],
  })
  @IsOptional()
  @IsEnum(['pendente','em_andamento','concluido','cancelado'])
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  motivo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  equipamentos_devolvidos?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  acessos_bloqueados?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  emails_redirecionados?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  backup_realizado?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  documentos_entregues?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  pendencias?: string;

  @ApiPropertyOptional()
  @IsOptional()
  observacoes?: string;
}
