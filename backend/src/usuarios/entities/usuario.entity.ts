import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 150 })
  nome: string;

  @Column({ length: 200, unique: true })
  email: string;

  @Column({ length: 255 })
  senha_hash: string;

  @Column({
    type: 'enum',
    enum: ['administrador', 'tecnico_ti', 'gestor', 'somente_leitura'],
    default: 'somente_leitura',
  })
  perfil: string;

  @Column({ default: true })
  ativo: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  ultimo_login: Date;

  @Column({ nullable: true })
  reset_token: string;

  @Column({ type: 'timestamptz', nullable: true })
  reset_token_exp: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
