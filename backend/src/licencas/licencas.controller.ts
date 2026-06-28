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
import { LicencasService } from './licencas.service';
import { CreateLicencaDto } from './dto/create-licenca.dto';
import { UpdateLicencaDto } from './dto/update-licenca.dto';

const Roles = (...roles: string[]) => SetMetadata('roles', roles);

@ApiTags('Licenças')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('licencas')
export class LicencasController {
  constructor(private service: LicencasService) {}

  @Get()
  @ApiOperation({ summary: 'Listar licenças' })
  @ApiQuery({ name: 'tipo', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'search', required: false })
  findAll(@Query() query: any) {
    return this.service.findAll(query);
  }

  @Get('estatisticas')
  @ApiOperation({ summary: 'Estatísticas de licenças' })
  getEstatisticas() {
    return this.service.getEstatisticas();
  }

  @Get('vencendo')
  @ApiOperation({ summary: 'Licenças próximas do vencimento' })
  @ApiQuery({ name: 'dias', required: false })
  getVencendo(@Query('dias') dias: number) {
    return this.service.getLicencasVencendo(dias || 30);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar licença por ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles('administrador', 'tecnico_ti')
  @ApiOperation({ summary: 'Cadastrar licença' })
  create(@Body() dto: CreateLicencaDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @Roles('administrador', 'tecnico_ti')
  @ApiOperation({ summary: 'Atualizar licença' })
  update(@Param('id') id: string, @Body() dto: UpdateLicencaDto) {
    return this.service.update(id, dto);
  }

  @Patch(':id/atribuir/:colaboradorId')
  @Roles('administrador', 'tecnico_ti')
  @ApiOperation({ summary: 'Atribuir licença a colaborador' })
  atribuir(
    @Param('id') id: string,
    @Param('colaboradorId') colaboradorId: string,
  ) {
    return this.service.atribuirColaborador(id, colaboradorId);
  }

  @Patch(':id/remover-colaborador')
  @Roles('administrador', 'tecnico_ti')
  @ApiOperation({ summary: 'Remover uso de licença' })
  removerColaborador(@Param('id') id: string) {
    return this.service.removerColaborador(id);
  }

  @Delete(':id')
  @Roles('administrador')
  @ApiOperation({ summary: 'Remover licença' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
