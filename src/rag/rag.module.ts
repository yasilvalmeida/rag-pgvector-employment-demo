import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { RagController } from './rag.controller';
import { RagService } from './rag.service';
import { Document } from '../entities/document.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Document]),
    ConfigModule,
  ],
  controllers: [RagController],
  providers: [RagService],
})
export class RagModule {} 