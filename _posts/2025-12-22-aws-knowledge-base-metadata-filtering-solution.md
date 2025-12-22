---
layout: post
title: "Designing a Knowledge Base with Metadata Filtering in AWS"
date: 2025-12-22
tags: [aws, knowledge-base, bedrock, rag, metadata-filtering, access-control, enterprise-ai]
---

# Designing a Knowledge Base with Metadata Filtering in AWS

Building an enterprise knowledge base requires more than just storing and searching documents—you need **metadata filtering** to enable fine-grained retrieval and **access control** to ensure users only see documents they're authorized to view.

This post presents a comprehensive solution using **Amazon Bedrock Knowledge Bases** with S3, including architecture, implementation details, and code examples.

---

## TL;DR

| Requirement | Solution |
|-------------|----------|
| **Document Storage** | Amazon S3 with metadata JSON files |
| **Vector Search** | Amazon Bedrock Knowledge Base + OpenSearch Serverless |
| **Metadata Filtering** | Query-time filters on document attributes |
| **Access Control** | Metadata-based filtering at query time |
| **API** | Bedrock `Retrieve` and `RetrieveAndGenerate` APIs |

---

## Solution Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Application Layer                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────────┐     ┌──────────────────┐     ┌────────────────────────┐  │
│   │   User      │────▶│  API Gateway /   │────▶│  Lambda / Application  │  │
│   │   Request   │     │  Application     │     │  (Access Control Logic)│  │
│   └─────────────┘     └──────────────────┘     └───────────┬────────────┘  │
│                                                            │               │
└────────────────────────────────────────────────────────────│───────────────┘
                                                             │
                                                             ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Amazon Bedrock Knowledge Base                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌───────────────────┐         ┌─────────────────────────────────────────┐│
│   │  Retrieve API     │         │  OpenSearch Serverless (Vector Store)   ││
│   │  + Metadata       │◀───────▶│  - Document embeddings                  ││
│   │    Filters        │         │  - Metadata attributes                  ││
│   └───────────────────┘         └─────────────────────────────────────────┘│
│           │                                                                 │
│           │                     ┌─────────────────────────────────────────┐│
│           │                     │  Foundation Model (Claude/Titan)        ││
│           └────────────────────▶│  - RAG response generation              ││
│                                 └─────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Amazon S3 Data Source                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   s3://knowledge-base-bucket/                                               │
│   │                                                                         │
│   ├── documents/                                                            │
│   │   ├── finance/                                                          │
│   │   │   ├── quarterly-report-q3.pdf                                       │
│   │   │   └── quarterly-report-q3.pdf.metadata.json                         │
│   │   ├── engineering/                                                      │
│   │   │   ├── architecture-guide.md                                         │
│   │   │   └── architecture-guide.md.metadata.json                           │
│   │   └── hr/                                                               │
│   │       ├── employee-handbook.pdf                                         │
│   │       └── employee-handbook.pdf.metadata.json                           │
│   │                                                                         │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Why Amazon Bedrock Knowledge Bases?

### Comparison of AWS Options

| Feature | Bedrock KB | Amazon Kendra | Amazon Q Business |
|---------|------------|---------------|-------------------|
| **Vector Search (RAG)** | ✅ Native | ✅ With Bedrock | ✅ Built-in |
| **Metadata Filtering** | ✅ Yes | ✅ Yes | ⚠️ Limited |
| **Document-Level ACL** | ⚠️ Query-time | ✅ Native | ✅ Native `_acl` |
| **Pricing Model** | Pay-per-query | Index + query | Per user |
| **Customization** | High (API) | Medium | Low (managed) |
| **Best For** | RAG apps | Enterprise search | Business users |

**Recommendation**: Use **Amazon Bedrock Knowledge Bases** for:
- Custom RAG applications needing full API control
- Flexible metadata filtering at query time
- Integration with Claude, Titan, or other foundation models
- Cost-effective pay-per-use pricing

---

## Implementation Guide

### Step 1: Design Your Metadata Schema

Define a consistent metadata schema before implementation:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Document Metadata Schema",
  "type": "object",
  "required": ["metadataAttributes"],
  "properties": {
    "metadataAttributes": {
      "type": "object",
      "required": ["documentId", "department"],
      "properties": {
        "documentId": {
          "type": "string",
          "description": "Unique document identifier"
        },
        "department": {
          "type": "string",
          "enum": ["engineering", "finance", "hr", "legal", "marketing", "sales"]
        },
        "documentType": {
          "type": "string",
          "enum": ["policy", "report", "guide", "memo", "contract"]
        },
        "accessLevel": {
          "type": "string",
          "enum": ["public", "internal", "confidential", "restricted"]
        },
        "author": {
          "type": "string"
        },
        "createdDate": {
          "type": "string",
          "format": "date"
        },
        "tags": {
          "type": "array",
          "items": { "type": "string" }
        }
      }
    }
  }
}
```

### Step 2: Organize S3 with Metadata Files

#### Document Structure

```
s3://company-knowledge-base/
├── documents/
│   ├── engineering/
│   │   ├── system-design-guide.pdf
│   │   ├── system-design-guide.pdf.metadata.json
│   │   ├── api-documentation.md
│   │   └── api-documentation.md.metadata.json
│   ├── finance/
│   │   ├── q3-earnings-report.pdf
│   │   ├── q3-earnings-report.pdf.metadata.json
│   │   ├── budget-guidelines.docx
│   │   └── budget-guidelines.docx.metadata.json
│   └── hr/
│       ├── employee-handbook.pdf
│       ├── employee-handbook.pdf.metadata.json
│       ├── compensation-guide.pdf
│       └── compensation-guide.pdf.metadata.json
```

#### Metadata File Examples

**Engineering Document** (`system-design-guide.pdf.metadata.json`):
```json
{
  "metadataAttributes": {
    "documentId": "eng-001",
    "department": "engineering",
    "documentType": "guide",
    "accessLevel": "internal",
    "author": "Platform Team",
    "createdDate": "2025-06-15",
    "tags": ["architecture", "best-practices", "microservices"],
    "allowedRoles": ["engineer", "tech-lead", "architect", "admin"]
  }
}
```

**Finance Document** (`q3-earnings-report.pdf.metadata.json`):
```json
{
  "metadataAttributes": {
    "documentId": "fin-042",
    "department": "finance",
    "documentType": "report",
    "accessLevel": "confidential",
    "author": "Finance Team",
    "createdDate": "2025-10-01",
    "quarter": "Q3",
    "year": 2025,
    "tags": ["earnings", "quarterly", "financial"],
    "allowedRoles": ["finance", "executive", "admin"]
  }
}
```

**HR Document** (`employee-handbook.pdf.metadata.json`):
```json
{
  "metadataAttributes": {
    "documentId": "hr-001",
    "department": "hr",
    "documentType": "policy",
    "accessLevel": "public",
    "author": "HR Department",
    "createdDate": "2025-01-01",
    "version": "2025.1",
    "tags": ["policies", "onboarding", "benefits"],
    "allowedRoles": ["all"]
  }
}
```

### Step 3: Create Bedrock Knowledge Base

#### Using AWS Console

1. Navigate to **Amazon Bedrock** → **Knowledge bases**
2. Click **Create knowledge base**
3. Configure:
   - **Name**: `company-knowledge-base`
   - **IAM Role**: Create new or use existing with S3 access
4. **Data source**:
   - Type: **Amazon S3**
   - S3 URI: `s3://company-knowledge-base/documents/`
5. **Chunking strategy**: 
   - Default chunking (300 tokens, 20% overlap) OR
   - Semantic chunking for better context
6. **Embeddings model**: `amazon.titan-embed-text-v2:0`
7. **Vector store**: Create new Amazon OpenSearch Serverless collection

#### Using AWS CDK

```typescript
import * as cdk from 'aws-cdk-lib';
import * as bedrock from 'aws-cdk-lib/aws-bedrock';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';

export class KnowledgeBaseStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3 bucket for documents
    const documentBucket = new s3.Bucket(this, 'DocumentBucket', {
      bucketName: 'company-knowledge-base',
      encryption: s3.BucketEncryption.S3_MANAGED,
      versioned: true,
    });

    // IAM role for Bedrock
    const kbRole = new iam.Role(this, 'KBRole', {
      assumedBy: new iam.ServicePrincipal('bedrock.amazonaws.com'),
    });

    documentBucket.grantRead(kbRole);

    // Knowledge Base (L1 construct)
    const knowledgeBase = new bedrock.CfnKnowledgeBase(this, 'KnowledgeBase', {
      name: 'company-knowledge-base',
      roleArn: kbRole.roleArn,
      knowledgeBaseConfiguration: {
        type: 'VECTOR',
        vectorKnowledgeBaseConfiguration: {
          embeddingModelArn: `arn:aws:bedrock:${this.region}::foundation-model/amazon.titan-embed-text-v2:0`,
        },
      },
      storageConfiguration: {
        type: 'OPENSEARCH_SERVERLESS',
        opensearchServerlessConfiguration: {
          collectionArn: 'YOUR_OPENSEARCH_COLLECTION_ARN',
          fieldMapping: {
            metadataField: 'metadata',
            textField: 'text',
            vectorField: 'vector',
          },
          vectorIndexName: 'bedrock-knowledge-base-index',
        },
      },
    });

    // Data source
    new bedrock.CfnDataSource(this, 'S3DataSource', {
      knowledgeBaseId: knowledgeBase.attrKnowledgeBaseId,
      name: 's3-documents',
      dataSourceConfiguration: {
        type: 'S3',
        s3Configuration: {
          bucketArn: documentBucket.bucketArn,
          inclusionPrefixes: ['documents/'],
        },
      },
    });
  }
}
```

### Step 4: Implement Query-Time Metadata Filtering

#### Python Implementation

```python
import boto3
import json
from typing import Optional, List, Dict, Any

class KnowledgeBaseClient:
    def __init__(self, knowledge_base_id: str, region: str = 'us-east-1'):
        self.client = boto3.client('bedrock-agent-runtime', region_name=region)
        self.knowledge_base_id = knowledge_base_id
    
    def build_access_filter(self, user_roles: List[str], department: Optional[str] = None) -> Dict[str, Any]:
        """
        Build metadata filter based on user's roles and department.
        Implements access control at query time.
        """
        filters = []
        
        # Access level filter - user can see public docs + their access level
        access_filter = {
            "orAll": [
                {"equals": {"key": "accessLevel", "value": "public"}},
                {"in": {"key": "allowedRoles", "value": user_roles}}
            ]
        }
        filters.append(access_filter)
        
        # Optional department filter
        if department:
            filters.append({
                "equals": {"key": "department", "value": department}
            })
        
        # Combine all filters with AND
        if len(filters) == 1:
            return filters[0]
        return {"andAll": filters}
    
    def retrieve(
        self,
        query: str,
        user_roles: List[str],
        department: Optional[str] = None,
        document_type: Optional[str] = None,
        max_results: int = 5
    ) -> Dict[str, Any]:
        """
        Retrieve relevant documents with metadata filtering.
        """
        # Build the filter
        retrieval_filter = self.build_access_filter(user_roles, department)
        
        # Add document type filter if specified
        if document_type:
            retrieval_filter = {
                "andAll": [
                    retrieval_filter,
                    {"equals": {"key": "documentType", "value": document_type}}
                ]
            }
        
        response = self.client.retrieve(
            knowledgeBaseId=self.knowledge_base_id,
            retrievalQuery={"text": query},
            retrievalConfiguration={
                "vectorSearchConfiguration": {
                    "numberOfResults": max_results,
                    "filter": retrieval_filter
                }
            }
        )
        
        return response
    
    def retrieve_and_generate(
        self,
        query: str,
        user_roles: List[str],
        department: Optional[str] = None,
        model_id: str = "anthropic.claude-3-sonnet-20240229-v1:0"
    ) -> Dict[str, Any]:
        """
        Retrieve documents and generate a response using a foundation model.
        """
        retrieval_filter = self.build_access_filter(user_roles, department)
        
        response = self.client.retrieve_and_generate(
            input={"text": query},
            retrieveAndGenerateConfiguration={
                "type": "KNOWLEDGE_BASE",
                "knowledgeBaseConfiguration": {
                    "knowledgeBaseId": self.knowledge_base_id,
                    "modelArn": f"arn:aws:bedrock:us-east-1::foundation-model/{model_id}",
                    "retrievalConfiguration": {
                        "vectorSearchConfiguration": {
                            "filter": retrieval_filter
                        }
                    }
                }
            }
        )
        
        return response


# Example usage
if __name__ == "__main__":
    kb = KnowledgeBaseClient(knowledge_base_id="YOUR_KB_ID")
    
    # Example 1: Engineer querying for architecture docs
    results = kb.retrieve(
        query="What are the best practices for microservices?",
        user_roles=["engineer"],
        department="engineering",
        document_type="guide"
    )
    print("Engineer query results:", json.dumps(results, indent=2))
    
    # Example 2: Executive querying for financial data
    results = kb.retrieve_and_generate(
        query="Summarize our Q3 financial performance",
        user_roles=["executive", "finance"],
        department="finance"
    )
    print("Executive query results:", results['output']['text'])
    
    # Example 3: New employee querying HR policies
    results = kb.retrieve(
        query="What is the PTO policy?",
        user_roles=["employee"],  # Basic role, can only see public docs
        department="hr"
    )
    print("Employee query results:", json.dumps(results, indent=2))
```

### Step 5: Build the API Layer

#### Lambda Function with Access Control

```python
import json
import boto3
from typing import Dict, Any

# Initialize clients
bedrock_client = boto3.client('bedrock-agent-runtime')
KNOWLEDGE_BASE_ID = "YOUR_KB_ID"

def get_user_context(event: Dict[str, Any]) -> Dict[str, Any]:
    """
    Extract user context from the request.
    In production, this would come from JWT claims, Cognito, or IAM.
    """
    # Example: Extract from request context or headers
    authorizer = event.get('requestContext', {}).get('authorizer', {})
    
    return {
        "user_id": authorizer.get('user_id', 'anonymous'),
        "roles": authorizer.get('roles', ['employee']),
        "department": authorizer.get('department'),
        "access_level": authorizer.get('access_level', 'public')
    }

def build_filter(user_context: Dict[str, Any], query_params: Dict[str, Any]) -> Dict[str, Any]:
    """Build metadata filter based on user context and query parameters."""
    filters = []
    
    # 1. Access control filter (always applied)
    user_roles = user_context.get('roles', ['employee'])
    access_filter = {
        "orAll": [
            {"equals": {"key": "accessLevel", "value": "public"}},
            {"in": {"key": "allowedRoles", "value": user_roles}}
        ]
    }
    filters.append(access_filter)
    
    # 2. Optional filters from query parameters
    if query_params.get('department'):
        filters.append({
            "equals": {"key": "department", "value": query_params['department']}
        })
    
    if query_params.get('documentType'):
        filters.append({
            "equals": {"key": "documentType", "value": query_params['documentType']}
        })
    
    if query_params.get('year'):
        filters.append({
            "equals": {"key": "year", "value": int(query_params['year'])}
        })
    
    if query_params.get('tags'):
        tags = query_params['tags'].split(',')
        filters.append({
            "in": {"key": "tags", "value": tags}
        })
    
    # Combine filters
    if len(filters) == 1:
        return filters[0]
    return {"andAll": filters}

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    API Gateway Lambda handler for knowledge base queries.
    """
    try:
        # Parse request
        body = json.loads(event.get('body', '{}'))
        query = body.get('query')
        query_params = event.get('queryStringParameters', {}) or {}
        
        if not query:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Query is required'})
            }
        
        # Get user context for access control
        user_context = get_user_context(event)
        
        # Build metadata filter
        metadata_filter = build_filter(user_context, query_params)
        
        # Query knowledge base
        response = bedrock_client.retrieve_and_generate(
            input={"text": query},
            retrieveAndGenerateConfiguration={
                "type": "KNOWLEDGE_BASE",
                "knowledgeBaseConfiguration": {
                    "knowledgeBaseId": KNOWLEDGE_BASE_ID,
                    "modelArn": "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-sonnet-20240229-v1:0",
                    "retrievalConfiguration": {
                        "vectorSearchConfiguration": {
                            "numberOfResults": 5,
                            "filter": metadata_filter
                        }
                    }
                }
            }
        )
        
        # Extract citations
        citations = []
        for citation in response.get('citations', []):
            for ref in citation.get('retrievedReferences', []):
                citations.append({
                    'content': ref.get('content', {}).get('text', '')[:200] + '...',
                    'location': ref.get('location', {}),
                    'metadata': ref.get('metadata', {})
                })
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'answer': response['output']['text'],
                'citations': citations,
                'sessionId': response.get('sessionId')
            })
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'Internal server error'})
        }
```

---

## Access Control Patterns

### Pattern 1: Role-Based Access Control (RBAC)

```
User Roles → Metadata Filter → Restricted Results

┌──────────────────────────────────────────────────────────────┐
│                                                               │
│   User: alice@company.com                                    │
│   Roles: ["engineer", "tech-lead"]                           │
│                                                               │
│   Query: "What's our deployment process?"                    │
│                                                               │
│   Filter Applied:                                             │
│   {                                                          │
│     "orAll": [                                               │
│       {"equals": {"key": "accessLevel", "value": "public"}}, │
│       {"in": {"key": "allowedRoles",                         │
│               "value": ["engineer", "tech-lead"]}}           │
│     ]                                                        │
│   }                                                          │
│                                                               │
│   Result: Engineering docs + public docs                     │
│           (NOT finance confidential docs)                    │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### Pattern 2: Department-Based Access

```python
# Users can only query documents from their department + public docs
def department_filter(user_department: str) -> Dict:
    return {
        "orAll": [
            {"equals": {"key": "accessLevel", "value": "public"}},
            {"equals": {"key": "department", "value": user_department}}
        ]
    }
```

### Pattern 3: Hierarchical Access Levels

```python
# Access levels with hierarchy: public < internal < confidential < restricted
ACCESS_HIERARCHY = {
    "public": 0,
    "internal": 1,
    "confidential": 2,
    "restricted": 3
}

def hierarchical_access_filter(user_access_level: str) -> Dict:
    user_level = ACCESS_HIERARCHY.get(user_access_level, 0)
    
    # User can see documents at or below their access level
    allowed_levels = [
        level for level, value in ACCESS_HIERARCHY.items() 
        if value <= user_level
    ]
    
    return {
        "in": {"key": "accessLevel", "value": allowed_levels}
    }
```

### Pattern 4: Combined Multi-Tenant Filter

```python
def multi_tenant_filter(
    tenant_id: str,
    user_roles: List[str],
    user_department: str
) -> Dict:
    """
    Combines tenant isolation with role and department access.
    """
    return {
        "andAll": [
            # Tenant isolation (always required)
            {"equals": {"key": "tenantId", "value": tenant_id}},
            
            # Role-based access
            {"orAll": [
                {"equals": {"key": "accessLevel", "value": "public"}},
                {"in": {"key": "allowedRoles", "value": user_roles}}
            ]},
            
            # Department scoping (optional)
            {"orAll": [
                {"equals": {"key": "department", "value": "shared"}},
                {"equals": {"key": "department", "value": user_department}}
            ]}
        ]
    }
```

---

## Filter Operators Reference

Amazon Bedrock Knowledge Bases support these filter operators:

| Operator | Description | Example |
|----------|-------------|---------|
| `equals` | Exact match | `{"equals": {"key": "department", "value": "finance"}}` |
| `notEquals` | Not equal | `{"notEquals": {"key": "status", "value": "archived"}}` |
| `greaterThan` | Greater than (numbers/dates) | `{"greaterThan": {"key": "year", "value": 2024}}` |
| `greaterThanOrEquals` | >= | `{"greaterThanOrEquals": {"key": "priority", "value": 5}}` |
| `lessThan` | Less than | `{"lessThan": {"key": "year", "value": 2026}}` |
| `lessThanOrEquals` | <= | `{"lessThanOrEquals": {"key": "price", "value": 100}}` |
| `in` | Value in list | `{"in": {"key": "tags", "value": ["aws", "cloud"]}}` |
| `notIn` | Value not in list | `{"notIn": {"key": "status", "value": ["draft", "archived"]}}` |
| `startsWith` | String prefix | `{"startsWith": {"key": "documentId", "value": "eng-"}}` |
| `stringContains` | Substring match | `{"stringContains": {"key": "title", "value": "guide"}}` |
| `listContains` | List contains value | `{"listContains": {"key": "authors", "value": "John"}}` |
| `andAll` | All conditions must match | `{"andAll": [filter1, filter2]}` |
| `orAll` | Any condition matches | `{"orAll": [filter1, filter2]}` |

---

## Automation: Metadata Generation Script

Automate metadata file creation when documents are uploaded:

```python
import boto3
import json
import os
from datetime import datetime
from typing import Dict, Any
import hashlib

s3 = boto3.client('s3')

def generate_document_id(bucket: str, key: str) -> str:
    """Generate a unique document ID based on S3 location."""
    return hashlib.md5(f"{bucket}/{key}".encode()).hexdigest()[:12]

def extract_department(key: str) -> str:
    """Extract department from S3 key path."""
    parts = key.split('/')
    if len(parts) >= 2 and parts[0] == 'documents':
        return parts[1]
    return 'general'

def determine_document_type(key: str) -> str:
    """Determine document type from filename."""
    filename = os.path.basename(key).lower()
    if 'policy' in filename or 'handbook' in filename:
        return 'policy'
    elif 'report' in filename:
        return 'report'
    elif 'guide' in filename or 'documentation' in filename:
        return 'guide'
    elif 'contract' in filename or 'agreement' in filename:
        return 'contract'
    else:
        return 'document'

def get_default_access(department: str) -> Dict[str, Any]:
    """Get default access settings by department."""
    access_map = {
        'hr': {'level': 'internal', 'roles': ['hr', 'manager', 'executive', 'admin']},
        'finance': {'level': 'confidential', 'roles': ['finance', 'executive', 'admin']},
        'legal': {'level': 'confidential', 'roles': ['legal', 'executive', 'admin']},
        'engineering': {'level': 'internal', 'roles': ['engineer', 'tech-lead', 'manager', 'admin']},
        'marketing': {'level': 'internal', 'roles': ['marketing', 'sales', 'manager', 'admin']},
        'general': {'level': 'public', 'roles': ['all']}
    }
    return access_map.get(department, access_map['general'])

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Lambda triggered by S3 upload to auto-generate metadata files.
    """
    for record in event['Records']:
        bucket = record['s3']['bucket']['name']
        key = record['s3']['object']['key']
        
        # Skip metadata files and non-document paths
        if key.endswith('.metadata.json') or not key.startswith('documents/'):
            continue
        
        # Extract information
        department = extract_department(key)
        doc_type = determine_document_type(key)
        access = get_default_access(department)
        
        # Generate metadata
        metadata = {
            "metadataAttributes": {
                "documentId": generate_document_id(bucket, key),
                "department": department,
                "documentType": doc_type,
                "accessLevel": access['level'],
                "allowedRoles": access['roles'],
                "author": "Auto-generated",
                "createdDate": datetime.now().strftime('%Y-%m-%d'),
                "sourceKey": key,
                "tags": [department, doc_type]
            }
        }
        
        # Write metadata file
        metadata_key = f"{key}.metadata.json"
        s3.put_object(
            Bucket=bucket,
            Key=metadata_key,
            Body=json.dumps(metadata, indent=2),
            ContentType='application/json'
        )
        
        print(f"Created metadata: s3://{bucket}/{metadata_key}")
    
    return {'statusCode': 200, 'body': 'Metadata generated'}
```

---

## Best Practices

### 1. Metadata Schema Governance
- Define a standard schema and validate all metadata files
- Use enums for controlled values (departments, access levels)
- Version your schema for backward compatibility

### 2. Security
- Always apply access filters at query time—don't rely on frontend filtering
- Use IAM roles with least privilege for Lambda and Bedrock access
- Encrypt S3 buckets and enable versioning

### 3. Performance
- Limit the number of filter conditions to avoid query complexity
- Use indexed metadata attributes for frequently filtered fields
- Consider separate knowledge bases for highly isolated content

### 4. Monitoring
- Log all queries with user context and filters applied
- Monitor for unusual access patterns (potential data leaks)
- Track filter hit rates to optimize metadata design

### 5. Data Lifecycle
- Implement metadata update automation when documents change
- Archive old documents with appropriate metadata updates
- Sync knowledge base regularly after document changes

---

## Summary

This solution provides a robust approach to building a knowledge base with metadata filtering in AWS:

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Storage** | Amazon S3 | Documents + metadata JSON files |
| **Vector Search** | Bedrock KB + OpenSearch | Semantic search with embeddings |
| **Filtering** | Bedrock Retrieve API | Query-time metadata filters |
| **Access Control** | Lambda + Metadata | Role/department-based filtering |
| **Generation** | Bedrock + Claude/Titan | RAG response generation |

**Key Takeaways:**
1. ✅ Design your metadata schema upfront
2. ✅ Implement access control at query time using filters
3. ✅ Automate metadata generation for consistency
4. ✅ Use hierarchical access patterns for flexible permissions
5. ✅ Monitor and audit all queries with user context

---

**Related Posts:**
- [Amazon QuickSuite Knowledge Base: S3 Implementation and Permission Control](/2025/12/16/amazon-quicksuite-knowledge-base-s3-implementation/)
- [Amazon Quick Suite vs Amazon Q](/2025/10/20/amazon-quick-suite-vs-amazon-q/)

**References:**
- [Amazon Bedrock Knowledge Bases Documentation](https://docs.aws.amazon.com/bedrock/latest/userguide/knowledge-base.html)
- [Bedrock Retrieval Filter API Reference](https://docs.aws.amazon.com/bedrock/latest/APIReference/API_RetrievalFilter.html)
- [S3 Metadata for Knowledge Bases](https://docs.aws.amazon.com/bedrock/latest/userguide/knowledge-base-s3.html)

