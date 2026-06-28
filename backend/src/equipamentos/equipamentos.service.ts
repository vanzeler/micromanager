import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, LessThanOrEqual } from 'typeorm';
import * as QRCode from 'qrcode';
import { Equipamento } from './entities/equipamento.entity';
import { CreateEquipamentoDto } from './dto/create-equipamento.dto';
import { UpdateEquipamentoDto } from './dto/update-equipamento.dto';

@Injectable()
export class EquipamentosService {
  constructor(
    @InjectRepository(Equipamento)
    private repo: Repository<Equipamento>,
  ) {}

  async findAll(query: {
    search?: string;
    status?: string;
    tipo?: string;
    cidade?: string;
    setor?: string;
    colaborador_id?: string;
  }) {
    const qb = this.repo
      .createQueryBuilder('e')
      .leftJoinAndSelect('e.colaborador', 'c')
      .orderBy('e.created_at', 'DESC');

    if (query.status) qb.andWhere('e.status = :status', { status: query.status });
    if (query.tipo) qb.andWhere('e.tipo = :tipo', { tipo: query.tipo });
    if (query.cidade) qb.andWhere('e.cidade = :cidade', { cidade: query.cidade });
    if (query.setor) qb.andWhere('e.setor = :setor', { setor: query.setor });
    if (query.colaborador_id) qb.andWhere('e.colaborador_id = :cid', { cid: query.colaborador_id });

    if (query.search) {
      qb.andWhere(
        '(e.codigo ILIKE :s OR e.marca ILIKE :s OR e.modelo ILIKE :s OR e.numero_serie ILIKE :s OR e.hostname ILIKE :s)',
        { s: `%${query.search}%` },
      );
    }

    return qb.getMany();
  }

  async findOne(id: string) {
    const item = await this.repo.findOne({
      where: { id },
      relations: ['colaborador'],
    });
    if (!item) throw new NotFoundException('Equipamento não encontrado');
    return item;
  }

  async create(dto: CreateEquipamentoDto) {
    const existe = await this.repo.findOne({ where: { codigo: dto.codigo } });
    if (existe) throw new ConflictException('Código já cadastrado');

    if (dto.numero_serie) {
      const ns = await this.repo.findOne({ where: { numero_serie: dto.numero_serie } });
      if (ns) throw new ConflictException('Número de série já cadastrado');
    }

    const item = this.repo.create(dto);

    // Gerar QR Code
    const qrData = JSON.stringify({ id: 'novo', codigo: dto.codigo, tipo: dto.tipo });
    item.qr_code = await QRCode.toDataURL(qrData);

    const saved = await this.repo.save(item);

    // Atualizar QR com o ID real
    const qrFinal = JSON.stringify({ id: saved.id, codigo: saved.codigo, tipo: saved.tipo });
    saved.qr_code = await QRCode.toDataURL(qrFinal);
    return this.repo.save(saved);
  }

  async update(id: string, dto: UpdateEquipamentoDto) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Equipamento não encontrado');

    if (dto.codigo && dto.codigo !== item.codigo) {
      const existe = await this.repo.findOne({ where: { codigo: dto.codigo } });
      if (existe) throw new ConflictException('Código já cadastrado');
    }

    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Equipamento não encontrado');
    await this.repo.update(id, { status: 'descartado' });
    return { message: 'Equipamento marcado como descartado' };
  }

  async getGarantiasVencendo(dias: number = 30) {
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() + dias);
    return this.repo
      .createQueryBuilder('e')
      .where('e.garantia_ate IS NOT NULL')
      .andWhere('e.garantia_ate <= :data', { data: dataLimite.toISOString().split('T')[0] })
      .andWhere('e.status != :status', { status: 'descartado' })
      .orderBy('e.garantia_ate', 'ASC')
      .getMany();
  }

  async getEstatisticas() {
    const total = await this.repo.count();
    const disponiveis = await this.repo.count({ where: { status: 'disponivel' } });
    const em_uso = await this.repo.count({ where: { status: 'em_uso' } });
    const manutencao = await this.repo.count({ where: { status: 'manutencao' } });
    const descartados = await this.repo.count({ where: { status: 'descartado' } });

    const porTipo = await this.repo
      .createQueryBuilder('e')
      .select('e.tipo', 'tipo')
      .addSelect('COUNT(*)', 'total')
      .groupBy('e.tipo')
      .getRawMany();

    return { total, disponiveis, em_uso, manutencao, descartados, porTipo };
  }

  async vincularColaborador(id: string, colaborador_id: string) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Equipamento não encontrado');
    await this.repo.update(id, { colaborador_id, status: 'em_uso' });
    return this.findOne(id);
  }

  async desvincularColaborador(id: string) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Equipamento não encontrado');
    await this.repo.update(id, { colaborador_id: null, status: 'disponivel' });
    return this.findOne(id);
  }
}
