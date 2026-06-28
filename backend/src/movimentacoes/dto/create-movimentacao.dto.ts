import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateMovimentacaoDto {
  @ApiProperty({
    enum: ['entrada','saida','transferencia','manutencao','descarte','emprestimo'],
  })
  @IsEnum(['entrada','saida','transferencia','manutencao','descarte','emprestimo'])
  tipo: string;

  @ApiPropertyOptional()
  @IsOptional()
  equipamento_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  estoque_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  colaborador_origem_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  colaborador_destino_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  setor_origem?: string;

  @ApiPropertyOptional()
  @IsOptional()
  setor_destino?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  quantidade?: number;

  @ApiPropertyOptional()
  @IsOptional()
  motivo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  observacoes?: string;
}
