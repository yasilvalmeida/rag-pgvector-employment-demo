#!/bin/bash

# RAG Service - Example API Calls
# Make sure the service is running on http://localhost:3000

BASE_URL="http://localhost:3000"

echo "🚀 RAG Service API Examples"
echo "=================================="

# Health Check
echo ""
echo "1. Health Check"
echo "curl $BASE_URL"
curl -s $BASE_URL | jq '.'
echo ""

# Ingest Text Content
echo "2. Ingesting Sample Text..."
curl -X POST $BASE_URL/rag/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Artificial Intelligence (AI) is a branch of computer science that aims to create intelligent machines that can perform tasks that typically require human intelligence. Machine Learning is a subset of AI that enables computers to learn and improve from experience without being explicitly programmed. Deep Learning is a subset of Machine Learning that uses neural networks with multiple layers to model and understand complex patterns in data. Natural Language Processing (NLP) is another important area of AI that focuses on the interaction between computers and human language.",
    "source": "ai-fundamentals-guide",
    "metadata": {
      "author": "AI Expert",
      "category": "Educational",
      "tags": ["AI", "ML", "Deep Learning", "NLP"],
      "version": "1.0"
    }
  }' | jq '.'

echo ""
echo "3. Ingesting More Technical Content..."
curl -X POST $BASE_URL/rag/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Vector databases are specialized databases designed to store and query high-dimensional vectors efficiently. They are essential for modern AI applications, especially those involving similarity search, recommendation systems, and retrieval-augmented generation (RAG). pgvector is a PostgreSQL extension that adds vector similarity search capabilities to PostgreSQL. It supports exact and approximate nearest neighbor search with different distance functions including L2 distance, inner product, and cosine distance.",
    "source": "vector-database-primer",
    "metadata": {
      "author": "Database Engineer",
      "category": "Technical",
      "tags": ["Database", "Vector Search", "PostgreSQL", "pgvector"],
      "difficulty": "intermediate"
    }
  }' | jq '.'

echo ""
echo "4. Adding Employment-Related Content..."
curl -X POST $BASE_URL/rag/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Software engineering roles typically require strong programming skills, problem-solving abilities, and knowledge of software development methodologies. Full-stack developers work on both frontend and backend systems, while DevOps engineers focus on deployment, infrastructure, and continuous integration/continuous deployment (CI/CD) pipelines. Data scientists analyze large datasets to extract insights and build predictive models, often using machine learning techniques. Product managers bridge the gap between technical teams and business stakeholders, defining product requirements and roadmaps.",
    "source": "tech-careers-overview",
    "metadata": {
      "author": "HR Specialist",
      "category": "Career Guidance",
      "tags": ["Software Engineering", "Career", "Tech Jobs", "Skills"],
      "target_audience": "job_seekers"
    }
  }' | jq '.'

echo ""
echo "⏳ Waiting for embeddings to be processed..."
sleep 3

echo ""
echo "5. Querying about AI and ML..."
curl -X POST $BASE_URL/rag/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is the relationship between AI, Machine Learning, and Deep Learning?",
    "limit": 3
  }' | jq '.'

echo ""
echo "6. Querying about Vector Databases..."
curl -X POST $BASE_URL/rag/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "How do vector databases work and what is pgvector?",
    "limit": 2
  }' | jq '.'

echo ""
echo "7. Querying about Tech Careers..."
curl -X POST $BASE_URL/rag/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What skills are needed for different software engineering roles?",
    "limit": 4
  }' | jq '.'

echo ""
echo "8. Advanced Query with Specific Context..."
curl -X POST $BASE_URL/rag/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "I want to become a data scientist. What should I focus on learning?",
    "limit": 5
  }' | jq '.'

echo ""
echo "✅ All examples completed!"
echo ""
echo "📚 View API documentation at: $BASE_URL/api/docs"
echo "🔍 Swagger UI provides interactive testing interface" 