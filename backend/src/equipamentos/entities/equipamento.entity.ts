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

@Entity('equipamentos')
export class Equipamento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, unique: true })
  codigo: string;

  @Column({
    type: 'enum',
    enum: [
      'computador','notebook','monitor','impressora','telefone',
      'tablet','nobreak','switch','roteador','servidor','periferico','outro',
    ],
  })
  tipo: string;

  @Column({ length: 100, nullable: true })
  marca: string;

  @Column({ length: 150, nullable: true })
  modelo: string;

  @Column({ length: 150, unique: true, nullable: true })
  numero_serie: string;

  @Column({ length: 100, nullable: true })
  patrimonio: string;

  @Column({
    type: 'enum',
    enum: ['disponivel', 'em_uso', 'manutencao', 'descartado', 'reservado'],
    default: 'disponivel',
  })
  status: string;

  @Column({ nullable: true })
  colaborador_id: string;

  @ManyToOne(() => Colaborador, { nullable: true, eager: false })
  @JoinColumn({ name: 'colaborador_id' })
  colaborador: Colaborador;

  @Column({ length: 100, nullable: true })
  setor: string;

  @Column({ length: 100, nullable: true })
  cidade: string;

  @Column({ length: 150, nullable: true })
  processador: string;

  @Column({ length: 50, nullable: true })
  memoria_ram: string;

  @Column({ length: 100, nullable: true })
  armazenamento: string;

  @Column({ length: 100, nullable: true })
  sistema_operacional: string;

  @Column({ length: 45, nullable: true })
  ip_address: string;

  @Column({ length: 100, nullable: true })
  hostname: string;

  @Column({ type: 'date', nullable: true })
  data_compra: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  valor_compra: number;

  @Column({ length: 100, nullable: true })
  nota_fiscal: string;

  @Column({ type: 'date', nullable: true })
  garantia_ate: string;

  @Column({ length: 150, nullable: true })
  fornecedor: string;

  @Column({ length: 500, nullable: true })
  qr_code: string;

  @Column({ length: 500, nullable: true })
  foto_url: string;

  @Column({ type: 'text', nullable: true })
  observacoes: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
