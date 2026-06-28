import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  SetMetadata,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { MovimentacoesService } from './movimentacoes.service';
import { CreateMovimentacaoDto } from './dto/create-movimentacao.dto';

const Roles = (...roles: string[]) => SetMetadata('roles', roles);

@ApiTags('Movimentações')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('movimentacoes')
export class MovimentacoesController {
  constructor(private service: MovimentacoesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar movimentações com filtros' })
  @ApiQuery({ name: 'tipo', required: false })
  @ApiQuery({ name: 'equipamento_id', required: false })
  @ApiQuery({ name: 'colaborador_id', required: false })
  @ApiQuery({ name: 'data_inicio', required: false })
  @ApiQuery({ name: 'data_fim', required: false })
  findAll(@Query() query: any) {
    return this.service.findAll(query);
  }

  @Get('ultimas')
  @ApiOperation({ summary: 'Últimas movimentações' })
  @ApiQuery({ name: 'limit', required: false })
  getUltimas(@Query('limit') limit: number) {
    return this.service.getUltimasMovimentacoes(limit || 10);
  }

  @Get('resumo-mensal')
  @ApiOperation({ summary: 'Resumo mensal de movimentações' })
  getResumoMensal() {
    return this.service.getResumoMensal();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar movimentação por ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles('administrador', 'tecnico_ti')
  @ApiOperation({ summary: 'Registrar movimentação' })
  create(@Body() dto: CreateMovimentacaoDto, @Request() req) {
    return this.service.create(dto, req.user.userId);
  }
}
