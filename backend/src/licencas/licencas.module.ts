import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Licenca } from './entities/licenca.entity';
import { LicencasService } from './licencas.service';
import { LicencasController } from './licencas.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Licenca])],
  controllers: [LicencasController],
  providers: [LicencasService],
  exports: [LicencasService],
})
export class LicencasModule {}
