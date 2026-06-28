import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('licencas')
export class Licenca {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ['office','adobe','delphi','visual_studio','teamviewer','antivirus','windows','outro'],
  })
  tipo: string;

  @Column({ length: 150 })
  software: string;

  @Column({ length: 50, nullable: true })
  versao: string;

  @Column({ length: 100, nullable: true })
  fabricante: string;

  @Column({ length: 500, nullable: true })
  chave_licenca: string;

  @Column({ default: 1 })
  quantidade_total: number;

  @Column({ default: 0 })
  quantidade_usada: number;

  @Column({ type: 'date', nullable: true })
  data_compra: string;

  @Column({ type: 'date', nullable: true })
  data_expiracao: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  valor: number;

  @Column({ length: 150, nullable: true })
  fornecedor: string;

  @Column({
    type: 'enum',
    enum: ['ativa','expirada','cancelada','suspensa'],
    default: 'ativa',
  })
  status: string;

  @Column({ type: 'text', nullable: true })
  observacoes: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
