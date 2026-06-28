import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('estoque')
export class Estoque {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 150 })
  nome: string;

  @Column({ type: 'text', nullable: true })
  descricao: string;

  @Column({ length: 100, nullable: true })
  categoria: string;

  @Column({ default: 0 })
  quantidade: number;

  @Column({ default: 5 })
  quantidade_minima: number;

  @Column({ length: 30, default: 'unidade' })
  unidade: string;

  @Column({ length: 150, nullable: true })
  localizacao: string;

  @Column({ length: 150, nullable: true })
  fornecedor: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  preco_unitario: number;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
