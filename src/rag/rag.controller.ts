import { 
  Controller, 
  Post, 
  Body, 
  UseInterceptors, 
  UploadedFile, 
  HttpException, 
  HttpStatus,
  Query
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { RagService } from './rag.service';
import { IngestTextDto, IngestResponseDto } from './dto/ingest.dto';
import { QueryDto, QueryResponseDto } from './dto/query.dto';

@ApiTags('rag')
@Controller('rag')
export class RagController {
  constructor(private readonly ragService: RagService) {}

  @Post('ingest')
  @ApiOperation({ summary: 'Ingest text document for RAG' })
  @ApiResponse({ 
    status: 201, 
    description: 'Document successfully ingested',
    type: IngestResponseDto 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - invalid input' 
  })
  async ingestText(@Body() ingestDto: IngestTextDto): Promise<IngestResponseDto> {
    try {
      return await this.ragService.ingestText(ingestDto);
    } catch (error) {
      throw new HttpException(
        `Failed to ingest text: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('ingest/pdf')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Ingest PDF document for RAG' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'PDF file to upload'
        },
        source: {
          type: 'string',
          description: 'Source identifier (optional)'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'PDF successfully ingested',
    type: IngestResponseDto 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - invalid file or format' 
  })
  async ingestPdf(
    @UploadedFile() file: Express.Multer.File,
    @Body('source') source?: string
  ): Promise<IngestResponseDto> {
    if (!file) {
      throw new HttpException(
        'No file uploaded',
        HttpStatus.BAD_REQUEST
      );
    }

    if (file.mimetype !== 'application/pdf') {
      throw new HttpException(
        'Only PDF files are supported',
        HttpStatus.BAD_REQUEST
      );
    }

    try {
      return await this.ragService.ingestPdf(file, source);
    } catch (error) {
      throw new HttpException(
        `Failed to ingest PDF: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('query')
  @ApiOperation({ summary: 'Query the RAG system' })
  @ApiResponse({ 
    status: 200, 
    description: 'Query processed successfully',
    type: QueryResponseDto 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - invalid query' 
  })
  async query(@Body() queryDto: QueryDto): Promise<QueryResponseDto> {
    try {
      return await this.ragService.query(queryDto);
    } catch (error) {
      throw new HttpException(
        `Failed to process query: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
} 