import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('colaboradores')
export class Colaborador {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, unique: true, nullable: true })
  matricula: string;

  @Column({ length: 150 })
  nome: string;

  @Column({ length: 200, unique: true })
  email: string;

  @Column({ length: 20, nullable: true })
  telefone: string;

  @Column({ length: 100, nullable: true })
  departamento: string;

  @Column({ length: 100, nullable: true })
  cargo: string;

  @Column({ length: 100, nullable: true })
  cidade: string;

  @Column({ length: 100, nullable: true })
  setor: string;

  @Column({ nullable: true })
  gestor_id: string;

  @Column({ type: 'date', nullable: true })
  data_admissao: string;

  @Column({ type: 'date', nullable: true })
  data_desligamento: string;

  @Column({
    type: 'enum',
    enum: ['ativo', 'inativo', 'desligado', 'afastado'],
    default: 'ativo',
  })
  status: string;

  @Column({ length: 500, nullable: true })
  foto_url: string;

  @Column({ type: 'text', nullable: true })
  observacoes: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
