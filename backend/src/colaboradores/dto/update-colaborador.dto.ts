import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsDateString } from 'class-validator';

export class UpdateColaboradorDto {
  @ApiPropertyOptional()
  @IsOptional()
  matricula?: string;

  @ApiPropertyOptional()
  @IsOptional()
  nome?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  telefone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  departamento?: string;

  @ApiPropertyOptional()
  @IsOptional()
  cargo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  cidade?: string;

  @ApiPropertyOptional()
  @IsOptional()
  setor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  gestor_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  data_admissao?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  data_desligamento?: string;

  @ApiPropertyOptional({
    enum: ['ativo', 'inativo', 'desligado', 'afastado'],
  })
  @IsOptional()
  @IsEnum(['ativo', 'inativo', 'desligado', 'afastado'])
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  observacoes?: string;
}
