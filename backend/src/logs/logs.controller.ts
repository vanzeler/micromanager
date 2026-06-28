import { Controller, Get, Query, UseGuards, SetMetadata } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { LogsService } from './logs.service';

const Roles = (...roles: string[]) => SetMetadata('roles', roles);

@ApiTags('Logs de Auditoria')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('logs')
export class LogsController {
  constructor(private service: LogsService) {}

  @Get()
  @Roles('administrador', 'gestor')
  @ApiOperation({ summary: 'Listar logs de auditoria' })
  @ApiQuery({ name: 'usuario_id', required: false })
  @ApiQuery({ name: 'tabela', required: false })
  @ApiQuery({ name: 'acao', required: false })
  @ApiQuery({ name: 'data_inicio', required: false })
  @ApiQuery({ name: 'data_fim', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findAll(@Query() query: any) {
    return this.service.findAll(query);
  }
}
