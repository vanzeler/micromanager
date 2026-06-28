import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { ColaboradoresModule } from './colaboradores/colaboradores.module';
import { EquipamentosModule } from './equipamentos/equipamentos.module';
import { EstoqueModule } from './estoque/estoque.module';
import { MovimentacoesModule } from './movimentacoes/movimentacoes.module';
import { LicencasModule } from './licencas/licencas.module';
import { DesligamentosModule } from './desligamentos/desligamentos.module';
import { LogsModule } from './logs/logs.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { RelatoriosModule } from './relatorios/relatorios.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false,
      logging: process.env.NODE_ENV !== 'production',
    }),
    AuthModule,
    UsuariosModule,
    ColaboradoresModule,
    EquipamentosModule,
    EstoqueModule,
    MovimentacoesModule,
    LicencasModule,
    DesligamentosModule,
    LogsModule,
    DashboardModule,
    RelatoriosModule,
  ],
})
export class AppModule {}
