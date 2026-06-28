import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class CreateUsuarioDto {
  @ApiProperty({ example: 'João Silva' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  nome: string;

  @ApiProperty({ example: 'joao@empresa.com.br' })
  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @ApiProperty({ example: 'Senha@123' })
  @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
  senha: string;

  @ApiPropertyOptional({
    enum: ['administrador', 'tecnico_ti', 'gestor', 'somente_leitura'],
    default: 'somente_leitura',
  })
  @IsOptional()
  @IsEnum(['administrador', 'tecnico_ti', 'gestor', 'somente_leitura'])
  perfil?: string;
}
