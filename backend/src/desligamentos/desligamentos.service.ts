import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Desligamento } from './entities/desligamento.entity';
import { CreateDesligamentoDto } from './dto/create-desligamento.dto';
import { UpdateDesligamentoDto } from './dto/update-desligamento.dto';

@Injectable()
export class DesligamentosService {
  constructor(
    @InjectRepository(Desligamento)
    private repo: Repository<Desligamento>,
  ) {}

  async findAll(query: { status?: string; colaborador_id?: string }) {
    const qb = this.repo
      .createQueryBuilder('d')
      .leftJoinAndSelect('d.colaborador', 'c')
      .orderBy('d.data_desligamento', 'DESC');

    if (query.status) qb.andWhere('d.status = :status', { status: query.status });
    if (query.colaborador_id) qb.andWhere('d.colaborador_id = :cid', { cid: query.colaborador_id });

    return qb.getMany();
  }

  async findOne(id: string) {
    const item = await this.repo.findOne({
      where: { id },
      relations: ['colaborador'],
    });
    if (!item) throw new NotFoundException('Desligamento não encontrado');
    return item;
  }

  async create(dto: CreateDesligamentoDto, responsavel_id: string) {
    const item = this.repo.create({
      ...dto,
      responsavel_ti_id: responsavel_id,
      checklist_json: {
        equipamentos_devolvidos: false,
        acessos_bloqueados: false,
        emails_redirecionados: false,
        backup_realizado: false,
        documentos_entregues: false,
      },
    });
    return this.repo.save(item);
  }

  async update(id: string, dto: UpdateDesligamentoDto) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Desligamento não encontrado');

    const updateData: any = { ...dto };

    const checklistFields = [
      'equipamentos_devolvidos',
      'acessos_bloqueados',
      'emails_redirecionados',
      'backup_realizado',
      'documentos_entregues',
    ];

    const tudo = checklistFields.every(
      (f) => dto[f] === true || item[f] === true,
    );

    if (dto.status === 'concluido' || tudo) {
      updateData.concluido_em = new Date();
      updateData.status = 'concluido';
    }

    await this.repo.update(id, updateData);
    return this.findOne(id);
  }

  async getChecklist(id: string) {
    const item = await this.findOne(id);
    return {
      id: item.id,
      colaborador: item.colaborador,
      data_desligamento: item.data_desligamento,
      status: item.status,
      checklist: {
        equipamentos_devolvidos: item.equipamentos_devolvidos,
        acessos_bloqueados: item.acessos_bloqueados,
        emails_redirecionados: item.emails_redirecionados,
        backup_realizado: item.backup_realizado,
        documentos_entregues: item.documentos_entregues,
      },
      pendencias: item.pendencias,
      progresso: this.calcularProgresso(item),
    };
  }

  private calcularProgresso(item: Desligamento): number {
    const campos = [
      item.equipamentos_devolvidos,
      item.acessos_bloqueados,
      item.emails_redirecionados,
      item.backup_realizado,
      item.documentos_entregues,
    ];
    const concluidos = campos.filter(Boolean).length;
    return Math.round((concluidos / campos.length) * 100);
  }

  async getPendentes() {
    return this.repo
      .createQueryBuilder('d')
      .leftJoinAndSelect('d.colaborador', 'c')
      .where("d.status IN ('pendente', 'em_andamento')")
      .orderBy('d.data_desligamento', 'ASC')
      .getMany();
  }
}

