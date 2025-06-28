import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { OpenAIEmbeddings } from '@langchain/openai';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAI } from 'openai';
import * as pdfParse from 'pdf-parse';
import { Document } from '../entities/document.entity';
import { IngestTextDto, IngestResponseDto } from './dto/ingest.dto';
import { QueryDto, QueryResponseDto, SourceChunk } from './dto/query.dto';

@Injectable()
export class RagService {
  private readonly logger = new Logger(RagService.name);
  private openai: OpenAI;
  private embeddings: OpenAIEmbeddings;
  private textSplitter: RecursiveCharacterTextSplitter;

  constructor(
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
    private configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is required');
    }

    this.openai = new OpenAI({
      apiKey: apiKey,
    });

    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: apiKey,
      modelName: 'text-embedding-3-small',
    });

    this.textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
      separators: ['\n\n', '\n', '. ', ' ', ''],
    });
  }

  async ingestText(ingestDto: IngestTextDto): Promise<IngestResponseDto> {
    const startTime = Date.now();
    
    try {
      this.logger.log(`Starting text ingestion for source: ${ingestDto.source || 'unknown'}`);
      
      // Split text into chunks
      const chunks = await this.textSplitter.splitText(ingestDto.text);
      this.logger.log(`Text split into ${chunks.length} chunks`);

      // Process chunks and create embeddings
      const processedChunks = await this.processChunks(
        chunks,
        ingestDto.source || 'text-input',
        ingestDto.metadata || {}
      );

      // Save to database
      await this.documentRepository.save(processedChunks);

      const processingTime = Date.now() - startTime;
      this.logger.log(`Text ingestion completed in ${processingTime}ms`);

      return {
        success: true,
        message: 'Text successfully ingested and processed',
        chunksProcessed: chunks.length,
        source: ingestDto.source || 'text-input',
      };
    } catch (error) {
      this.logger.error(`Text ingestion failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  async ingestPdf(file: Express.Multer.File, source?: string): Promise<IngestResponseDto> {
    const startTime = Date.now();
    
    try {
      this.logger.log(`Starting PDF ingestion for file: ${file.originalname}`);
      
      // Parse PDF
      const pdfData = await pdfParse(file.buffer);
      const text = pdfData.text;
      
      if (!text || text.trim().length === 0) {
        throw new Error('No text content found in PDF');
      }

      this.logger.log(`Extracted ${text.length} characters from PDF`);

      // Split text into chunks
      const chunks = await this.textSplitter.splitText(text);
      this.logger.log(`PDF text split into ${chunks.length} chunks`);

      // Process chunks and create embeddings
      const processedChunks = await this.processChunks(
        chunks,
        source || file.originalname,
        { 
          filename: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          pages: pdfData.numpages,
        }
      );

      // Save to database
      await this.documentRepository.save(processedChunks);

      const processingTime = Date.now() - startTime;
      this.logger.log(`PDF ingestion completed in ${processingTime}ms`);

      return {
        success: true,
        message: 'PDF successfully ingested and processed',
        chunksProcessed: chunks.length,
        source: source || file.originalname,
      };
    } catch (error) {
      this.logger.error(`PDF ingestion failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  async query(queryDto: QueryDto): Promise<QueryResponseDto> {
    const startTime = Date.now();
    
    try {
      this.logger.log(`Processing query: "${queryDto.query}"`);
      
      // Create embedding for the query
      const queryEmbedding = await this.embeddings.embedQuery(queryDto.query);
      
      // Perform similarity search
      const similarChunks = await this.findSimilarChunks(
        queryEmbedding,
        queryDto.limit || 5
      );

      if (similarChunks.length === 0) {
        this.logger.warn('No similar chunks found for query');
        return {
          answer: 'I don\'t have enough information to answer your question. Please try ingesting more documents first.',
          query: queryDto.query,
          sources: [],
          processingTime: Date.now() - startTime,
        };
      }

      // Generate response using RAG
      const answer = await this.generateResponse(queryDto.query, similarChunks);
      
      // Format source chunks
      const sources: SourceChunk[] = similarChunks.map(chunk => ({
        id: chunk.id,
        content: chunk.content,
        similarity: chunk.similarity,
        source: chunk.source,
        chunkIndex: chunk.chunkIndex,
        metadata: chunk.metadata,
      }));

      const processingTime = Date.now() - startTime;
      this.logger.log(`Query processed in ${processingTime}ms`);

      return {
        answer,
        query: queryDto.query,
        sources,
        processingTime,
      };
    } catch (error) {
      this.logger.error(`Query processing failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async processChunks(
    chunks: string[],
    source: string,
    metadata: Record<string, any>
  ): Promise<Document[]> {
    const documents: Document[] = [];
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      
      if (chunk.trim().length === 0) {
        continue;
      }

      try {
        // Create embedding for the chunk
        const embedding = await this.embeddings.embedQuery(chunk);
        
        const document = new Document();
        document.content = chunk;
        document.embedding = embedding;
        document.source = source;
        document.chunkIndex = i;
        document.metadata = metadata;
        
        documents.push(document);
        
        this.logger.debug(`Processed chunk ${i + 1}/${chunks.length}`);
      } catch (error) {
        this.logger.error(`Failed to process chunk ${i}: ${error.message}`);
        throw error;
      }
    }

    return documents;
  }

  private async findSimilarChunks(
    queryEmbedding: number[],
    limit: number
  ): Promise<Array<Document & { similarity: number }>> {
    const queryVector = `[${queryEmbedding.join(',')}]`;
    
    const query = `
      SELECT 
        *,
        1 - (embedding <=> $1::vector) AS similarity
      FROM documents 
      ORDER BY embedding <=> $1::vector
      LIMIT $2
    `;

    const result = await this.documentRepository.query(query, [queryVector, limit]);
    
    return result.map(row => ({
      ...row,
      similarity: parseFloat(row.similarity),
      chunkIndex: row.chunk_index,
      createdAt: row.created_at,
    }));
  }

  private async generateResponse(
    query: string,
    similarChunks: Array<Document & { similarity: number }>
  ): Promise<string> {
    const context = similarChunks
      .map(chunk => `Source: ${chunk.source}\nContent: ${chunk.content}`)
      .join('\n\n---\n\n');

    const prompt = `You are a helpful assistant that answers questions based on the provided context. 
Use the following pieces of context to answer the question at the end. 
If you don't know the answer based on the context, just say that you don't know, don't try to make up an answer.

Context:
${context}

Question: ${query}

Answer:`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      return response.choices[0]?.message?.content || 'Unable to generate response';
    } catch (error) {
      this.logger.error(`OpenAI API call failed: ${error.message}`);
      throw new Error('Failed to generate response');
    }
  }
} 