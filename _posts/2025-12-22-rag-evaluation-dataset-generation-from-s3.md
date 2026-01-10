---
layout: post
title: "Generating RAG Evaluation Datasets from Your S3 Knowledge Base"
date: 2025-12-22
tags: [aws, rag, evaluation, llm, s3, deepeval, langchain, testing, machine-learning]
---

# Generating RAG Evaluation Datasets from Your S3 Knowledge Base

You've built a knowledge base with 30,000+ documents in S3. Now comes the critical question: **How do you evaluate your RAG system's quality?**

Manual annotation is expensive and doesn't scale. The solution: **automatically generate evaluation datasets** from your existing documents using LLMs. This post covers practical frameworks and approaches for synthetic dataset generation.

---

## TL;DR

| Tool | Auto Dataset | Evaluation Metrics | Best Use |
|------|--------------|-------------------|----------|
| **DeepEval** | ✅ Yes | ✅ Rich built-in | Best overall for evaluation |
| **Langfuse/RAGAS** | ✅ Yes | Depends on integration | Grounded QA for RAG |
| **LangChain + LLMs** | ✅ Custom | Manual | Most flexible, DIY |
| **YourBench / QGen** | 🚧 Research | Research | Large automatic benchmarks |

---

## Why Synthetic Evaluation Datasets?

Traditional evaluation requires:
- ❌ Manual annotation by domain experts
- ❌ Weeks of effort for large corpora
- ❌ Expensive and doesn't scale

Synthetic generation offers:
- ✅ Automatic Q&A pair creation from documents
- ✅ Scales to thousands of test cases
- ✅ Grounded in your actual content
- ✅ Reproducible and version-controlled

---

## 1. DeepEval — Open-Source LLM Evaluation Framework

**Best overall choice for automated evaluation**

[DeepEval](https://github.com/confident-ai/deepeval) is an open-source evaluation framework designed specifically for LLMs that includes **synthetic dataset generation** from documents.

### Why It's Great for RAG

- Generates **gold test cases** (input/output pairs) from your documents
- Supports RAG, QA, and conversational evaluation
- Pytest-style integration for CI/CD regression tracking
- Built-in metrics (relevance, faithfulness, hallucination detection)

### Key Features

```python
# Core capability: generate QA pairs from documents
Synthesizer.generate_goldens_from_docs()

# Supports structured exports
dataset.export_to_json("evaluation_set.json")
dataset.export_to_csv("evaluation_set.csv")
```

### Installation & Quick Start

```bash
pip install deepeval
```

```python
from deepeval.synthesizer import Synthesizer
from deepeval.dataset import EvaluationDataset
import boto3
import os

# Initialize S3 client
s3 = boto3.client('s3')
BUCKET = 'your-knowledge-base-bucket'
PREFIX = 'documents/'

def load_documents_from_s3(bucket: str, prefix: str, limit: int = 100):
    """Load text documents from S3."""
    documents = []
    paginator = s3.get_paginator('list_objects_v2')
    
    for page in paginator.paginate(Bucket=bucket, Prefix=prefix):
        for obj in page.get('Contents', []):
            if obj['Key'].endswith('.txt'):
                response = s3.get_object(Bucket=bucket, Key=obj['Key'])
                content = response['Body'].read().decode('utf-8')
                documents.append({
                    'content': content,
                    'source': obj['Key']
                })
                if len(documents) >= limit:
                    return documents
    return documents

# Load documents
docs = load_documents_from_s3(BUCKET, PREFIX, limit=500)

# Initialize synthesizer
synthesizer = Synthesizer()

# Generate evaluation dataset
goldens = synthesizer.generate_goldens_from_docs(
    documents=[d['content'] for d in docs],
    max_goldens_per_document=3,  # QA pairs per doc
    include_expected_output=True
)

# Create dataset and export
dataset = EvaluationDataset(goldens=goldens)
dataset.export_to_json("rag_evaluation_set.json")

print(f"Generated {len(goldens)} test cases")
```

### Running Evaluations

```python
from deepeval import evaluate
from deepeval.metrics import (
    AnswerRelevancyMetric,
    FaithfulnessMetric,
    ContextualRelevancyMetric
)
from deepeval.test_case import LLMTestCase

# Define metrics
metrics = [
    AnswerRelevancyMetric(threshold=0.7),
    FaithfulnessMetric(threshold=0.7),
    ContextualRelevancyMetric(threshold=0.7)
]

# Create test cases from your RAG system's outputs
test_cases = []
for golden in goldens:
    # Get your RAG system's response
    rag_response = your_rag_system.query(golden.input)
    
    test_case = LLMTestCase(
        input=golden.input,
        actual_output=rag_response.answer,
        expected_output=golden.expected_output,
        retrieval_context=rag_response.contexts
    )
    test_cases.append(test_case)

# Run evaluation
results = evaluate(test_cases, metrics)
print(f"Average score: {results.average_score}")
```

---

## 2. RAGAS + Langfuse — Grounded QA Generation

[RAGAS](https://docs.ragas.io/) (RAG Assessment) combined with [Langfuse](https://langfuse.com/) provides another powerful approach for synthetic test generation.

### How It Works

1. Load texts from S3 and chunk into contexts
2. Use an LLM to generate Q&A samples tied to each context
3. Collect as structured dataset with source references

### Implementation

```python
from ragas.testset.generator import TestsetGenerator
from ragas.testset.evolutions import simple, reasoning, multi_context
from langchain_community.document_loaders import S3DirectoryLoader
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter

# Load documents from S3
loader = S3DirectoryLoader(
    bucket="your-knowledge-base-bucket",
    prefix="documents/"
)
documents = loader.load()

# Split into chunks
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200
)
chunks = text_splitter.split_documents(documents)

# Initialize generator
generator_llm = ChatOpenAI(model="gpt-4")
critic_llm = ChatOpenAI(model="gpt-4")
embeddings = OpenAIEmbeddings()

generator = TestsetGenerator.from_langchain(
    generator_llm,
    critic_llm,
    embeddings
)

# Generate test set with different question types
testset = generator.generate_with_langchain_docs(
    chunks,
    test_size=100,
    distributions={
        simple: 0.5,      # Simple factual questions
        reasoning: 0.3,   # Requires reasoning
        multi_context: 0.2  # Needs multiple chunks
    }
)

# Export to pandas/JSON
df = testset.to_pandas()
df.to_json("ragas_testset.json", orient="records")

print(df.head())
```

### RAGAS Evaluation Metrics

```python
from ragas import evaluate
from ragas.metrics import (
    faithfulness,
    answer_relevancy,
    context_precision,
    context_recall
)

# Evaluate your RAG system
results = evaluate(
    testset,
    metrics=[
        faithfulness,
        answer_relevancy,
        context_precision,
        context_recall
    ]
)

print(results)
```

---

## 3. LangChain + Custom LLM Prompts

For maximum flexibility, build your own generator with LangChain:

### Document Loading from S3

```python
from langchain_community.document_loaders import S3DirectoryLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
import json

# Load from S3
loader = S3DirectoryLoader(
    bucket="your-knowledge-base-bucket",
    prefix="documents/",
    glob="**/*.txt"
)
documents = loader.load()

# Chunk documents
splitter = RecursiveCharacterTextSplitter(
    chunk_size=1500,
    chunk_overlap=200
)
chunks = splitter.split_documents(documents)

print(f"Loaded {len(documents)} documents, {len(chunks)} chunks")
```

### Q&A Generation Pipeline

```python
from langchain.chains import LLMChain
from pydantic import BaseModel
from typing import List
import json

# Define output structure
class QAPair(BaseModel):
    question: str
    answer: str
    difficulty: str  # easy, medium, hard

# Generation prompt
QA_GENERATION_PROMPT = PromptTemplate(
    input_variables=["context"],
    template="""Based on the following context, generate 3 question-answer pairs 
that could be used to evaluate a RAG system. 

Include a mix of:
- Factual questions (easy)
- Questions requiring inference (medium)  
- Questions needing synthesis of information (hard)

Context:
{context}

Output as JSON array with format:
[
  {{"question": "...", "answer": "...", "difficulty": "easy"}},
  {{"question": "...", "answer": "...", "difficulty": "medium"}},
  {{"question": "...", "answer": "...", "difficulty": "hard"}}
]

JSON Output:"""
)

# Initialize LLM
llm = ChatOpenAI(model="gpt-4", temperature=0.7)
chain = LLMChain(llm=llm, prompt=QA_GENERATION_PROMPT)

def generate_qa_pairs(chunks: List, sample_size: int = 100):
    """Generate QA pairs from document chunks."""
    all_pairs = []
    
    # Sample chunks if too many
    import random
    sampled = random.sample(chunks, min(sample_size, len(chunks)))
    
    for i, chunk in enumerate(sampled):
        try:
            result = chain.run(context=chunk.page_content)
            pairs = json.loads(result)
            
            # Add source metadata
            for pair in pairs:
                pair['source'] = chunk.metadata.get('source', 'unknown')
                pair['context'] = chunk.page_content[:500]  # Truncate for storage
            
            all_pairs.extend(pairs)
            print(f"Processed {i+1}/{len(sampled)} chunks")
            
        except Exception as e:
            print(f"Error on chunk {i}: {e}")
            continue
    
    return all_pairs

# Generate dataset
qa_pairs = generate_qa_pairs(chunks, sample_size=200)

# Save to JSONL (standard format for ML evaluation)
with open("evaluation_dataset.jsonl", "w") as f:
    for pair in qa_pairs:
        f.write(json.dumps(pair) + "\n")

print(f"Generated {len(qa_pairs)} QA pairs")
```

### Different Question Types

```python
# Template for different question types
QUESTION_TEMPLATES = {
    "factual": """Generate a factual question that can be directly answered 
from this text. The answer should be explicitly stated.

Context: {context}

Question:""",

    "inference": """Generate a question that requires drawing a conclusion 
from the information in this text.

Context: {context}

Question:""",

    "comparison": """Generate a question that asks to compare or contrast 
elements mentioned in this text.

Context: {context}

Question:""",

    "summary": """Generate a question asking to summarize or explain 
the main point of this text.

Context: {context}

Question:"""
}

def generate_diverse_questions(chunk, llm):
    """Generate different types of questions for a chunk."""
    questions = []
    
    for q_type, template in QUESTION_TEMPLATES.items():
        prompt = PromptTemplate(
            input_variables=["context"],
            template=template
        )
        chain = LLMChain(llm=llm, prompt=prompt)
        
        question = chain.run(context=chunk.page_content)
        
        # Generate answer
        answer_prompt = f"Based on this context, answer the question.\n\nContext: {chunk.page_content}\n\nQuestion: {question}\n\nAnswer:"
        answer = llm.predict(answer_prompt)
        
        questions.append({
            "type": q_type,
            "question": question.strip(),
            "answer": answer.strip(),
            "context": chunk.page_content,
            "source": chunk.metadata.get('source')
        })
    
    return questions
```

---

## 4. Research Papers & Academic Frameworks

Understanding the research behind these tools helps you build better evaluation systems.

### Key Papers on Synthetic Dataset Generation

#### YourBench: Dynamic Benchmark Generation
**[arxiv.org/abs/2504.01833](https://arxiv.org/abs/2504.01833)**

Generates dynamic, domain-tailored benchmarks directly from source documents. Key contributions:
- Automatic benchmark creation from any document corpus
- Domain-specific question generation
- Quality filtering to remove low-quality samples
- Supports multiple question types and difficulty levels

#### QGen Studio: Adaptive QA Generation
**[arxiv.org/abs/2504.06136](https://arxiv.org/abs/2504.06136)**

An adaptive platform for question-answer generation, training, and evaluation:
- End-to-end pipeline from documents to evaluation
- Supports custom QA pair generation
- Integrated training and evaluation workflows
- Useful for creating domain-specific benchmarks

#### Tiny QA Benchmark++: Lightweight Synthetic Generation
**[arxiv.org/abs/2505.12058](https://arxiv.org/abs/2505.12058)**

Ultra-lightweight synthetic QA generation for quick smoke tests:
- Multilingual dataset generation
- Minimal compute requirements
- Continuous LLM evaluation support
- Good for CI/CD integration

### RAG-Specific Research

#### Metadata Enrichment for RAG Systems
**[arxiv.org/abs/2512.05411](https://arxiv.org/abs/2512.05411)**

A systematic framework for metadata enrichment using LLMs to improve document retrieval:
- **Key Finding**: Metadata-enriched approaches achieve 82.5% precision vs 73.3% for content-only
- Uses structured pipeline to generate meaningful metadata for document segments
- Improves semantic representations and retrieval accuracy
- Recommends recursive chunking with TF-IDF weighted embeddings

#### Query Attribute Modeling (QAM)
**[arxiv.org/abs/2508.04683](https://arxiv.org/abs/2508.04683)**

A hybrid framework that enhances search precision:
- Decomposes open text queries into structured metadata tags + semantic elements
- Automatically extracts metadata filters from free-form queries
- Achieves mAP@5 of 52.99% (significant improvement over conventional methods)
- Reduces noise by enabling focused retrieval

### Evaluation Metrics Research

#### RAGAS: Evaluation Framework for RAG
The RAGAS framework (Retrieval-Augmented Generation Assessment) provides standardized metrics:

| Metric | What It Measures | Range |
|--------|------------------|-------|
| **Faithfulness** | Is the answer grounded in the context? | 0-1 |
| **Answer Relevancy** | How relevant is the answer to the question? | 0-1 |
| **Context Precision** | Are retrieved chunks relevant to the question? | 0-1 |
| **Context Recall** | Does the context contain all needed info? | 0-1 |

**Key insight from research**: Combining multiple metrics provides a more reliable evaluation than any single metric.

#### LLM-as-Judge Approaches

Recent research shows LLMs can effectively evaluate RAG systems:

```python
# Example: Using LLM as evaluator
EVALUATION_PROMPT = """
You are evaluating a RAG system's response.

Question: {question}
Context: {context}
Generated Answer: {answer}
Reference Answer: {reference}

Rate the following on a scale of 1-5:
1. Faithfulness: Does the answer only use information from the context?
2. Completeness: Does the answer fully address the question?
3. Relevance: Is the answer relevant to what was asked?

Provide your ratings as JSON:
"""

def llm_evaluate(question, context, answer, reference, llm):
    prompt = EVALUATION_PROMPT.format(
        question=question,
        context=context,
        answer=answer,
        reference=reference
    )
    result = llm.predict(prompt)
    return json.loads(result)
```

### Research-Backed Best Practices

Based on the academic literature:

1. **Diverse Question Types**: Generate factual, reasoning, and multi-hop questions (YourBench approach)

2. **Ground Truth Validation**: Use LLM-as-judge with human spot-checks (QGen Studio finding)

3. **Metadata Enrichment**: Add meaningful metadata during ingestion for better filtering (arxiv 2512.05411)

4. **Hybrid Evaluation**: Combine automated metrics with human evaluation (RAGAS recommendation)

5. **Continuous Benchmarking**: Run evaluations in CI/CD for regression detection (Tiny QA Benchmark++ approach)

---

## Complete Pipeline: S3 → Evaluation Dataset

Here's a production-ready pipeline combining the best practices:

```python
import boto3
import json
from datetime import datetime
from typing import List, Dict, Any
from deepeval.synthesizer import Synthesizer
from deepeval.dataset import EvaluationDataset
import hashlib

class EvaluationDatasetGenerator:
    """
    Generate evaluation datasets from S3-backed knowledge base.
    """
    
    def __init__(
        self,
        bucket: str,
        prefix: str = "documents/",
        output_bucket: str = None
    ):
        self.s3 = boto3.client('s3')
        self.bucket = bucket
        self.prefix = prefix
        self.output_bucket = output_bucket or bucket
        self.synthesizer = Synthesizer()
    
    def load_documents(self, limit: int = None, file_types: List[str] = ['.txt', '.md']) -> List[Dict]:
        """Load documents from S3."""
        documents = []
        paginator = self.s3.get_paginator('list_objects_v2')
        
        for page in paginator.paginate(Bucket=self.bucket, Prefix=self.prefix):
            for obj in page.get('Contents', []):
                key = obj['Key']
                
                # Check file type
                if not any(key.endswith(ft) for ft in file_types):
                    continue
                
                # Skip metadata files
                if '.metadata.json' in key:
                    continue
                
                try:
                    response = self.s3.get_object(Bucket=self.bucket, Key=key)
                    content = response['Body'].read().decode('utf-8')
                    
                    documents.append({
                        'content': content,
                        'source': key,
                        'size': obj['Size'],
                        'last_modified': obj['LastModified'].isoformat()
                    })
                    
                    if limit and len(documents) >= limit:
                        return documents
                        
                except Exception as e:
                    print(f"Error loading {key}: {e}")
                    continue
        
        return documents
    
    def chunk_documents(
        self,
        documents: List[Dict],
        chunk_size: int = 1500,
        overlap: int = 200
    ) -> List[Dict]:
        """Split documents into chunks."""
        chunks = []
        
        for doc in documents:
            content = doc['content']
            
            # Simple chunking (use langchain for production)
            for i in range(0, len(content), chunk_size - overlap):
                chunk_content = content[i:i + chunk_size]
                
                if len(chunk_content.strip()) < 100:  # Skip tiny chunks
                    continue
                
                chunks.append({
                    'content': chunk_content,
                    'source': doc['source'],
                    'chunk_index': len(chunks),
                    'chunk_id': hashlib.md5(chunk_content.encode()).hexdigest()[:12]
                })
        
        return chunks
    
    def generate_qa_pairs(
        self,
        chunks: List[Dict],
        pairs_per_chunk: int = 2,
        sample_size: int = None
    ) -> List[Dict]:
        """Generate QA pairs from chunks using DeepEval."""
        import random
        
        # Sample if needed
        if sample_size and len(chunks) > sample_size:
            chunks = random.sample(chunks, sample_size)
        
        # Generate using DeepEval
        goldens = self.synthesizer.generate_goldens_from_docs(
            documents=[c['content'] for c in chunks],
            max_goldens_per_document=pairs_per_chunk,
            include_expected_output=True
        )
        
        # Enrich with metadata
        qa_pairs = []
        for i, golden in enumerate(goldens):
            chunk_idx = i // pairs_per_chunk
            chunk = chunks[chunk_idx] if chunk_idx < len(chunks) else chunks[-1]
            
            qa_pairs.append({
                'id': f"qa-{len(qa_pairs):05d}",
                'question': golden.input,
                'expected_answer': golden.expected_output,
                'context': chunk['content'][:1000],
                'source': chunk['source'],
                'chunk_id': chunk['chunk_id'],
                'generated_at': datetime.now().isoformat()
            })
        
        return qa_pairs
    
    def save_dataset(
        self,
        qa_pairs: List[Dict],
        dataset_name: str = None
    ) -> str:
        """Save dataset to S3 and local."""
        if not dataset_name:
            dataset_name = f"eval_dataset_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        # Create dataset metadata
        dataset = {
            'name': dataset_name,
            'created_at': datetime.now().isoformat(),
            'num_samples': len(qa_pairs),
            'source_bucket': self.bucket,
            'source_prefix': self.prefix,
            'samples': qa_pairs
        }
        
        # Save locally as JSONL
        local_path = f"{dataset_name}.jsonl"
        with open(local_path, 'w') as f:
            for pair in qa_pairs:
                f.write(json.dumps(pair) + '\n')
        
        # Save to S3
        s3_key = f"evaluation-datasets/{dataset_name}.json"
        self.s3.put_object(
            Bucket=self.output_bucket,
            Key=s3_key,
            Body=json.dumps(dataset, indent=2),
            ContentType='application/json'
        )
        
        print(f"Saved {len(qa_pairs)} QA pairs to:")
        print(f"  Local: {local_path}")
        print(f"  S3: s3://{self.output_bucket}/{s3_key}")
        
        return s3_key
    
    def generate_full_dataset(
        self,
        doc_limit: int = 500,
        chunk_size: int = 1500,
        pairs_per_chunk: int = 2,
        sample_chunks: int = 200
    ) -> str:
        """Full pipeline: load → chunk → generate → save."""
        print("Loading documents from S3...")
        documents = self.load_documents(limit=doc_limit)
        print(f"Loaded {len(documents)} documents")
        
        print("Chunking documents...")
        chunks = self.chunk_documents(documents, chunk_size=chunk_size)
        print(f"Created {len(chunks)} chunks")
        
        print("Generating QA pairs...")
        qa_pairs = self.generate_qa_pairs(
            chunks,
            pairs_per_chunk=pairs_per_chunk,
            sample_size=sample_chunks
        )
        print(f"Generated {len(qa_pairs)} QA pairs")
        
        print("Saving dataset...")
        s3_key = self.save_dataset(qa_pairs)
        
        return s3_key


# Usage
if __name__ == "__main__":
    generator = EvaluationDatasetGenerator(
        bucket="your-knowledge-base-bucket",
        prefix="documents/"
    )
    
    dataset_key = generator.generate_full_dataset(
        doc_limit=1000,
        chunk_size=1500,
        pairs_per_chunk=2,
        sample_chunks=300
    )
    
    print(f"\nDataset ready: {dataset_key}")
```

---

## Best Practices

### 1. Chunk Creation & Retrieval Prep
- Preprocess documents into chunks sized for your LLM context window
- Use semantic chunking for better context preservation
- Maintain metadata linking chunks to source documents

### 2. Synthesize Dataset Algorithmically
- Use LLM + generator (DeepEval or custom) for structured test cases
- Include different question types (factual, reasoning, multi-hop)
- Generate both questions AND expected answers

### 3. Human Validation
- Spot-check synthetic data for hallucinations
- Validate answer quality on a sample
- Remove low-quality pairs before evaluation

### 4. Store & Version
- Save in JSONL format (ML pipeline standard)
- Track versions with DVC or S3 versioning
- Include generation metadata for reproducibility

### 5. Continuous Evaluation
- Run evaluations in CI/CD on model changes
- Track metrics over time for regression detection
- Update datasets as your knowledge base grows

---

## Dataset Format Standards

### JSONL Format (Recommended)

```json
{"id": "qa-00001", "question": "What is the company's PTO policy?", "expected_answer": "Employees receive 20 days of PTO per year...", "context": "...", "source": "hr/employee-handbook.txt", "difficulty": "easy"}
{"id": "qa-00002", "question": "How does the deployment pipeline handle rollbacks?", "expected_answer": "The pipeline supports automatic rollbacks...", "context": "...", "source": "engineering/deployment-guide.txt", "difficulty": "medium"}
```

### Evaluation Run Output

```json
{
  "dataset_name": "eval_dataset_20251222",
  "model": "bedrock-kb-claude-3-sonnet",
  "timestamp": "2025-12-22T14:30:00Z",
  "metrics": {
    "faithfulness": 0.85,
    "answer_relevancy": 0.82,
    "context_precision": 0.78,
    "context_recall": 0.75
  },
  "num_samples": 300,
  "pass_rate": 0.81
}
```

---

## Summary

| Step | Tool | Output |
|------|------|--------|
| **Load docs** | boto3 / LangChain S3 Loader | Document list |
| **Chunk** | LangChain TextSplitter | Chunk list with metadata |
| **Generate QA** | DeepEval / RAGAS / Custom | QA pairs with context |
| **Validate** | Human review (sample) | Clean dataset |
| **Store** | S3 + JSONL | Versioned evaluation set |
| **Evaluate** | DeepEval / RAGAS metrics | Scores & insights |

**Key Takeaways:**
1. ✅ **DeepEval** is the best all-in-one solution for most cases
2. ✅ **RAGAS** excels at grounded QA generation for RAG
3. ✅ **LangChain + custom prompts** offers maximum flexibility
4. ✅ Always validate synthetic data with human spot-checks
5. ✅ Version your datasets alongside your models

---

**Related Posts:**
- [Designing a Knowledge Base with Metadata Filtering in AWS](/2025/12/22/aws-knowledge-base-metadata-filtering-solution/)
- [Amazon QuickSuite Knowledge Base: S3 Implementation](/2025/12/16/amazon-quicksuite-knowledge-base-s3-implementation/)

**References:**

### Tools & Frameworks
- [DeepEval GitHub](https://github.com/confident-ai/deepeval) — Open-source LLM evaluation framework
- [DeepEval Datasets Documentation](https://deepeval.com/docs/evaluation-datasets) — Synthetic dataset generation guide
- [RAGAS Documentation](https://docs.ragas.io/) — RAG evaluation framework
- [RAGAS GitHub](https://github.com/explodinggradients/ragas) — Source code and examples
- [Langfuse Synthetic Datasets Guide](https://langfuse.com/guides/cookbook/example_synthetic_datasets) — Synthetic testset cookbook
- [TruLens](https://www.trulens.org/) — LLM evaluation and observability

### Research Papers
- [YourBench: Dynamic Benchmark Generation](https://arxiv.org/abs/2504.01833) — Automatic benchmark creation from documents
- [QGen Studio: Adaptive QA Generation](https://arxiv.org/abs/2504.06136) — End-to-end QA generation platform
- [Tiny QA Benchmark++](https://arxiv.org/abs/2505.12058) — Lightweight multilingual synthetic QA
- [Metadata Enrichment for RAG](https://arxiv.org/abs/2512.05411) — LLM-based metadata generation framework
- [Query Attribute Modeling (QAM)](https://arxiv.org/abs/2508.04683) — Hybrid search with metadata extraction

### AWS Documentation
- [Amazon Bedrock Knowledge Bases](https://docs.aws.amazon.com/bedrock/latest/userguide/knowledge-base.html) — Official documentation
- [S3 Metadata for Knowledge Bases](https://docs.aws.amazon.com/bedrock/latest/userguide/knowledge-base-s3.html) — Metadata file format
- [Metadata Filtering Announcement](https://aws.amazon.com/about-aws/whats-new/2024/03/knowledge-bases-amazon-bedrock-metadata-filtering/) — Feature details

