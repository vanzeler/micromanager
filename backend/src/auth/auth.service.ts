import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from '../usuarios/entities/usuario.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepo: Repository<Usuario>,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, senha: string): Promise<any> {
    const user = await this.usuarioRepo.findOne({
      where: { email, ativo: true },
    });
    if (user && (await bcrypt.compare(senha, user.senha_hash))) {
      const { senha_hash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    await this.usuarioRepo.update(user.id, { ultimo_login: new Date() });
    const payload = {
      sub: user.id,
      email: user.email,
      perfil: user.perfil,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        perfil: user.perfil,
      },
    };
  }

  async me(userId: string) {
    return this.usuarioRepo.findOne({
      where: { id: userId },
      select: ['id', 'nome', 'email', 'perfil', 'ultimo_login', 'created_at'],
    });
  }

  async changePassword(userId: string, senhaAtual: string, novaSenha: string) {
    const user = await this.usuarioRepo.findOne({ where: { id: userId } });
    if (!user || !(await bcrypt.compare(senhaAtual, user.senha_hash))) {
      throw new UnauthorizedException('Senha atual incorreta');
    }
    const hash = await bcrypt.hash(novaSenha, 12);
    await this.usuarioRepo.update(userId, { senha_hash: hash });
    return { message: 'Senha alterada com sucesso' };
  }
}
