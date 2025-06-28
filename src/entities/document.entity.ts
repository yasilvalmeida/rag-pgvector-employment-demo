import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  content: string;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;

  @Column('vector', { 
    nullable: true,
    transformer: {
      to: (value: number[]) => value ? `[${value.join(',')}]` : null,
      from: (value: string) => value ? JSON.parse(value) : null,
    }
  })
  embedding: number[];

  @Column({ nullable: true })
  source?: string;

  @Column({ name: 'chunk_index', nullable: true })
  chunkIndex?: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
} 