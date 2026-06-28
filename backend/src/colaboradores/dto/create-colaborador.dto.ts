import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class CreateColaboradorDto {
  @ApiPropertyOptional({ example: 'MAT001' })
  @IsOptional()
  matricula?: string;

  @ApiProperty({ example: 'João Silva' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  nome: string;

  @ApiProperty({ example: 'joao.silva@empresa.com.br' })
  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @ApiPropertyOptional({ example: '(41) 99999-0001' })
  @IsOptional()
  telefone?: string;

  @ApiPropertyOptional({ example: 'TI' })
  @IsOptional()
  departamento?: string;

  @ApiPropertyOptional({ example: 'Analista de Sistemas' })
  @IsOptional()
  cargo?: string;

  @ApiPropertyOptional({ example: 'Curitiba' })
  @IsOptional()
  cidade?: string;

  @ApiPropertyOptional({ example: 'Desenvolvimento' })
  @IsOptional()
  setor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  gestor_id?: string;

  @ApiPropertyOptional({ example: '2024-01-15' })
  @IsOptional()
  @IsDateString()
  data_admissao?: string;

  @ApiPropertyOptional({
    enum: ['ativo', 'inativo', 'desligado', 'afastado'],
    default: 'ativo',
  })
  @IsOptional()
  @IsEnum(['ativo', 'inativo', 'desligado', 'afastado'])
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  observacoes?: string;
}
