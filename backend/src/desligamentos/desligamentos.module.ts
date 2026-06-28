import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Desligamento } from './entities/desligamento.entity';
import { DesligamentosService } from './desligamentos.service';
import { DesligamentosController } from './desligamentos.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Desligamento])],
  controllers: [DesligamentosController],
  providers: [DesligamentosService],
  exports: [DesligamentosService],
})
export class DesligamentosModule {}
