import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movimentacao } from './entities/movimentacao.entity';
import { CreateMovimentacaoDto } from './dto/create-movimentacao.dto';

@Injectable()
export class MovimentacoesService {
  constructor(
    @InjectRepository(Movimentacao)
    private repo: Repository<Movimentacao>,
  ) {}

  async findAll(query: {
    tipo?: string;
    equipamento_id?: string;
    colaborador_id?: string;
    data_inicio?: string;
    data_fim?: string;
  }) {
    const qb = this.repo
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.equipamento', 'e')
      .leftJoinAndSelect('m.colaborador_origem', 'co')
      .leftJoinAndSelect('m.colaborador_destino', 'cd')
      .orderBy('m.data_movimentacao', 'DESC');

    if (query.tipo) qb.andWhere('m.tipo = :tipo', { tipo: query.tipo });
    if (query.equipamento_id) qb.andWhere('m.equipamento_id = :eid', { eid: query.equipamento_id });
    if (query.colaborador_id) {
      qb.andWhere(
        '(m.colaborador_origem_id = :cid OR m.colaborador_destino_id = :cid)',
        { cid: query.colaborador_id },
      );
    }
    if (query.data_inicio) qb.andWhere('m.data_movimentacao >= :di', { di: query.data_inicio });
    if (query.data_fim) qb.andWhere('m.data_movimentacao <= :df', { df: query.data_fim });

    return qb.getMany();
  }

  async findOne(id: string) {
    const item = await this.repo.findOne({
      where: { id },
      relations: ['equipamento', 'colaborador_origem', 'colaborador_destino'],
    });
    if (!item) throw new NotFoundException('Movimentação não encontrada');
    return item;
  }

  async create(dto: CreateMovimentacaoDto, responsavel_id: string) {
    const item = this.repo.create({ ...dto, responsavel_id });
    return this.repo.save(item);
  }

  async getUltimasMovimentacoes(limit: number = 10) {
    return this.repo
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.equipamento', 'e')
      .leftJoinAndSelect('m.colaborador_destino', 'cd')
      .orderBy('m.data_movimentacao', 'DESC')
      .limit(limit)
      .getMany();
  }

  async getResumoMensal() {
    return this.repo
      .createQueryBuilder('m')
      .select("DATE_TRUNC('month', m.data_movimentacao)", 'mes')
      .addSelect('m.tipo', 'tipo')
      .addSelect('COUNT(*)', 'total')
      .groupBy("DATE_TRUNC('month', m.data_movimentacao), m.tipo")
      .orderBy("DATE_TRUNC('month', m.data_movimentacao)", 'DESC')
      .limit(12)
      .getRawMany();
  }
}
