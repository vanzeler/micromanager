import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private service: DashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Resumo geral do dashboard' })
  getResumo() {
    return this.service.getResumoGeral();
  }

  @Get('indicadores')
  @ApiOperation({ summary: 'Indicadores principais' })
  getIndicadores() {
    return this.service.getIndicadores();
  }

  @Get('garantias-vencendo')
  @ApiOperation({ summary: 'Equipamentos com garantia vencendo em 30 dias' })
  getGarantias() {
    return this.service.getGarantiasVencendo();
  }

  @Get('licencas-vencendo')
  @ApiOperation({ summary: 'Licenças vencendo em 30 dias' })
  getLicencas() {
    return this.service.getLicencasVencendo();
  }

  @Get('ultimas-movimentacoes')
  @ApiOperation({ summary: 'Últimas movimentações' })
  getMovimentacoes() {
    return this.service.getUltimasMovimentacoes();
  }

  @Get('equipamentos-por-tipo')
  @ApiOperation({ summary: 'Equipamentos agrupados por tipo' })
  getPorTipo() {
    return this.service.getEquipamentosPorTipo();
  }

  @Get('equipamentos-por-cidade')
  @ApiOperation({ summary: 'Equipamentos agrupados por cidade' })
  getPorCidade() {
    return this.service.getEquipamentosPorCidade();
  }

  @Get('movimentacoes-mensais')
  @ApiOperation({ summary: 'Movimentações dos últimos 6 meses' })
  getMovimentacoesMensais() {
    return this.service.getMovimentacoesMensais();
  }

  @Get('alertas-estoque')
  @ApiOperation({ summary: 'Itens com estoque abaixo do mínimo' })
  getAlertasEstoque() {
    return this.service.getAlertasEstoque();
  }
}
