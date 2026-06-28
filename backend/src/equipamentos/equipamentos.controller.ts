import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  SetMetadata,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { EquipamentosService } from './equipamentos.service';
import { CreateEquipamentoDto } from './dto/create-equipamento.dto';
import { UpdateEquipamentoDto } from './dto/update-equipamento.dto';

const Roles = (...roles: string[]) => SetMetadata('roles', roles);

@ApiTags('Equipamentos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('equipamentos')
export class EquipamentosController {
  constructor(private service: EquipamentosService) {}

  @Get()
  @ApiOperation({ summary: 'Listar equipamentos com filtros' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'tipo', required: false })
  @ApiQuery({ name: 'cidade', required: false })
  @ApiQuery({ name: 'setor', required: false })
  @ApiQuery({ name: 'colaborador_id', required: false })
  findAll(@Query() query: any) {
    return this.service.findAll(query);
  }

  @Get('estatisticas')
  @ApiOperation({ summary: 'Estatísticas de equipamentos' })
  getEstatisticas() {
    return this.service.getEstatisticas();
  }

  @Get('garantias-vencendo')
  @ApiOperation({ summary: 'Equipamentos com garantia vencendo' })
  @ApiQuery({ name: 'dias', required: false, example: 30 })
  getGarantias(@Query('dias') dias: number) {
    return this.service.getGarantiasVencendo(dias || 30);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar equipamento por ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles('administrador', 'tecnico_ti')
  @ApiOperation({ summary: 'Cadastrar equipamento' })
  create(@Body() dto: CreateEquipamentoDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @Roles('administrador', 'tecnico_ti')
  @ApiOperation({ summary: 'Atualizar equipamento' })
  update(@Param('id') id: string, @Body() dto: UpdateEquipamentoDto) {
    return this.service.update(id, dto);
  }

  @Patch(':id/vincular/:colaboradorId')
  @Roles('administrador', 'tecnico_ti')
  @ApiOperation({ summary: 'Vincular equipamento a colaborador' })
  vincular(
    @Param('id') id: string,
    @Param('colaboradorId') colaboradorId: string,
  ) {
    return this.service.vincularColaborador(id, colaboradorId);
  }

  @Patch(':id/desvincular')
  @Roles('administrador', 'tecnico_ti')
  @ApiOperation({ summary: 'Desvincular equipamento do colaborador' })
  desvincular(@Param('id') id: string) {
    return this.service.desvincularColaborador(id);
  }

  @Delete(':id')
  @Roles('administrador')
  @ApiOperation({ summary: 'Descartar equipamento' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}

