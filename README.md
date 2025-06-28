# 🧠 RAG Service with NestJS, OpenAI & pgvector

A production-ready Retrieval-Augmented Generation (RAG) service built with **NestJS**, **OpenAI embeddings**, and **PostgreSQL** with the **pgvector** extension.

## 🚀 Features

- 📄 **Document Ingestion**: Ingest plain text and PDF documents  
- 🔍 **Vector Search**: Efficient semantic search using `pgvector`  
- 🤖 **RAG API**: Context-aware answers using OpenAI GPT  
- 📚 **Swagger UI**: Fully documented interactive API  
- 🐳 **Docker Ready**: Compose stack with PostgreSQL + pgvector  
- 🔐 **Environment Config**: Uses `.env` for secure configuration  

## 🧱 Tech Stack

| Layer         | Tech                                 |
|--------------|--------------------------------------|
| Backend       | NestJS + TypeScript                  |
| Embeddings    | OpenAI `text-embedding-3-small`      |
| Vector DB     | PostgreSQL with `pgvector` extension |
| LLM           | OpenAI `gpt-3.5-turbo`               |
| Doc Parsing   | LangChain, pdf-parse                 |
| Docs          | Swagger / OpenAPI                    |
| Container     | Docker + Docker Compose              |

## ⚙️ Prerequisites

- Node.js `v18+`
- Docker + Docker Compose
- OpenAI API Key

## 🛠️ Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/<your-org>/rag-pgvector-employment-demo
cd rag-pgvector-employment-demo
```

### 2. Configure Environment

Create a `.env` file with:

```env
PORT=3000

# PostgreSQL
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=rag_user
DATABASE_PASSWORD=rag_password
DATABASE_NAME=rag_database

# OpenAI
OPENAI_API_KEY=your-openai-key
```

### 3. Run with Docker (recommended)

```bash
docker-compose up -d
docker-compose logs -f app
```

### 4. Run Locally (no Docker)

```bash
npm install
docker-compose up -d postgres
npm run start:dev
```

## 🧪 API Endpoints

| Method | Endpoint             | Description                       |
|--------|----------------------|-----------------------------------|
| GET    | `/`                  | Health check                      |
| POST   | `/rag/ingest`        | Ingest plain text content         |
| POST   | `/rag/ingest/pdf`    | Upload and ingest PDF             |
| POST   | `/rag/query`         | Query the knowledge base          |
| GET    | `/api/docs`          | Swagger API documentation         |

## 💡 Example Usage

### 📝 Ingest Text

```bash
curl -X POST http://localhost:3000/rag/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "text": "AI is a field of computer science...",
    "source": "intro-to-ai",
    "metadata": {
      "author": "Jane Doe",
      "tags": ["AI", "intro"]
    }
  }'
```

### 📄 Ingest PDF

```bash
curl -X POST http://localhost:3000/rag/ingest/pdf \
  -F "file=@/path/to/your.pdf" \
  -F "source=my-file"
```

### ❓ Query

```bash
curl -X POST http://localhost:3000/rag/query \
  -H "Content-Type: application/json" \
  -d '{"query": "What is deep learning?"}'
```

## 🧬 Architecture

```
Client ➜ NestJS (RAG API) ➜ PostgreSQL + pgvector
                     ↘︎ OpenAI Embeddings + GPT
```

## 🗂️ Project Structure

```
src/
├── app.module.ts
├── main.ts
├── entities/
│   └── document.entity.ts
└── rag/
    ├── rag.module.ts
    ├── rag.service.ts
    ├── rag.controller.ts
    └── dto/
```

## ⚡ Embedding Flow

1. Ingests and splits documents into chunks  
2. Uses OpenAI to generate embeddings  
3. Stores vectors in `pgvector`  
4. Ranks by cosine similarity  
5. Sends to OpenAI GPT for a context-aware response  

## 🔍 Similarity Search

Uses cosine distance in `pgvector`:

```sql
SELECT content, similarity
FROM documents
ORDER BY embedding <#> '[vector]' LIMIT 5;
```

## 🧰 Scripts

```bash
npm run start:dev      # Start local dev server
npm run start:prod     # Start production server
npm run build          # Compile TypeScript
npm run lint           # Run ESLint
```

## 🧾 Sample Query Response

```json
{
  "answer": "Deep learning is a subset of ML...",
  "sources": [
    {
      "content": "Deep learning uses neural nets...",
      "similarity": 0.91,
      "source": "intro-to-ai"
    }
  ]
}
```

## 🧪 Troubleshooting

| Issue                     | Fix |
|--------------------------|-----|
| OpenAI errors             | Check API key, credit, `.env` |
| DB connection failures    | Ensure Postgres is running |
| PDF not processed         | Ensure it's readable text |

## 📘 Docs

- Swagger: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

## 🤝 Contributing

1. Fork the repo  
2. Create a feature branch  
3. Push and submit a PR  

## 📄 License

MIT License – see `LICENSE` file.

## 🙋 Support

- Swagger docs: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)  
- Open GitHub issue for bug reports or feature requests.
