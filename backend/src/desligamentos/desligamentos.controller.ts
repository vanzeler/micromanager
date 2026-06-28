import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  SetMetadata,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { DesligamentosService } from './desligamentos.service';
import { CreateDesligamentoDto } from './dto/create-desligamento.dto';
import { UpdateDesligamentoDto } from './dto/update-desligamento.dto';

const Roles = (...roles: string[]) => SetMetadata('roles', roles);

@ApiTags('Desligamentos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('desligamentos')
export class DesligamentosController {
  constructor(private service: DesligamentosService) {}

  @Get()
  @ApiOperation({ summary: 'Listar desligamentos' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'colaborador_id', required: false })
  findAll(@Query() query: any) {
    return this.service.findAll(query);
  }

  @Get('pendentes')
  @ApiOperation({ summary: 'Desligamentos pendentes ou em andamento' })
  getPendentes() {
    return this.service.getPendentes();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar desligamento por ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Get(':id/checklist')
  @ApiOperation({ summary: 'Checklist do desligamento' })
  getChecklist(@Param('id') id: string) {
    return this.service.getChecklist(id);
  }

  @Post()
  @Roles('administrador', 'tecnico_ti', 'gestor')
  @ApiOperation({ summary: 'Abrir processo de desligamento' })
  create(@Body() dto: CreateDesligamentoDto, @Request() req) {
    return this.service.create(dto, req.user.userId);
  }

  @Patch(':id')
  @Roles('administrador', 'tecnico_ti')
  @ApiOperation({ summary: 'Atualizar checklist de desligamento' })
  update(@Param('id') id: string, @Body() dto: UpdateDesligamentoDto) {
    return this.service.update(id, dto);
  }
}
