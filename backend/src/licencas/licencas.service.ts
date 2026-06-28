import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Licenca } from './entities/licenca.entity';
import { CreateLicencaDto } from './dto/create-licenca.dto';
import { UpdateLicencaDto } from './dto/update-licenca.dto';

@Injectable()
export class LicencasService {
  constructor(
    @InjectRepository(Licenca)
    private repo: Repository<Licenca>,
  ) {}

  async findAll(query: { tipo?: string; status?: string; search?: string }) {
    const qb = this.repo
      .createQueryBuilder('l')
      .orderBy('l.software', 'ASC');

    if (query.tipo) qb.andWhere('l.tipo = :tipo', { tipo: query.tipo });
    if (query.status) qb.andWhere('l.status = :status', { status: query.status });
    if (query.search) {
      qb.andWhere('(l.software ILIKE :s OR l.fabricante ILIKE :s)', {
        s: `%${query.search}%`,
      });
    }

    return qb.getMany();
  }

  async findOne(id: string) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Licença não encontrada');
    return item;
  }

  async create(dto: CreateLicencaDto) {
    const item = this.repo.create(dto);
    return this.repo.save(item);
  }

  async update(id: string, dto: UpdateLicencaDto) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Licença não encontrada');
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Licença não encontrada');
    await this.repo.delete(id);
    return { message: 'Licença removida com sucesso' };
  }

  async atribuirColaborador(licencaId: string, colaboradorId: string) {
    const licenca = await this.repo.findOne({ where: { id: licencaId } });
    if (!licenca) throw new NotFoundException('Licença não encontrada');

    const disponiveis = licenca.quantidade_total - licenca.quantidade_usada;
    if (disponiveis <= 0) {
      throw new BadRequestException('Não há licenças disponíveis');
    }

    await this.repo.update(licencaId, {
      quantidade_usada: licenca.quantidade_usada + 1,
    });

    return this.findOne(licencaId);
  }

  async removerColaborador(licencaId: string) {
    const licenca = await this.repo.findOne({ where: { id: licencaId } });
    if (!licenca) throw new NotFoundException('Licença não encontrada');

    const nova = Math.max(0, licenca.quantidade_usada - 1);
    await this.repo.update(licencaId, { quantidade_usada: nova });
    return this.findOne(licencaId);
  }

  async getLicencasVencendo(dias: number = 30) {
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() + dias);
    return this.repo
      .createQueryBuilder('l')
      .where('l.data_expiracao IS NOT NULL')
      .andWhere('l.data_expiracao <= :data', {
        data: dataLimite.toISOString().split('T')[0],
      })
      .andWhere("l.status = 'ativa'")
      .orderBy('l.data_expiracao', 'ASC')
      .getMany();
  }

  async getEstatisticas() {
    const total = await this.repo.count();
    const ativas = await this.repo.count({ where: { status: 'ativa' } });
    const expiradas = await this.repo.count({ where: { status: 'expirada' } });

    const totalLicencas = await this.repo
      .createQueryBuilder('l')
      .select('SUM(l.quantidade_total)', 'total')
      .addSelect('SUM(l.quantidade_usada)', 'usadas')
      .getRawOne();

    const porTipo = await this.repo
      .createQueryBuilder('l')
      .select('l.tipo', 'tipo')
      .addSelect('COUNT(*)', 'total')
      .addSelect('SUM(l.quantidade_total)', 'licencas')
      .addSelect('SUM(l.quantidade_usada)', 'usadas')
      .groupBy('l.tipo')
      .getRawMany();

    return {
      total,
      ativas,
      expiradas,
      total_licencas: totalLicencas?.total || 0,
      total_usadas: totalLicencas?.usadas || 0,
      porTipo,
    };
  }
}
