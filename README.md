# RAG Service with NestJS, OpenAI & pgvector

A production-ready Retrieval-Augmented Generation (RAG) service built with NestJS, OpenAI embeddings, and PostgreSQL with pgvector extension.

## Features

- 📄 **Document Ingestion**: Support for text and PDF document processing
- 🔍 **Vector Search**: Efficient similarity search using pgvector
- 🤖 **RAG Responses**: Context-aware answers using OpenAI GPT models
- 📚 **API Documentation**: Interactive Swagger UI
- 🐳 **Docker Ready**: Complete Docker Compose setup
- ⚡ **Production Ready**: Built with NestJS framework

## Tech Stack

- **Backend**: NestJS with TypeScript
- **Database**: PostgreSQL with pgvector extension
- **Embeddings**: OpenAI text-embedding-3-small
- **LLM**: OpenAI GPT-3.5-turbo
- **Document Processing**: LangChain, pdf-parse
- **API Docs**: Swagger/OpenAPI
- **Containerization**: Docker & Docker Compose

## Quick Start

### Prerequisites

- Node.js 18+ or Docker
- OpenAI API key

### 1. Clone and Setup

```bash
git clone <repository-url>
cd rag-pgvector-employment-demo
```

### 2. Environment Configuration

Create a `.env` file:

```bash
# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=rag_user
DATABASE_PASSWORD=rag_password
DATABASE_NAME=rag_database

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Application Configuration
PORT=3000
```

### 3. Run with Docker (Recommended)

```bash
# Start the complete stack
docker-compose up -d

# Check logs
docker-compose logs -f app
```

### 4. Run Locally

```bash
# Install dependencies
npm install

# Start PostgreSQL with pgvector (using Docker)
docker-compose up -d postgres

# Start the application
npm run start:dev
```

## API Endpoints

The service will be available at `http://localhost:3000`

### Health Check
- **GET** `/` - Health check endpoint

### Document Ingestion
- **POST** `/rag/ingest` - Ingest text content
- **POST** `/rag/ingest/pdf` - Upload and ingest PDF files

### Query
- **POST** `/rag/query` - Query the RAG system

### API Documentation
- **GET** `/api/docs` - Interactive Swagger documentation

## Example Usage

### 1. Ingest Text Content

```bash
curl -X POST http://localhost:3000/rag/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Artificial Intelligence (AI) is a branch of computer science that aims to create intelligent machines that can perform tasks that typically require human intelligence. Machine Learning is a subset of AI that enables computers to learn and improve from experience without being explicitly programmed. Deep Learning is a subset of Machine Learning that uses neural networks with multiple layers to model and understand complex patterns in data.",
    "source": "ai-basics-document",
    "metadata": {
      "author": "Tech Writer",
      "category": "AI Fundamentals",
      "tags": ["AI", "ML", "Deep Learning"]
    }
  }'
```

### 2. Ingest PDF Document

```bash
curl -X POST http://localhost:3000/rag/ingest/pdf \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/your/document.pdf" \
  -F "source=technical-manual"
```

### 3. Query the System

```bash
curl -X POST http://localhost:3000/rag/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is the difference between AI and Machine Learning?",
    "limit": 5
  }'
```

### 4. Complex Query Example

```bash
curl -X POST http://localhost:3000/rag/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "How does deep learning work and what are its applications?",
    "limit": 3
  }'
```

## API Response Examples

### Ingestion Response
```json
{
  "success": true,
  "message": "Text successfully ingested and processed",
  "chunksProcessed": 3,
  "source": "ai-basics-document"
}
```

### Query Response
```json
{
  "answer": "AI and Machine Learning are related but distinct concepts. Artificial Intelligence (AI) is a broad branch of computer science that aims to create intelligent machines capable of performing tasks that typically require human intelligence. Machine Learning (ML) is actually a subset of AI that focuses on enabling computers to learn and improve from experience without being explicitly programmed. In essence, ML is one of the methods used to achieve AI.",
  "query": "What is the difference between AI and Machine Learning?",
  "sources": [
    {
      "id": 1,
      "content": "Artificial Intelligence (AI) is a branch of computer science that aims to create intelligent machines...",
      "similarity": 0.89,
      "source": "ai-basics-document",
      "chunkIndex": 0,
      "metadata": {
        "author": "Tech Writer",
        "category": "AI Fundamentals"
      }
    }
  ],
  "processingTime": 1250
}
```

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client App    │    │   NestJS API    │    │   PostgreSQL    │
│                 │───▶│                 │───▶│   + pgvector    │
│  (Web/Mobile)   │    │  RAG Service    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   OpenAI API    │
                       │  (Embeddings    │
                       │   + ChatGPT)    │
                       └─────────────────┘
```

## Development

### Project Structure

```
src/
├── app.module.ts          # Main application module
├── main.ts               # Application entry point
├── entities/
│   └── document.entity.ts # Document entity for database
└── rag/
    ├── rag.module.ts     # RAG module
    ├── rag.service.ts    # Core RAG logic
    ├── rag.controller.ts # API endpoints
    └── dto/              # Data transfer objects
```

### Key Components

1. **Document Processing**: Chunks text using LangChain's RecursiveCharacterTextSplitter
2. **Embedding Generation**: Uses OpenAI's text-embedding-3-small model
3. **Vector Storage**: Stores embeddings in PostgreSQL with pgvector
4. **Similarity Search**: Performs cosine similarity search using pgvector
5. **Response Generation**: Uses OpenAI GPT-3.5-turbo for contextual answers

### Available Scripts

```bash
npm run start:dev     # Start in development mode
npm run build         # Build for production
npm run start:prod    # Start production server
npm run test          # Run tests
npm run lint          # Lint code
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_HOST` | PostgreSQL host | localhost |
| `DATABASE_PORT` | PostgreSQL port | 5432 |
| `DATABASE_USERNAME` | Database username | rag_user |
| `DATABASE_PASSWORD` | Database password | rag_password |
| `DATABASE_NAME` | Database name | rag_database |
| `OPENAI_API_KEY` | OpenAI API key | Required |
| `PORT` | Application port | 3000 |

### Chunking Configuration

The text splitter can be configured in `rag.service.ts`:

```typescript
this.textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,        // Maximum chunk size
  chunkOverlap: 200,      // Overlap between chunks
  separators: ['\n\n', '\n', '. ', ' ', ''], // Split separators
});
```

## Monitoring and Logs

View application logs:

```bash
# Docker logs
docker-compose logs -f app

# Local development
# Logs are displayed in the console
```

## Troubleshooting

### Common Issues

1. **OpenAI API Key Error**
   - Ensure your `OPENAI_API_KEY` is valid and has sufficient credits

2. **Database Connection Issues**
   - Check if PostgreSQL container is running: `docker-compose ps`
   - Verify connection parameters in `.env`

3. **PDF Processing Fails**
   - Ensure the PDF contains extractable text
   - Check file size limits (default: 50MB)

4. **Vector Search Returns No Results**
   - Verify documents have been ingested successfully
   - Check if embeddings were created properly

### Health Checks

```bash
# Application health
curl http://localhost:3000

# Database health
docker-compose exec postgres pg_isready -U rag_user -d rag_database
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions:
- Check the [API documentation](http://localhost:3000/api/docs)
- Review the troubleshooting section
- Open an issue on GitHub 