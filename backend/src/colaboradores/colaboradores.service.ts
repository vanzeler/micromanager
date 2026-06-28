import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Colaborador } from './entities/colaborador.entity';
import { CreateColaboradorDto } from './dto/create-colaborador.dto';
import { UpdateColaboradorDto } from './dto/update-colaborador.dto';

@Injectable()
export class ColaboradoresService {
  constructor(
    @InjectRepository(Colaborador)
    private repo: Repository<Colaborador>,
  ) {}

  async findAll(query: {
    search?: string;
    status?: string;
    departamento?: string;
    cidade?: string;
    setor?: string;
  }) {
    const where: any[] = [];

    const base: any = {};
    if (query.status) base.status = query.status;
    if (query.departamento) base.departamento = query.departamento;
    if (query.cidade) base.cidade = query.cidade;
    if (query.setor) base.setor = query.setor;

    if (query.search) {
      where.push({ ...base, nome: ILike(`%${query.search}%`) });
      where.push({ ...base, email: ILike(`%${query.search}%`) });
      where.push({ ...base, matricula: ILike(`%${query.search}%`) });
    } else {
      where.push(base);
    }

    return this.repo.find({
      where,
      order: { nome: 'ASC' },
    });
  }

  async findOne(id: string) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Colaborador não encontrado');
    return item;
  }

  async create(dto: CreateColaboradorDto) {
    const existe = await this.repo.findOne({ where: { email: dto.email } });
    if (existe) throw new ConflictException('Email já cadastrado');

    if (dto.matricula) {
      const mat = await this.repo.findOne({ where: { matricula: dto.matricula } });
      if (mat) throw new ConflictException('Matrícula já cadastrada');
    }

    const item = this.repo.create(dto);
    return this.repo.save(item);
  }

  async update(id: string, dto: UpdateColaboradorDto) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Colaborador não encontrado');

    if (dto.email && dto.email !== item.email) {
      const existe = await this.repo.findOne({ where: { email: dto.email } });
      if (existe) throw new ConflictException('Email já cadastrado');
    }

    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Colaborador não encontrado');
    await this.repo.update(id, { status: 'inativo' });
    return { message: 'Colaborador inativado com sucesso' };
  }

  async getEstatisticas() {
    const total = await this.repo.count();
    const ativos = await this.repo.count({ where: { status: 'ativo' } });
    const inativos = await this.repo.count({ where: { status: 'inativo' } });
    const desligados = await this.repo.count({ where: { status: 'desligado' } });
    const afastados = await this.repo.count({ where: { status: 'afastado' } });
    return { total, ativos, inativos, desligados, afastados };
  }

  async getHistoricoEquipamentos(id: string) {
    await this.findOne(id);
    return this.repo.query(
      `SELECT e.codigo, e.tipo, e.marca, e.modelo, e.status,
              m.tipo as tipo_mov, m.data_movimentacao, m.motivo
       FROM movimentacoes m
       LEFT JOIN equipamentos e ON e.id = m.equipamento_id
       WHERE m.colaborador_destino_id = $1 OR m.colaborador_origem_id = $1
       ORDER BY m.data_movimentacao DESC`,
      [id],
    );
  }
}

