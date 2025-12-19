---
layout: post
title: "Amazon QuickSuite Knowledge Base: S3 Implementation and Permission Control"
date: 2025-12-16
tags: [aws, amazon-quick-suite, knowledge-base, s3, permissions, enterprise-ai]
---

# Amazon QuickSuite Knowledge Base: S3 Implementation and Permission Control

Amazon QuickSuite's **Quick Index** provides a unified knowledge foundation that can index documents from Amazon S3. This post covers how to implement a knowledge base using S3 with metadata, and importantly, what you need to know about **fine-grained permission control** (spoiler: it's limited).

---

## TL;DR

| Aspect | QuickSuite Knowledge Base |
|--------|--------------------------|
| **S3 Integration** | ✅ Full support via Data Access Integrations |
| **Metadata Files** | ✅ Supported (`*.metadata.json` format) |
| **Document-Level ACL** | ❌ **NOT supported** |
| **Permission Granularity** | Knowledge base level only (coarse-grained) |
| **Alternative for Fine ACL** | Use Amazon Q Business instead |

---

## Implementing Knowledge Bases with S3

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Amazon QuickSuite                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌──────────────────────┐     ┌─────────────────────────────┐ │
│   │ Data Access          │     │   Knowledge Base            │ │
│   │ Integration          │────▶│   (Quick Index)             │ │
│   │ (S3 Connection)      │     │                             │ │
│   └──────────────────────┘     └─────────────────────────────┘ │
│              │                              │                   │
└──────────────│──────────────────────────────│───────────────────┘
               │                              │
               ▼                              ▼
       ┌───────────────┐             ┌────────────────┐
       │  Amazon S3    │             │  AI-Powered    │
       │  ┌─────────┐  │             │  - Search      │
       │  │Documents│  │             │  - Q&A         │
       │  │         │  │             │  - Citations   │
       │  │Metadata │  │             └────────────────┘
       │  └─────────┘  │
       └───────────────┘
```

### Step 1: Create a Data Access Integration

In QuickSuite console:
1. Navigate to **Integrations** section
2. Select **Amazon S3** as data source
3. Configure authentication (IAM role with S3 access)
4. Specify the S3 bucket(s) to connect

```bash
# Example IAM policy for the integration role
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::your-knowledge-bucket",
        "arn:aws:s3:::your-knowledge-bucket/*"
      ]
    }
  ]
}
```

**Important**: Data Access Integrations set up the connection but cannot be used directly for queries—you must create a Knowledge Base from the integration.

### Step 2: Create Knowledge Base

From the established integration:
1. Select specific folders or content to index
2. Configure content filters:
   - **Include filters**: Specify paths to include
   - **File type restrictions**: PDF, DOCX, TXT, HTML, etc.
   - **Folder selections**: Limit to specific directories
3. Set synchronization schedule (hourly, daily, weekly)

---

## Adding Document Metadata

Metadata enhances searchability and provides context for AI-powered retrieval.

### Metadata File Naming Convention

```
<document>.<extension>.metadata.json
```

**Examples:**
| Document | Metadata File |
|----------|---------------|
| `report.pdf` | `report.pdf.metadata.json` |
| `policy.docx` | `policy.docx.metadata.json` |
| `data.csv` | `data.csv.metadata.json` |

### File Placement Options

**Option 1: Same Directory**
```
s3://bucket/documents/
  ├── contract.pdf
  └── contract.pdf.metadata.json
```

**Option 2: Parallel Directory Structure**
```
s3://bucket/
  ├── documents/
  │   └── legal/
  │       └── contract.pdf
  └── metadata/
      └── documents/
          └── legal/
              └── contract.pdf.metadata.json
```

### Metadata JSON Structure

```json
{
  "_document_id": "doc-unique-id-12345",
  "_source_uri": "https://internal-portal.company.com/docs/contract",
  "title": "Vendor Service Agreement 2025",
  "author": "Legal Department",
  "department": "Legal",
  "document_type": "Contract",
  "created_date": "2025-01-15",
  "last_modified": "2025-06-20",
  "classification": "Internal",
  "keywords": ["vendor", "service", "agreement", "SLA"]
}
```

### Reserved Metadata Fields

| Field | Type | Purpose |
|-------|------|---------|
| `_document_id` | String | **Required**. Unique identifier for the document |
| `_source_uri` | String | Clickable citation link shown in chat results |

### Custom Attributes

You can add any custom attributes that make sense for your use case:

```json
{
  "_document_id": "hr-policy-001",
  "_source_uri": "https://hr.company.com/policies/remote-work",
  
  // Custom attributes
  "policy_number": "HR-2025-042",
  "effective_date": "2025-03-01",
  "review_date": "2026-03-01",
  "applicable_regions": ["US", "EU", "APAC"],
  "policy_owner": "hr-team@company.com",
  "compliance_required": true
}
```

### Metadata Constraints

- **Character limit**: Combined S3 key + metadata prefix + `.metadata.json` ≤ 1,024 characters
- **Encoding**: UTF-8 text file without BOM marker
- **Format**: Valid JSON

---

## Fine-Grained Permission Control

### ⚠️ The Limitation You Need to Know

**Amazon QuickSuite provides COARSE-GRAINED access control only.**

| What You CAN Do | What You CANNOT Do |
|-----------------|-------------------|
| Control access to entire knowledge bases | Per-document ACLs |
| Assign Owner/Contributor/Viewer roles on integrations | User/group filtering within a KB |
| Use IAM policies on underlying S3 | `_acl` metadata field support |

This is a significant limitation if you need documents in the same knowledge base to be visible to different users based on their roles or groups.

### Permission Levels in QuickSuite

```
┌─────────────────────────────────────────────────────────────┐
│                    Permission Hierarchy                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Level 1: Knowledge Base Access                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Who can access this knowledge base?                    │ │
│  │ → Controlled via QuickSuite admin console              │ │
│  │ → All-or-nothing access to KB contents                 │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                              │
│  Level 2: Integration Roles                                  │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Owner: Full control (delete, manage permissions)       │ │
│  │ Contributor: Can use and modify settings               │ │
│  │ Viewer: Can view details and use enabled actions       │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                              │
│  Level 3: Underlying AWS IAM                                 │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Controls which S3 paths the integration can read       │ │
│  │ Does NOT filter results for end users                  │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Workaround: Multiple Knowledge Bases

Since document-level ACL isn't supported, create separate knowledge bases for different audiences:

```
Knowledge Base: "HR-Confidential"
├── S3 Path: s3://docs/hr/confidential/
├── Access: HR Leadership only
└── Documents: Salary bands, org changes, investigations

Knowledge Base: "HR-Policies"  
├── S3 Path: s3://docs/hr/policies/
├── Access: All employees
└── Documents: PTO policy, benefits guide, handbook

Knowledge Base: "Engineering-Internal"
├── S3 Path: s3://docs/engineering/
├── Access: Engineering team
└── Documents: Architecture docs, runbooks, postmortems

Knowledge Base: "Company-Wide"
├── S3 Path: s3://docs/public/
├── Access: Everyone
└── Documents: Company announcements, org chart, FAQs
```

### Workaround: IAM + S3 Organization

Organize S3 buckets/paths by access level and use IAM policies:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::company-docs/department/${aws:PrincipalTag/Department}/*",
      "Condition": {
        "StringEquals": {
          "aws:PrincipalTag/Department": ["Engineering", "Product", "Design"]
        }
      }
    }
  ]
}
```

### Workaround: Lake Formation Integration

For structured data, integrate with AWS Lake Formation for:
- Column-level permissions
- Row-level security
- Centralized access management
- Works with Glue Data Catalog

---

## Comparison: QuickSuite vs Q Business for Knowledge Bases

If document-level ACL is critical for your use case, consider **Amazon Q Business** instead:

| Feature | QuickSuite | Q Business |
|---------|------------|------------|
| **Document-Level ACL** | ❌ No | ✅ Yes |
| **`_acl` Metadata Field** | ❌ Not supported | ✅ Supported |
| **Permission Inheritance** | No | Yes (syncs source permissions) |
| **User/Group Filtering** | KB level only | Document level |
| **BI Dashboards** | ✅ Quick Sight | ❌ No |
| **Workflow Automation** | ✅ Quick Flows/Automate | ❌ No |
| **Research Agent** | ✅ Quick Research | ❌ No |

### Q Business Document-Level ACL Example

If you need true document-level permissions, Q Business supports this metadata:

```json
{
  "_document_id": "confidential-doc-001",
  "_source_uri": "https://internal.company.com/doc",
  "_acl": {
    "allowedUsers": [
      "alice@company.com",
      "bob@company.com"
    ],
    "allowedGroups": [
      "leadership-team",
      "legal-department"
    ],
    "deniedUsers": [
      "contractor@company.com"
    ],
    "deniedGroups": [
      "interns"
    ]
  }
}
```

---

## Best Practices

### 1. Document Organization

Structure your S3 buckets with permissions in mind:

```
s3://company-knowledge/
├── public/              # All employees
│   ├── policies/
│   ├── announcements/
│   └── training/
├── department/          # By department
│   ├── engineering/
│   ├── sales/
│   ├── hr/
│   └── finance/
├── confidential/        # Leadership only
│   ├── strategy/
│   ├── m-and-a/
│   └── board-materials/
└── metadata/            # Parallel metadata structure
    ├── public/
    ├── department/
    └── confidential/
```

### 2. Metadata Standards

Create a metadata schema for consistency:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["_document_id"],
  "properties": {
    "_document_id": {
      "type": "string",
      "description": "Unique document identifier"
    },
    "_source_uri": {
      "type": "string",
      "format": "uri",
      "description": "Original source URL for citations"
    },
    "title": { "type": "string" },
    "author": { "type": "string" },
    "department": {
      "type": "string",
      "enum": ["Engineering", "Sales", "HR", "Finance", "Legal", "Marketing"]
    },
    "classification": {
      "type": "string",
      "enum": ["Public", "Internal", "Confidential", "Restricted"]
    },
    "created_date": {
      "type": "string",
      "format": "date"
    }
  }
}
```

### 3. Sync Strategy

- **High-change content**: Hourly sync
- **Stable documentation**: Daily sync
- **Archived content**: Weekly or manual sync

### 4. When to Use QuickSuite vs Q Business

**Use QuickSuite Knowledge Base when:**
- ✅ You need BI dashboards + knowledge search in one platform
- ✅ Access control at knowledge base level is sufficient
- ✅ You're already using QuickSight for analytics
- ✅ You need workflow automation (Quick Flows/Automate)

**Use Q Business when:**
- ✅ You need document-level ACL (different users see different docs)
- ✅ Your source systems have existing permissions to sync
- ✅ Compliance requires strict per-document access control
- ✅ You have mixed-sensitivity content in the same topic area

**Use Both when:**
- ✅ You need BI + automation (QuickSuite) AND fine-grained doc access (Q Business)
- ✅ Different use cases for different teams

---

## Summary

Amazon QuickSuite's knowledge base provides solid S3 integration with metadata support, but **lacks document-level fine-grained permissions**. This is a critical consideration for enterprise deployments where different users should see different documents.

**Key Takeaways:**
1. ✅ S3 integration is straightforward via Data Access Integrations
2. ✅ Metadata files enhance search with `_source_uri` for citations
3. ⚠️ Permission control is at the **knowledge base level only**
4. ❌ No `_acl` metadata field support for document-level filtering
5. 🔄 Use multiple KBs or consider Q Business for fine-grained access

For organizations requiring true document-level permissions, either architect around multiple knowledge bases or evaluate Amazon Q Business which supports the `_acl` metadata field for user/group filtering.

---

**Related Posts:**
- [Amazon Quick Suite vs Amazon Q: Understanding AWS's AI Offerings](/2025/10/20/amazon-quick-suite-vs-amazon-q/)

**References:**
- [Amazon QuickSuite S3 Integration Documentation](https://docs.aws.amazon.com/quicksuite/latest/userguide/s3-integration.html)
- [Amazon QuickSuite Knowledge Base Integrations](https://docs.aws.amazon.com/quicksuite/latest/userguide/knowledge-base-integrations.html)
- [Amazon QuickSuite Data Access Integrations](https://docs.aws.amazon.com/quicksuite/latest/userguide/data-access-integrations.html)

