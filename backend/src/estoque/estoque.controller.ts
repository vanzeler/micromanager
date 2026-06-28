import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  SetMetadata,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { EstoqueService } from './estoque.service';
import { CreateEstoqueDto } from './dto/create-estoque.dto';
import { UpdateEstoqueDto } from './dto/update-estoque.dto';

const Roles = (...roles: string[]) => SetMetadata('roles', roles);

@ApiTags('Estoque')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('estoque')
export class EstoqueController {
  constructor(private service: EstoqueService) {}

  @Get()
  @ApiOperation({ summary: 'Listar itens do estoque' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'categoria', required: false })
  findAll(@Query() query: any) {
    return this.service.findAll(query);
  }

  @Get('estatisticas')
  @ApiOperation({ summary: 'Estatísticas do estoque' })
  getEstatisticas() {
    return this.service.getEstatisticas();
  }

  @Get('alertas')
  @ApiOperation({ summary: 'Itens com estoque abaixo do mínimo' })
  getAlertas() {
    return this.service.getAlertasEstoqueBaixo();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar item por ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles('administrador', 'tecnico_ti')
  @ApiOperation({ summary: 'Cadastrar item no estoque' })
  create(@Body() dto: CreateEstoqueDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @Roles('administrador', 'tecnico_ti')
  @ApiOperation({ summary: 'Atualizar item do estoque' })
  update(@Param('id') id: string, @Body() dto: UpdateEstoqueDto) {
    return this.service.update(id, dto);
  }

  @Patch(':id/ajustar')
  @Roles('administrador', 'tecnico_ti')
  @ApiOperation({ summary: 'Entrada ou saída de estoque' })
  ajustar(
    @Param('id') id: string,
    @Body() body: { tipo: 'entrada' | 'saida'; quantidade: number; motivo?: string },
  ) {
    return this.service.ajustarQuantidade(id, body.tipo, body.quantidade, body.motivo);
  }

  @Delete(':id')
  @Roles('administrador')
  @ApiOperation({ summary: 'Remover item do estoque' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
