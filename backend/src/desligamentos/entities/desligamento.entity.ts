import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Colaborador } from '../../colaboradores/entities/colaborador.entity';

@Entity('desligamentos')
export class Desligamento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  colaborador_id: string;

  @ManyToOne(() => Colaborador, { eager: false })
  @JoinColumn({ name: 'colaborador_id' })
  colaborador: Colaborador;

  @Column({ type: 'date' })
  data_desligamento: string;

  @Column({ length: 200, nullable: true })
  motivo: string;

  @Column({
    type: 'enum',
    enum: ['pendente','em_andamento','concluido','cancelado'],
    default: 'pendente',
  })
  status: string;

  @Column({ nullable: true })
  responsavel_ti_id: string;

  @Column({ default: false })
  equipamentos_devolvidos: boolean;

  @Column({ default: false })
  acessos_bloqueados: boolean;

  @Column({ default: false })
  emails_redirecionados: boolean;

  @Column({ default: false })
  backup_realizado: boolean;

  @Column({ default: false })
  documentos_entregues: boolean;

  @Column({ type: 'jsonb', nullable: true })
  checklist_json: any;

  @Column({ type: 'text', nullable: true })
  pendencias: string;

  @Column({ type: 'text', nullable: true })
  observacoes: string;

  @Column({ type: 'timestamptz', nullable: true })
  concluido_em: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
