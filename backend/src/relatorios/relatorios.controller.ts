import {
  Controller,
  Get,
  Query,
  Res,
  UseGuards,
  SetMetadata,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RelatoriosService } from './relatorios.service';

const Roles = (...roles: string[]) => SetMetadata('roles', roles);

@ApiTags('Relatórios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('relatorios')
export class RelatoriosController {
  constructor(private service: RelatoriosService) {}

  @Get('equipamentos')
  @Roles('administrador', 'tecnico_ti', 'gestor')
  @ApiOperation({ summary: 'Exportar relatório de equipamentos (Excel)' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'tipo', required: false })
  @ApiQuery({ name: 'cidade', required: false })
  async equipamentos(@Query() filtros: any, @Res() res: Response) {
    const buffer = await this.service.gerarRelatorioEquipamentos(filtros);
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=equipamentos.xlsx',
    );
    res.send(buffer);
  }

  @Get('colaboradores')
  @Roles('administrador', 'tecnico_ti', 'gestor')
  @ApiOperation({ summary: 'Exportar relatório de colaboradores (Excel)' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'departamento', required: false })
  @ApiQuery({ name: 'cidade', required: false })
  async colaboradores(@Query() filtros: any, @Res() res: Response) {
    const buffer = await this.service.gerarRelatorioColaboradores(filtros);
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=colaboradores.xlsx',
    );
    res.send(buffer);
  }

  @Get('licencas')
  @Roles('administrador', 'tecnico_ti', 'gestor')
  @ApiOperation({ summary: 'Exportar relatório de licenças (Excel)' })
  async licencas(@Res() res: Response) {
    const buffer = await this.service.gerarRelatorioLicencas();
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=licencas.xlsx',
    );
    res.send(buffer);
  }

  @Get('garantias')
  @Roles('administrador', 'tecnico_ti', 'gestor')
  @ApiOperation({ summary: 'Exportar relatório de garantias vencendo (Excel)' })
  async garantias(@Res() res: Response) {
    const buffer = await this.service.gerarRelatorioGarantias();
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=garantias.xlsx',
    );
    res.send(buffer);
  }

  @Get('desligamentos')
  @Roles('administrador', 'gestor')
  @ApiOperation({ summary: 'Exportar relatório de desligamentos (Excel)' })
  @ApiQuery({ name: 'status', required: false })
  async desligamentos(@Query() filtros: any, @Res() res: Response) {
    const buffer = await this.service.gerarRelatorioDesligamentos(filtros);
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=desligamentos.xlsx',
    );
    res.send(buffer);
  }
}
