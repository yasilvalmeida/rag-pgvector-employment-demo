import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class IngestTextDto {
  @ApiProperty({ 
    description: 'Text content to ingest',
    example: 'This is a sample text document about artificial intelligence and machine learning.'
  })
  @IsString()
  text: string;

  @ApiProperty({ 
    description: 'Source identifier for the document',
    example: 'manual-text-input',
    required: false
  })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiProperty({ 
    description: 'Additional metadata as JSON',
    example: { author: 'John Doe', category: 'AI' },
    required: false
  })
  @IsOptional()
  metadata?: Record<string, any>;
}

export class IngestResponseDto {
  @ApiProperty({ description: 'Success status' })
  success: boolean;

  @ApiProperty({ description: 'Success message' })
  message: string;

  @ApiProperty({ description: 'Number of chunks processed' })
  chunksProcessed: number;

  @ApiProperty({ description: 'Document source' })
  source: string;
} 