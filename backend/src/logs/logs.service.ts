import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Log } from './entities/log.entity';

@Injectable()
export class LogsService {
  constructor(
    @InjectRepository(Log)
    private repo: Repository<Log>,
  ) {}

  async registrar(dados: {
    usuario_id?: string;
    acao: string;
    tabela?: string;
    registro_id?: string;
    dados_anteriores?: any;
    dados_novos?: any;
    ip_address?: string;
    user_agent?: string;
  }) {
    const log = this.repo.create(dados);
    return this.repo.save(log);
  }

  async findAll(query: {
    usuario_id?: string;
    tabela?: string;
    acao?: string;
    data_inicio?: string;
    data_fim?: string;
    page?: number;
    limit?: number;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 50;
    const skip = (page - 1) * limit;

    const qb = this.repo
      .createQueryBuilder('l')
      .leftJoinAndSelect('l.usuario', 'u')
      .orderBy('l.created_at', 'DESC')
      .skip(skip)
      .take(limit);

    if (query.usuario_id) qb.andWhere('l.usuario_id = :uid', { uid: query.usuario_id });
    if (query.tabela) qb.andWhere('l.tabela = :tabela', { tabela: query.tabela });
    if (query.acao) qb.andWhere('l.acao ILIKE :acao', { acao: `%${query.acao}%` });
    if (query.data_inicio) qb.andWhere('l.created_at >= :di', { di: query.data_inicio });
    if (query.data_fim) qb.andWhere('l.created_at <= :df', { df: query.data_fim });

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, pages: Math.ceil(total / limit) };
  }
}
