import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, LessThanOrEqual } from 'typeorm';
import { Estoque } from './entities/estoque.entity';
import { CreateEstoqueDto } from './dto/create-estoque.dto';
import { UpdateEstoqueDto } from './dto/update-estoque.dto';

@Injectable()
export class EstoqueService {
  constructor(
    @InjectRepository(Estoque)
    private repo: Repository<Estoque>,
  ) {}

  async findAll(query: { search?: string; categoria?: string }) {
    const where: any[] = [];
    const base: any = {};
    if (query.categoria) base.categoria = query.categoria;

    if (query.search) {
      where.push({ ...base, nome: ILike(`%${query.search}%`) });
      where.push({ ...base, categoria: ILike(`%${query.search}%`) });
    } else {
      where.push(base);
    }

    return this.repo.find({ where, order: { nome: 'ASC' } });
  }

  async findOne(id: string) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Item de estoque não encontrado');
    return item;
  }

  async create(dto: CreateEstoqueDto) {
    const item = this.repo.create(dto);
    return this.repo.save(item);
  }

  async update(id: string, dto: UpdateEstoqueDto) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Item de estoque não encontrado');
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Item de estoque não encontrado');
    await this.repo.delete(id);
    return { message: 'Item removido com sucesso' };
  }

  async ajustarQuantidade(
    id: string,
    tipo: 'entrada' | 'saida',
    quantidade: number,
    motivo?: string,
  ) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Item de estoque não encontrado');

    if (tipo === 'saida' && item.quantidade < quantidade) {
      throw new BadRequestException(
        `Estoque insuficiente. Disponível: ${item.quantidade}`,
      );
    }

    const novaQtd =
      tipo === 'entrada'
        ? item.quantidade + quantidade
        : item.quantidade - quantidade;

    await this.repo.update(id, { quantidade: novaQtd });
    return this.findOne(id);
  }

  async getAlertasEstoqueBaixo() {
    return this.repo
      .createQueryBuilder('e')
      .where('e.quantidade <= e.quantidade_minima')
      .orderBy('e.quantidade', 'ASC')
      .getMany();
  }

  async getEstatisticas() {
    const total = await this.repo.count();
    const alertas = await this.repo
      .createQueryBuilder('e')
      .where('e.quantidade <= e.quantidade_minima')
      .getCount();

    const valorTotal = await this.repo
      .createQueryBuilder('e')
      .select('SUM(e.quantidade * e.preco_unitario)', 'total')
      .getRawOne();

    const porCategoria = await this.repo
      .createQueryBuilder('e')
      .select('e.categoria', 'categoria')
      .addSelect('COUNT(*)', 'itens')
      .addSelect('SUM(e.quantidade)', 'quantidade')
      .groupBy('e.categoria')
      .getRawMany();

    return {
      total,
      alertas,
      valor_total: valorTotal?.total || 0,
      porCategoria,
    };
  }
}
