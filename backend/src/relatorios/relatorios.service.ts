import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as ExcelJS from 'exceljs';
import { Colaborador } from '../colaboradores/entities/colaborador.entity';
import { Equipamento } from '../equipamentos/entities/equipamento.entity';
import { Licenca } from '../licencas/entities/licenca.entity';
import { Desligamento } from '../desligamentos/entities/desligamento.entity';

@Injectable()
export class RelatoriosService {
  constructor(
    @InjectRepository(Colaborador)
    private colaboradorRepo: Repository<Colaborador>,
    @InjectRepository(Equipamento)
    private equipamentoRepo: Repository<Equipamento>,
    @InjectRepository(Licenca)
    private licencaRepo: Repository<Licenca>,
    @InjectRepository(Desligamento)
    private desligamentoRepo: Repository<Desligamento>,
  ) {}

  private configurarCabecalho(worksheet: ExcelJS.Worksheet) {
    const row = worksheet.getRow(1);
    row.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    row.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E3A5F' },
    } as ExcelJS.Fill;
    row.alignment = { vertical: 'middle', horizontal: 'center' };
    row.height = 28;
    worksheet.columns.forEach((col) => {
      col.width = 22;
    });
  }

  async gerarRelatorioEquipamentos(filtros: any): Promise<any> {
    const qb = this.equipamentoRepo
      .createQueryBuilder('e')
      .leftJoinAndSelect('e.colaborador', 'c')
      .orderBy('e.tipo', 'ASC')
      .addOrderBy('e.codigo', 'ASC');

    if (filtros.status) qb.andWhere('e.status = :status', { status: filtros.status });
    if (filtros.tipo) qb.andWhere('e.tipo = :tipo', { tipo: filtros.tipo });
    if (filtros.cidade) qb.andWhere('e.cidade = :cidade', { cidade: filtros.cidade });

    const dados = await qb.getMany();

    const workbook = new ExcelJS.Workbook();
    const ws = workbook.addWorksheet('Equipamentos');

    ws.columns = [
      { header: 'Código', key: 'codigo', width: 15 },
      { header: 'Tipo', key: 'tipo', width: 15 },
      { header: 'Marca', key: 'marca', width: 15 },
      { header: 'Modelo', key: 'modelo', width: 20 },
      { header: 'Número de Série', key: 'numero_serie', width: 20 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Colaborador', key: 'colaborador', width: 25 },
      { header: 'Setor', key: 'setor', width: 18 },
      { header: 'Cidade', key: 'cidade', width: 15 },
      { header: 'Garantia até', key: 'garantia_ate', width: 15 },
      { header: 'Valor (R$)', key: 'valor_compra', width: 15 },
    ];

    this.configurarCabecalho(ws);

    dados.forEach((e) => {
      ws.addRow({
        codigo: e.codigo,
        tipo: e.tipo,
        marca: e.marca || '-',
        modelo: e.modelo || '-',
        numero_serie: e.numero_serie || '-',
        status: e.status,
        colaborador: e.colaborador?.nome || 'Sem vínculo',
        setor: e.setor || '-',
        cidade: e.cidade || '-',
        garantia_ate: e.garantia_ate || '-',
        valor_compra: e.valor_compra ? Number(e.valor_compra).toFixed(2) : '-',
      });
    });

    return workbook.xlsx.writeBuffer();
  }

  async gerarRelatorioColaboradores(filtros: any): Promise<any> {
    const qb = this.colaboradorRepo
      .createQueryBuilder('c')
      .orderBy('c.nome', 'ASC');

    if (filtros.status) qb.andWhere('c.status = :status', { status: filtros.status });
    if (filtros.departamento) qb.andWhere('c.departamento = :dep', { dep: filtros.departamento });
    if (filtros.cidade) qb.andWhere('c.cidade = :cidade', { cidade: filtros.cidade });

    const dados = await qb.getMany();

    const workbook = new ExcelJS.Workbook();
    const ws = workbook.addWorksheet('Colaboradores');

    ws.columns = [
      { header: 'Matrícula', key: 'matricula', width: 12 },
      { header: 'Nome', key: 'nome', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Departamento', key: 'departamento', width: 18 },
      { header: 'Cargo', key: 'cargo', width: 20 },
      { header: 'Setor', key: 'setor', width: 18 },
      { header: 'Cidade', key: 'cidade', width: 15 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Admissão', key: 'data_admissao', width: 15 },
    ];

    this.configurarCabecalho(ws);

    dados.forEach((c) => {
      ws.addRow({
        matricula: c.matricula || '-',
        nome: c.nome,
        email: c.email,
        departamento: c.departamento || '-',
        cargo: c.cargo || '-',
        setor: c.setor || '-',
        cidade: c.cidade || '-',
        status: c.status,
        data_admissao: c.data_admissao || '-',
      });
    });

    return workbook.xlsx.writeBuffer();
  }

  async gerarRelatorioLicencas(): Promise<any> {
    const dados = await this.licencaRepo.find({ order: { software: 'ASC' } });

    const workbook = new ExcelJS.Workbook();
    const ws = workbook.addWorksheet('Licenças');

    ws.columns = [
      { header: 'Software', key: 'software', width: 25 },
      { header: 'Tipo', key: 'tipo', width: 15 },
      { header: 'Versão', key: 'versao', width: 10 },
      { header: 'Fabricante', key: 'fabricante', width: 18 },
      { header: 'Total', key: 'quantidade_total', width: 10 },
      { header: 'Em uso', key: 'quantidade_usada', width: 10 },
      { header: 'Disponíveis', key: 'disponiveis', width: 12 },
      { header: 'Validade', key: 'data_expiracao', width: 15 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Valor (R$)', key: 'valor', width: 15 },
    ];

    this.configurarCabecalho(ws);

    dados.forEach((l) => {
      const row = ws.addRow({
        software: l.software,
        tipo: l.tipo,
        versao: l.versao || '-',
        fabricante: l.fabricante || '-',
        quantidade_total: l.quantidade_total,
        quantidade_usada: l.quantidade_usada,
        disponiveis: l.quantidade_total - l.quantidade_usada,
        data_expiracao: l.data_expiracao || '-',
        status: l.status,
        valor: l.valor ? Number(l.valor).toFixed(2) : '-',
      });

      if (l.status === 'expirada') {
        row.font = { color: { argb: 'FFCC0000' } };
      }
    });

    return workbook.xlsx.writeBuffer();
  }

  async gerarRelatorioGarantias(): Promise<any> {
    const data90 = new Date();
    data90.setDate(data90.getDate() + 90);

    const dados = await this.equipamentoRepo
      .createQueryBuilder('e')
      .leftJoinAndSelect('e.colaborador', 'c')
      .where('e.garantia_ate IS NOT NULL')
      .andWhere('e.garantia_ate <= :data', {
        data: data90.toISOString().split('T')[0],
      })
      .andWhere("e.status != 'descartado'")
      .orderBy('e.garantia_ate', 'ASC')
      .getMany();

    const workbook = new ExcelJS.Workbook();
    const ws = workbook.addWorksheet('Garantias');

    ws.columns = [
      { header: 'Código', key: 'codigo', width: 12 },
      { header: 'Tipo', key: 'tipo', width: 15 },
      { header: 'Marca/Modelo', key: 'modelo', width: 25 },
      { header: 'Número de Série', key: 'numero_serie', width: 20 },
      { header: 'Colaborador', key: 'colaborador', width: 25 },
      { header: 'Cidade', key: 'cidade', width: 15 },
      { header: 'Garantia até', key: 'garantia_ate', width: 15 },
      { header: 'Situação', key: 'situacao', width: 15 },
    ];

    this.configurarCabecalho(ws);

    const hoje = new Date().toISOString().split('T')[0];

    dados.forEach((e) => {
      const row = ws.addRow({
        codigo: e.codigo,
        tipo: e.tipo,
        modelo: `${e.marca || ''} ${e.modelo || ''}`.trim(),
        numero_serie: e.numero_serie || '-',
        colaborador: e.colaborador?.nome || 'Sem vínculo',
        cidade: e.cidade || '-',
        garantia_ate: e.garantia_ate,
        situacao: e.garantia_ate < hoje ? 'VENCIDA' : 'Vencendo',
      });

      if (e.garantia_ate < hoje) {
        row.font = { color: { argb: 'FFCC0000' }, bold: true };
      }
    });

    return workbook.xlsx.writeBuffer();
  }

  async gerarRelatorioDesligamentos(filtros: any): Promise<any> {
    const qb = this.desligamentoRepo
      .createQueryBuilder('d')
      .leftJoinAndSelect('d.colaborador', 'c')
      .orderBy('d.data_desligamento', 'DESC');

    if (filtros.status) qb.andWhere('d.status = :status', { status: filtros.status });

    const dados = await qb.getMany();

    const workbook = new ExcelJS.Workbook();
    const ws = workbook.addWorksheet('Desligamentos');

    ws.columns = [
      { header: 'Colaborador', key: 'colaborador', width: 25 },
      { header: 'Data Desligamento', key: 'data_desligamento', width: 18 },
      { header: 'Motivo', key: 'motivo', width: 25 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Equip. Devolvidos', key: 'equipamentos', width: 18 },
      { header: 'Acessos Bloqueados', key: 'acessos', width: 18 },
      { header: 'Backup Realizado', key: 'backup', width: 16 },
      { header: 'Docs Entregues', key: 'docs', width: 15 },
      { header: 'Pendências', key: 'pendencias', width: 30 },
    ];

    this.configurarCabecalho(ws);

    dados.forEach((d) => {
      ws.addRow({
        colaborador: d.colaborador?.nome || '-',
        data_desligamento: d.data_desligamento,
        motivo: d.motivo || '-',
        status: d.status,
        equipamentos: d.equipamentos_devolvidos ? 'Sim' : 'Não',
        acessos: d.acessos_bloqueados ? 'Sim' : 'Não',
        backup: d.backup_realizado ? 'Sim' : 'Não',
        docs: d.documentos_entregues ? 'Sim' : 'Não',
        pendencias: d.pendencias || '-',
      });
    });

    return workbook.xlsx.writeBuffer();
  }
}