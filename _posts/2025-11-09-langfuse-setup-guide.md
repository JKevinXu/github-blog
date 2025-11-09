---
layout: post
title: "Setting Up Langfuse: LLM Observability in 5 Minutes"
date: 2025-11-09 10:00:00 -0500
categories: [ai, observability, llm]
tags: [langfuse, observability, llm, langchain, langgraph, monitoring]
---

# Setting Up Langfuse: LLM Observability in 5 Minutes

Langfuse gives you visibility into what your LLM applications are doing—token usage, costs, latency, and complete traces of model interactions. It's open-source observability specifically built for AI applications.

**Key Point: You DON'T need to host anything.** Langfuse offers a free cloud service. Self-hosting is optional for data privacy requirements.

---

## TL;DR

**What is Langfuse?** Observability for LLM apps. See every model call, track costs, debug failures.

**Do I need to host it?** No. Use the free cloud service at `cloud.langfuse.com`. Self-hosting is optional.

**Setup time:** 5 minutes for cloud, about an hour for self-hosted.

**Integrations:**
- LangChain/LangGraph
- OpenAI SDK
- AWS Bedrock
- Any LLM via API

**What you get:**
- Trace every LLM call
- Track token usage and costs
- Debug with complete execution visibility
- Monitor production performance

---

## Cloud Setup (Recommended - No Hosting Needed)

Most users should start here. The cloud service is free for up to 50K observations/month and requires no infrastructure.

### Why Cloud First?

- **Zero setup:** No servers, databases, or DevOps
- **Free tier:** 50K observations/month covers development and small production
- **Always updated:** New features automatically available
- **Reliable:** AWS infrastructure with backups

### When Self-Host Instead?

Only if you have:
- **Strict data residency requirements** (healthcare, finance, government)
- **Massive scale** (millions of traces/month where cloud costs exceed self-hosting)
- **Air-gapped environments** (can't send data to external services)

For 95% of users, cloud is the right choice.

---

## Cloud Setup (5 Minutes)

### Step 1: Create Account

1. Go to `https://cloud.langfuse.com`
2. Sign up (GitHub, Google, or email)
3. Create a project

### Step 2: Get API Keys

In project settings → API Keys:
- **Public Key** (pk-lf-...)
- **Secret Key** (sk-lf-...)
- **Host**: `https://cloud.langfuse.com`

Store in environment variables:
```bash
export LANGFUSE_PUBLIC_KEY="pk-lf-..."
export LANGFUSE_SECRET_KEY="sk-lf-..."
export LANGFUSE_HOST="https://cloud.langfuse.com"
```

### Step 3: Install & Test

Install SDK:
```bash
pip install langfuse
```

Test connection:

```python
from langfuse import Langfuse

langfuse = Langfuse()  # Uses environment variables

trace = langfuse.trace(name="test")
trace.generation(
    model="gpt-4",
    input="Hello",
    output="Hi there!"
)
langfuse.flush()
```

Check your dashboard at `cloud.langfuse.com` - you'll see your first trace.

Done! That's the complete cloud setup.

---

## Self-Hosted Setup (Optional)

Only needed for strict data privacy requirements. Most users should use cloud instead.

### Quick Docker Compose Setup

Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  langfuse:
    image: langfuse/langfuse:latest
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://langfuse:changeme@postgres:5432/langfuse
      NEXTAUTH_SECRET: "change-to-random-string"
      SALT: "change-to-another-random-string"
      NEXTAUTH_URL: http://localhost:3000
  
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: langfuse
      POSTGRES_PASSWORD: changeme
      POSTGRES_DB: langfuse
    volumes:
      - postgres:/var/lib/postgresql/data

volumes:
  postgres:
```

Run:
```bash
docker-compose up -d
```

Access at `http://localhost:3000`. Change passwords and secrets before production use.

---

## Integrations

### LangChain

```bash
pip install langfuse langchain-openai
```

```python
from langchain_openai import ChatOpenAI
from langfuse.callback import CallbackHandler

handler = CallbackHandler()  # Uses env vars

llm = ChatOpenAI(model="gpt-4")
response = llm.invoke(
    "Explain quantum computing",
    config={"callbacks": [handler]}
)
```

Works with chains, agents, and all LangChain components. Traces show complete execution hierarchy.

---

### LangGraph

Same callback pattern as LangChain:

```python
from langgraph.graph import StateGraph, END
from langfuse.callback import CallbackHandler

workflow = StateGraph(WorkflowState)
# ... add nodes and edges ...
app = workflow.compile()

handler = CallbackHandler(trace_name="my-workflow")
result = app.invoke(initial_state, config={"callbacks": [handler]})
```

Traces show each node execution and state transitions.

---

### OpenAI SDK

Drop-in wrapper:

```bash
pip install langfuse openai
```

```python
from langfuse.openai import openai  # Replace openai import

response = openai.ChatCompletion.create(
    model="gpt-4",
    messages=[{"role": "user", "content": "Hello"}]
)
```

That's it. All calls automatically traced. Supports streaming.

---

### AWS Bedrock

Manual wrapper needed:

```python
from langfuse import Langfuse
import boto3, json

langfuse = Langfuse()
bedrock = boto3.client('bedrock-runtime')

def call_bedrock(prompt):
    trace = langfuse.trace(name="bedrock")
    
    response = bedrock.invoke_model(
        modelId="anthropic.claude-3-sonnet-20240229-v1:0",
        body=json.dumps({
            "anthropic_version": "bedrock-2023-05-31",
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": 1024
        })
    )
    
    result = json.loads(response['body'].read())
    output = result['content'][0]['text']
    
    trace.generation(
        model="claude-3-sonnet",
        input=prompt,
        output=output,
        usage=result.get('usage', {})
    )
    langfuse.flush()
    return output
```

---

## What You Get

Once set up, the Langfuse dashboard shows:

- **All traces**: Every LLM call with input/output, tokens, cost, latency
- **Analytics**: Token usage trends, costs per user, error rates
- **Prompt management**: Version and track prompt templates
- **User feedback**: Collect ratings on responses

Click any trace to see complete execution details including nested calls, state changes, and timing breakdown.

---

## Production Tips

**Call flush() in Lambda/batch jobs:**
```python
langfuse.flush()  # Before process exits
```

**Sample high-volume apps:**
```python
if random.random() < 0.1:  # Trace 10%
    config = {"callbacks": [handler]}
```

**Secure credentials:** Use environment variables or secrets managers, never hardcode.

**Filter PII:** Sanitize sensitive data before logging.

**Monitor costs:** Free tier = 50K observations/month. Self-host at scale.

---

## Conclusion

Langfuse gives you visibility into LLM applications that would otherwise be black boxes. The cloud service requires no hosting—just sign up, add callbacks, and start seeing what your models are doing.

Start with cloud, instrument one workflow, explore the dashboard. Self-host only if you have strict data requirements. The free tier covers most development and small production use.

That's it. Five minutes to working observability.

---

## Resources

- [Langfuse Cloud](https://cloud.langfuse.com) - Free tier signup
- [Documentation](https://langfuse.com/docs)
- [GitHub](https://github.com/langfuse/langfuse)
- [Discord Community](https://discord.gg/langfuse)

---

*Updated November 2025. Check docs for latest features.*

