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
import { ColaboradoresService } from './colaboradores.service';
import { CreateColaboradorDto } from './dto/create-colaborador.dto';
import { UpdateColaboradorDto } from './dto/update-colaborador.dto';

const Roles = (...roles: string[]) => SetMetadata('roles', roles);

@ApiTags('Colaboradores')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('colaboradores')
export class ColaboradoresController {
  constructor(private service: ColaboradoresService) {}

  @Get()
  @ApiOperation({ summary: 'Listar colaboradores com filtros' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'departamento', required: false })
  @ApiQuery({ name: 'cidade', required: false })
  @ApiQuery({ name: 'setor', required: false })
  findAll(@Query() query: any) {
    return this.service.findAll(query);
  }

  @Get('estatisticas')
  @ApiOperation({ summary: 'Estatísticas de colaboradores' })
  getEstatisticas() {
    return this.service.getEstatisticas();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar colaborador por ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Get(':id/historico-equipamentos')
  @ApiOperation({ summary: 'Histórico de equipamentos do colaborador' })
  getHistorico(@Param('id') id: string) {
    return this.service.getHistoricoEquipamentos(id);
  }

  @Post()
  @Roles('administrador', 'tecnico_ti')
  @ApiOperation({ summary: 'Criar colaborador' })
  create(@Body() dto: CreateColaboradorDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @Roles('administrador', 'tecnico_ti')
  @ApiOperation({ summary: 'Atualizar colaborador' })
  update(@Param('id') id: string, @Body() dto: UpdateColaboradorDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles('administrador')
  @ApiOperation({ summary: 'Inativar colaborador' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
