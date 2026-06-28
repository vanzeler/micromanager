import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Colaborador } from '../colaboradores/entities/colaborador.entity';
import { Equipamento } from '../equipamentos/entities/equipamento.entity';
import { Licenca } from '../licencas/entities/licenca.entity';
import { Desligamento } from '../desligamentos/entities/desligamento.entity';
import { RelatoriosService } from './relatorios.service';
import { RelatoriosController } from './relatorios.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Colaborador,
      Equipamento,
      Licenca,
      Desligamento,
    ]),
  ],
  controllers: [RelatoriosController],
  providers: [RelatoriosService],
})
export class RelatoriosModule {}
