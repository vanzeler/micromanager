import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Equipamento } from '../../equipamentos/entities/equipamento.entity';
import { Colaborador } from '../../colaboradores/entities/colaborador.entity';
import { Estoque } from '../../estoque/entities/estoque.entity';

@Entity('movimentacoes')
export class Movimentacao {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ['entrada','saida','transferencia','manutencao','descarte','emprestimo'],
  })
  tipo: string;

  @Column({ nullable: true })
  equipamento_id: string;

  @ManyToOne(() => Equipamento, { nullable: true, eager: false })
  @JoinColumn({ name: 'equipamento_id' })
  equipamento: Equipamento;

  @Column({ nullable: true })
  estoque_id: string;

  @ManyToOne(() => Estoque, { nullable: true, eager: false })
  @JoinColumn({ name: 'estoque_id' })
  estoque: Estoque;

  @Column({ nullable: true })
  colaborador_origem_id: string;

  @ManyToOne(() => Colaborador, { nullable: true, eager: false })
  @JoinColumn({ name: 'colaborador_origem_id' })
  colaborador_origem: Colaborador;

  @Column({ nullable: true })
  colaborador_destino_id: string;

  @ManyToOne(() => Colaborador, { nullable: true, eager: false })
  @JoinColumn({ name: 'colaborador_destino_id' })
  colaborador_destino: Colaborador;

  @Column({ length: 100, nullable: true })
  setor_origem: string;

  @Column({ length: 100, nullable: true })
  setor_destino: string;

  @Column({ default: 1 })
  quantidade: number;

  @Column({ type: 'timestamptz', default: () => 'NOW()' })
  data_movimentacao: Date;

  @Column({ nullable: true })
  responsavel_id: string;

  @Column({ type: 'text', nullable: true })
  motivo: string;

  @Column({ type: 'text', nullable: true })
  observacoes: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
