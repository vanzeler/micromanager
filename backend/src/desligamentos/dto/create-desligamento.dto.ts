import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsDateString, IsEnum } from 'class-validator';

export class CreateDesligamentoDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'Colaborador é obrigatório' })
  colaborador_id: string;

  @ApiProperty({ example: '2024-12-31' })
  @IsDateString()
  data_desligamento: string;

  @ApiPropertyOptional({ example: 'Pedido de demissão' })
  @IsOptional()
  motivo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  observacoes?: string;
}
