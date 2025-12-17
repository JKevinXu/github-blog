---
layout: post
title: "Amazon QuickSuite Knowledge Base: S3 Implementation and Permission Limitations"
date: 2025-12-16
tags: [aws, amazon-quick-suite, knowledge-base, s3, permissions]
---

# Amazon QuickSuite Knowledge Base: S3 Implementation and Permission Limitations

Amazon QuickSuite's **Quick Index** can index documents from Amazon S3. This post covers implementation and an important limitation: **no document-level access control**.

---

## Quick Summary

| Aspect | Status |
|--------|--------|
| S3 Integration | ✅ Supported |
| Document Metadata | ✅ Supported |
| **Document-Level ACL** | ❌ **Not supported** |
| Permission Granularity | Knowledge base level only |

---

## Setting Up S3 Knowledge Base

### Step 1: Create Data Access Integration

1. In QuickSuite console → **Integrations**
2. Select **Amazon S3**
3. Configure IAM role with S3 read access
4. Specify bucket(s) to connect

### Step 2: Create Knowledge Base

1. Select folders/content to index
2. Configure filters (file types, paths)
3. Set sync schedule (hourly/daily/weekly)

---

## Document Metadata

Metadata enhances searchability and enables source citations.

### File Naming

```
<document>.<extension>.metadata.json
```

Example: `report.pdf` → `report.pdf.metadata.json`

### Metadata Structure

```json
{
  "DocumentId": "unique-doc-id",
  "Title": "Q3 Sales Report",
  "ContentType": "PDF",
  "Attributes": {
    "_source_uri": "https://intranet.company.com/reports/q3-sales",
    "_authors": ["Sales Team"],
    "_category": "Reports",
    "_created_at": "2025-01-15T00:00:00Z"
  }
}
```

### Key Fields

| Field | Purpose |
|-------|---------|
| `DocumentId` | Unique identifier (required) |
| `_source_uri` | Clickable citation link in results |
| `Title` | Document title for display |
| `ContentType` | PDF, HTML, MS_WORD, etc. |

---

## ⚠️ Permission Control Limitation

**QuickSuite only supports knowledge-base-level access control.**

This means:
- ✅ You can control who accesses a knowledge base
- ❌ You **cannot** restrict individual documents within a KB
- ❌ No `_acl` metadata field for user/group filtering

### Workaround: Multiple Knowledge Bases

Create separate KBs by audience:

```
"HR-Confidential"     → HR Leadership only
"HR-Policies"         → All employees  
"Engineering-Docs"    → Engineering team
```

### Need Document-Level ACL?

Consider **Amazon Q Business** instead, which supports:
- Document-level access control
- User/group filtering per document
- ACL sync from source systems (SharePoint, etc.)

---

## When to Use What

| Need | Solution |
|------|----------|
| BI + knowledge search in one platform | QuickSuite |
| KB-level access is sufficient | QuickSuite |
| Document-level permissions required | Q Business |
| Mixed-sensitivity docs in same topic | Q Business |

---

## Key Takeaways

1. S3 integration works via Data Access Integrations
2. Metadata files (`.metadata.json`) enable citations via `_source_uri`
3. **Permission control is KB-level only** — no per-document ACL
4. For fine-grained access, use multiple KBs or switch to Q Business

---

**Related:** [Amazon Quick Suite vs Amazon Q](/2025/10/20/amazon-quick-suite-vs-amazon-q/)
