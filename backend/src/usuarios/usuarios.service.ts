import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from './entities/usuario.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private repo: Repository<Usuario>,
  ) {}

  async findAll() {
    return this.repo.find({
      select: ['id', 'nome', 'email', 'perfil', 'ativo', 'ultimo_login', 'created_at'],
      order: { nome: 'ASC' },
    });
  }

  async findOne(id: string) {
    const user = await this.repo.findOne({
      where: { id },
      select: ['id', 'nome', 'email', 'perfil', 'ativo', 'ultimo_login', 'created_at'],
    });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }

  async create(dto: CreateUsuarioDto) {
    const existe = await this.repo.findOne({ where: { email: dto.email } });
    if (existe) throw new ConflictException('Email já cadastrado');

    const senha_hash = await bcrypt.hash(dto.senha, 12);
    const user = this.repo.create({
      nome: dto.nome,
      email: dto.email,
      senha_hash,
      perfil: dto.perfil || 'somente_leitura',
    });
    const saved = await this.repo.save(user);
    const { senha_hash: _, ...result } = saved;
    return result;
  }

  async update(id: string, dto: UpdateUsuarioDto) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    if (dto.email && dto.email !== user.email) {
      const existe = await this.repo.findOne({ where: { email: dto.email } });
      if (existe) throw new ConflictException('Email já cadastrado');
    }

    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    await this.repo.update(id, { ativo: false });
    return { message: 'Usuário desativado com sucesso' };
  }

  async resetSenha(id: string, novaSenha: string) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    const senha_hash = await bcrypt.hash(novaSenha, 12);
    await this.repo.update(id, { senha_hash });
    return { message: 'Senha redefinida com sucesso' };
  }
}
