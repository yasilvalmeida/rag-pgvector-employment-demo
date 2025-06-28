import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryDto {
  @ApiProperty({ 
    description: 'Query text to search for',
    example: 'What is machine learning?'
  })
  @IsString()
  query: string;

  @ApiProperty({ 
    description: 'Number of similar chunks to retrieve',
    example: 5,
    minimum: 1,
    maximum: 20,
    required: false,
    default: 5
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(20)
  limit?: number = 5;
}

export class SourceChunk {
  @ApiProperty({ description: 'Document ID' })
  id: number;

  @ApiProperty({ description: 'Text content of the chunk' })
  content: string;

  @ApiProperty({ description: 'Similarity score' })
  similarity: number;

  @ApiProperty({ description: 'Source of the document' })
  source: string;

  @ApiProperty({ description: 'Chunk index in the original document' })
  chunkIndex: number;

  @ApiProperty({ description: 'Document metadata' })
  metadata: Record<string, any>;
}

export class QueryResponseDto {
  @ApiProperty({ description: 'Generated answer' })
  answer: string;

  @ApiProperty({ description: 'Original query' })
  query: string;

  @ApiProperty({ 
    description: 'Source chunks used for generating the answer',
    type: [SourceChunk]
  })
  sources: SourceChunk[];

  @ApiProperty({ description: 'Processing time in milliseconds' })
  processingTime: number;
} 