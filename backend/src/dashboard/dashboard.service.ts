import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Colaborador } from '../colaboradores/entities/colaborador.entity';
import { Equipamento } from '../equipamentos/entities/equipamento.entity';
import { Estoque } from '../estoque/entities/estoque.entity';
import { Licenca } from '../licencas/entities/licenca.entity';
import { Desligamento } from '../desligamentos/entities/desligamento.entity';
import { Movimentacao } from '../movimentacoes/entities/movimentacao.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Colaborador)
    private colaboradorRepo: Repository<Colaborador>,
    @InjectRepository(Equipamento)
    private equipamentoRepo: Repository<Equipamento>,
    @InjectRepository(Estoque)
    private estoqueRepo: Repository<Estoque>,
    @InjectRepository(Licenca)
    private licencaRepo: Repository<Licenca>,
    @InjectRepository(Desligamento)
    private desligamentoRepo: Repository<Desligamento>,
    @InjectRepository(Movimentacao)
    private movimentacaoRepo: Repository<Movimentacao>,
  ) {}

  async getIndicadores() {
    const [
      totalColaboradores,
      colaboradoresAtivos,
      totalEquipamentos,
      equipamentosDisponiveis,
      equipamentosEmUso,
      equipamentosManutencao,
      totalEstoque,
      alertasEstoque,
      totalLicencas,
      licencasExpiradas,
      desligamentosPendentes,
    ] = await Promise.all([
      this.colaboradorRepo.count(),
      this.colaboradorRepo.count({ where: { status: 'ativo' } }),
      this.equipamentoRepo.count(),
      this.equipamentoRepo.count({ where: { status: 'disponivel' } }),
      this.equipamentoRepo.count({ where: { status: 'em_uso' } }),
      this.equipamentoRepo.count({ where: { status: 'manutencao' } }),
      this.estoqueRepo.count(),
      this.estoqueRepo
        .createQueryBuilder('e')
        .where('e.quantidade <= e.quantidade_minima')
        .getCount(),
      this.licencaRepo.count({ where: { status: 'ativa' } }),
      this.licencaRepo.count({ where: { status: 'expirada' } }),
      this.desligamentoRepo
        .createQueryBuilder('d')
        .where("d.status IN ('pendente', 'em_andamento')")
        .getCount(),
    ]);

    return {
      colaboradores: {
        total: totalColaboradores,
        ativos: colaboradoresAtivos,
        inativos: totalColaboradores - colaboradoresAtivos,
      },
      equipamentos: {
        total: totalEquipamentos,
        disponiveis: equipamentosDisponiveis,
        em_uso: equipamentosEmUso,
        manutencao: equipamentosManutencao,
      },
      estoque: {
        total: totalEstoque,
        alertas: alertasEstoque,
      },
      licencas: {
        ativas: totalLicencas,
        expiradas: licencasExpiradas,
      },
      desligamentos: {
        pendentes: desligamentosPendentes,
      },
    };
  }

  async getGarantiasVencendo() {
    const data30 = new Date();
    data30.setDate(data30.getDate() + 30);
    return this.equipamentoRepo
      .createQueryBuilder('e')
      .where('e.garantia_ate IS NOT NULL')
      .andWhere('e.garantia_ate <= :data', {
        data: data30.toISOString().split('T')[0],
      })
      .andWhere("e.status != 'descartado'")
      .orderBy('e.garantia_ate', 'ASC')
      .limit(10)
      .getMany();
  }

  async getLicencasVencendo() {
    const data30 = new Date();
    data30.setDate(data30.getDate() + 30);
    return this.licencaRepo
      .createQueryBuilder('l')
      .where('l.data_expiracao IS NOT NULL')
      .andWhere('l.data_expiracao <= :data', {
        data: data30.toISOString().split('T')[0],
      })
      .andWhere("l.status = 'ativa'")
      .orderBy('l.data_expiracao', 'ASC')
      .limit(10)
      .getMany();
  }

  async getUltimasMovimentacoes() {
    return this.movimentacaoRepo
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.equipamento', 'e')
      .leftJoinAndSelect('m.colaborador_destino', 'cd')
      .leftJoinAndSelect('m.colaborador_origem', 'co')
      .orderBy('m.data_movimentacao', 'DESC')
      .limit(8)
      .getMany();
  }

  async getEquipamentosPorTipo() {
    return this.equipamentoRepo
      .createQueryBuilder('e')
      .select('e.tipo', 'tipo')
      .addSelect('COUNT(*)', 'total')
      .groupBy('e.tipo')
      .orderBy('total', 'DESC')
      .getRawMany();
  }

  async getEquipamentosPorCidade() {
    return this.equipamentoRepo
      .createQueryBuilder('e')
      .select('e.cidade', 'cidade')
      .addSelect('COUNT(*)', 'total')
      .where('e.cidade IS NOT NULL')
      .groupBy('e.cidade')
      .orderBy('total', 'DESC')
      .getRawMany();
  }

  async getMovimentacoesMensais() {
    return this.movimentacaoRepo
      .createQueryBuilder('m')
      .select("TO_CHAR(DATE_TRUNC('month', m.data_movimentacao), 'MM/YYYY')", 'mes')
      .addSelect('COUNT(*)', 'total')
      .where("m.data_movimentacao >= NOW() - INTERVAL '6 months'")
      .groupBy("DATE_TRUNC('month', m.data_movimentacao)")
      .orderBy("DATE_TRUNC('month', m.data_movimentacao)", 'ASC')
      .getRawMany();
  }

  async getAlertasEstoque() {
    return this.estoqueRepo
      .createQueryBuilder('e')
      .where('e.quantidade <= e.quantidade_minima')
      .orderBy('e.quantidade', 'ASC')
      .limit(8)
      .getMany();
  }

  async getResumoGeral() {
    const [
      indicadores,
      garantiasVencendo,
      licencasVencendo,
      ultimasMovimentacoes,
      equipamentosPorTipo,
      equipamentosPorCidade,
      movimentacoesMensais,
      alertasEstoque,
    ] = await Promise.all([
      this.getIndicadores(),
      this.getGarantiasVencendo(),
      this.getLicencasVencendo(),
      this.getUltimasMovimentacoes(),
      this.getEquipamentosPorTipo(),
      this.getEquipamentosPorCidade(),
      this.getMovimentacoesMensais(),
      this.getAlertasEstoque(),
    ]);

    return {
      indicadores,
      alertas: {
        garantias_vencendo: garantiasVencendo,
        licencas_vencendo: licencasVencendo,
        estoque_baixo: alertasEstoque,
      },
      graficos: {
        equipamentos_por_tipo: equipamentosPorTipo,
        equipamentos_por_cidade: equipamentosPorCidade,
        movimentacoes_mensais: movimentacoesMensais,
      },
      ultimas_movimentacoes: ultimasMovimentacoes,
    };
  }
}
