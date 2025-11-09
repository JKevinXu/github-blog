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

### Why Self-Host?

Consider self-hosting only if you have:

**Data Residency Requirements:** Healthcare (HIPAA), finance (SOC2), government deployments where data cannot leave your infrastructure.

**High Volume:** Above 1-2 million observations/month, self-hosting becomes more cost-effective than cloud pricing.

**Custom Modifications:** Need to modify Langfuse source code for specific requirements.

**Air-Gapped Environments:** Networks isolated from internet where cloud isn't an option.

If none of these apply, use the cloud service instead.

### Docker Compose Setup

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  langfuse:
    image: langfuse/langfuse:latest
    ports:
      - "3000:3000"
    environment:
      # Database connection
      DATABASE_URL: postgresql://langfuse:changeme@postgres:5432/langfuse
      
      # Required secrets (generate with: openssl rand -base64 32)
      NEXTAUTH_SECRET: "your-nextauth-secret-here"
      SALT: "your-salt-secret-here"
      
      # URL where Langfuse will be accessed
      NEXTAUTH_URL: http://localhost:3000
      
      # Optional: Disable telemetry
      TELEMETRY_ENABLED: "false"
      
      # Optional: Email configuration for notifications
      # SMTP_HOST: smtp.gmail.com
      # SMTP_PORT: 587
      # SMTP_USER: your-email@gmail.com
      # SMTP_PASSWORD: your-app-password
      # EMAIL_FROM: noreply@yourdomain.com
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/public/health"]
      interval: 30s
      timeout: 10s
      retries: 3
  
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: langfuse
      POSTGRES_PASSWORD: changeme
      POSTGRES_DB: langfuse
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U langfuse"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

**Start services:**
```bash
docker-compose up -d
```

**View logs:**
```bash
docker-compose logs -f langfuse
```

**Access:** Navigate to `http://localhost:3000` and create your admin account.

### Generate Secure Secrets

Before deploying, generate secure values:

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate SALT
openssl rand -base64 32
```

Replace the placeholder values in `docker-compose.yml` with these generated secrets.

### Production Configuration

For production deployments, add:

**Reverse Proxy with SSL:**
```yaml
# nginx.conf
server {
    listen 443 ssl;
    server_name langfuse.yourdomain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Update NEXTAUTH_URL to use HTTPS:
```yaml
NEXTAUTH_URL: https://langfuse.yourdomain.com
```

**Database Backups:**
```bash
# Backup PostgreSQL
docker-compose exec postgres pg_dump -U langfuse langfuse > backup.sql

# Restore
cat backup.sql | docker-compose exec -T postgres psql -U langfuse langfuse
```

Set up automated daily backups:
```bash
# Add to cron
0 2 * * * docker-compose -f /path/to/docker-compose.yml exec postgres pg_dump -U langfuse langfuse | gzip > /backups/langfuse-$(date +\%Y\%m\%d).sql.gz
```

**Resource Limits:**
```yaml
services:
  langfuse:
    # ... other config ...
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

### Using Managed PostgreSQL

For production, use managed database services (AWS RDS, Google Cloud SQL, Azure Database) instead of Docker PostgreSQL:

**1. Create PostgreSQL instance** in your cloud provider (version 12+)

**2. Update docker-compose.yml** to remove postgres service and update DATABASE_URL:

```yaml
services:
  langfuse:
    image: langfuse/langfuse:latest
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://username:password@your-rds-endpoint.region.rds.amazonaws.com:5432/langfuse
      NEXTAUTH_SECRET: "your-secret"
      SALT: "your-salt"
      NEXTAUTH_URL: https://langfuse.yourdomain.com
```

**3. Enable required extension** in your database:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

This separates compute (Langfuse) from storage (PostgreSQL), allowing independent scaling and better reliability.

### Environment Variables Reference

Key configuration options:

**Required:**
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Random secret for auth (min 32 chars)
- `SALT` - Random secret for encryption (min 32 chars)
- `NEXTAUTH_URL` - Public URL where Langfuse is accessed

**Optional:**
- `TELEMETRY_ENABLED` - Set to `false` to disable telemetry (default: `true`)
- `LANGFUSE_DEFAULT_PROJECT_ROLE` - Default role for new users (`VIEWER`, `MEMBER`, `OWNER`)
- `AUTH_DISABLE_SIGNUP` - Set to `true` to disable public signups

**Email (for notifications and password reset):**
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `EMAIL_FROM`

**Full list:** See [Langfuse self-hosting docs](https://langfuse.com/docs/deployment/self-host)

### Connecting Your Application

Once self-hosted instance is running, configure your application to use it:

```bash
export LANGFUSE_PUBLIC_KEY="pk-lf-..."  # From your self-hosted dashboard
export LANGFUSE_SECRET_KEY="sk-lf-..."  # From your self-hosted dashboard
export LANGFUSE_HOST="https://langfuse.yourdomain.com"  # Your URL
```

Or in code:
```python
from langfuse import Langfuse

langfuse = Langfuse(
    public_key="pk-lf-...",
    secret_key="sk-lf-...",
    host="https://langfuse.yourdomain.com"
)
```

### Updating Langfuse

Pull latest image and restart:
```bash
docker-compose pull langfuse
docker-compose up -d
```

Langfuse automatically runs database migrations on startup. For zero-downtime updates, run migrations manually first:
```bash
docker-compose run langfuse npx prisma migrate deploy
docker-compose up -d
```

### Troubleshooting Self-Hosted

**Cannot connect to database:**
- Verify DATABASE_URL is correct
- Check PostgreSQL is running: `docker-compose ps postgres`
- View logs: `docker-compose logs postgres`

**Login issues:**
- Verify NEXTAUTH_URL matches the URL you're accessing
- Check NEXTAUTH_SECRET and SALT are set
- Clear browser cookies and try again

**Performance issues:**
- Check resource limits aren't being hit
- Monitor PostgreSQL performance with `docker stats`
- Consider using managed PostgreSQL for better performance
- Add connection pooling with PgBouncer for high traffic

**Data persistence:**
- Verify Docker volume exists: `docker volume ls`
- Backup volume: `docker run --rm -v postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz /data`

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

