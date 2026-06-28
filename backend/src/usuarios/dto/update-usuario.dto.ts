import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsBoolean } from 'class-validator';

export class UpdateUsuarioDto {
  @ApiPropertyOptional()
  @IsOptional()
  nome?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    enum: ['administrador', 'tecnico_ti', 'gestor', 'somente_leitura'],
  })
  @IsOptional()
  @IsEnum(['administrador', 'tecnico_ti', 'gestor', 'somente_leitura'])
  perfil?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
