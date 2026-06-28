import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Colaborador } from '../colaboradores/entities/colaborador.entity';
import { Equipamento } from '../equipamentos/entities/equipamento.entity';
import { Estoque } from '../estoque/entities/estoque.entity';
import { Licenca } from '../licencas/entities/licenca.entity';
import { Desligamento } from '../desligamentos/entities/desligamento.entity';
import { Movimentacao } from '../movimentacoes/entities/movimentacao.entity';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Colaborador,
      Equipamento,
      Estoque,
      Licenca,
      Desligamento,
      Movimentacao,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}

