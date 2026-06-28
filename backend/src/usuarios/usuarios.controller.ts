import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  SetMetadata,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

const Roles = (...roles: string[]) => SetMetadata('roles', roles);

@ApiTags('Usuários')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('usuarios')
export class UsuariosController {
  constructor(private service: UsuariosService) {}

  @Get()
  @Roles('administrador', 'gestor')
  @ApiOperation({ summary: 'Listar todos os usuários' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @Roles('administrador', 'gestor')
  @ApiOperation({ summary: 'Buscar usuário por ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles('administrador')
  @ApiOperation({ summary: 'Criar novo usuário' })
  create(@Body() dto: CreateUsuarioDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @Roles('administrador')
  @ApiOperation({ summary: 'Atualizar usuário' })
  update(@Param('id') id: string, @Body() dto: UpdateUsuarioDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles('administrador')
  @ApiOperation({ summary: 'Desativar usuário' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Patch(':id/reset-senha')
  @Roles('administrador')
  @ApiOperation({ summary: 'Redefinir senha do usuário' })
  resetSenha(
    @Param('id') id: string,
    @Body() body: { novaSenha: string },
  ) {
    return this.service.resetSenha(id, body.novaSenha);
  }
}
