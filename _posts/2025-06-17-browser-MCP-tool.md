---
layout: post
title: "Building a Website Browser Tool: Core Architecture and Design Patterns"
date: 2025-06-17 10:00:00 -0500
categories: [development, automation]
tags: [browser-automation, puppeteer, web-scraping, typescript, mcp-tool]
---

# Building a Website Browser Tool: Core Architecture and Design Patterns

This post explores the key architecture and patterns for building a website browsing tool that can programmatically access and extract content from multiple internal websites.

## Overview

The browser tool provides programmatic access to multiple websites and services with:

- **Multi-platform support**: Wiki pages, code repositories, task management, security dashboards
- **Concurrent processing**: Batch processing with configurable limits
- **Authentication handling**: Automatic SSO integration
- **Content extraction**: HTML to markdown conversion

## Core Architecture: Strategy Pattern

Each website type has its own processing strategy:

```typescript
export class UrlProcessor {
  public async processSingleUrl(url: string): Promise<any> {
    const matcher = matchers.find((m) => m.condition(url));
    if (!matcher) {
      throw new Error(`Unrecognized URL format: ${url}`);
    }
    return await this.processWithStrategy(matcher, url);
  }
}
```

### Strategy Registration

Strategies self-register with URL patterns:

```typescript
export class DocumentationStrategy {
  static readonly toolRegistration = {
    condition: (input: string): boolean => input.startsWith("https://docs.company.com"),
    process: async (input: string) => {
      const strategy = new DocumentationStrategy();
      return await strategy.execute(input);
    },
  };
}
```

Common strategy types:
- `WikiStrategy` - Internal wikis
- `CodeRepositoryStrategy` - Code repositories
- `TaskManagementStrategy` - Project management
- `CollaborativeDocsStrategy` - Shared documents

## Browser Automation with Puppeteer

For JavaScript-heavy websites, the tool uses **Puppeteer** for browser automation:

### Browser Setup

```typescript
const browser = await puppeteer.launch({
  headless: true,
  executablePath: installedBrowser.executablePath,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});
```

### Cookie Management

Automatic authentication cookie handling across domains:

```typescript
const relevantDomains = [
  url.hostname,
  "auth.company.com",
  "sso.company.com",
];

// Transfer authentication cookies to browser
for (const domain of relevantDomains) {
  const cookies = cookieJar.getCookiesForHostname(domain);
  if (cookies) {
    await page.setCookie(...parsedCookies);
  }
}
```

## Authentication System

Enterprise SSO integration with automatic cookie management:

```typescript
export class AuthenticationClient {
  private cookieFilePath: string;
  private cookies: Map<string, string> = new Map();

  private constructor() {
    this.cookieFilePath = path.join(os.homedir(), ".auth", "cookie");
    this.loadAuthCookies();
  }
}
```

### Authentication Flow

```typescript
private async handleAuthentication(page: puppeteer.Page): Promise<void> {
  const isAuthPage = await page.evaluate(() => {
    return window.location.href.includes('auth.company.com');
  });

  if (isAuthPage) {
    const continueButton = await page.$('button[type="submit"]');
    if (continueButton) {
      await continueButton.click();
      await page.waitForNavigation({ timeout: 120_000 });
    }
  }
}
```

## Content Processing

The tool extracts and converts web content to markdown:

```typescript
// Convert links to absolute URLs
await page.evaluate((baseUrl) => {
  const links = Array.from(document.querySelectorAll("a[href]"));
  links.forEach((link) => {
    const href = link.getAttribute("href");
    if (href) {
      const absoluteUrl = new URL(href, baseUrl).toString();
      link.setAttribute("href", absoluteUrl);
    }
  });
}, url.toString());
```

### Content Extraction

Uses Mozilla's Readability algorithm for clean content extraction:

```typescript
const dom = new JSDOM(htmlContent, { url: url.toString() });
const reader = new Readability(dom.window.document);
const article = reader.parse();

if (article && article.content) {
  const turndownService = new TurndownService();
  result.mainContent = turndownService.turndown(article.content);
}
```

## Performance

### Batch Processing

Supports concurrent processing of multiple URLs:

```typescript
const results = await processBatch(
  urls,
  async (url) => await urlProcessor.processSingleUrl(url),
  { concurrencyLimit: 5 }
);
```

## Technology Stack

**Core Technologies:**
- **Puppeteer**: Browser automation
- **JSDOM**: Server-side DOM manipulation  
- **Turndown**: HTML to Markdown conversion
- **Readability**: Content extraction
- **Zod**: Parameter validation

## Adding New Websites

The system uses **static registration** - new websites require code changes:

### 1. Create Strategy

```typescript
export class NewWebsiteStrategy {
  static readonly toolRegistration = {
    condition: (input: string): boolean => input.startsWith("https://newsite.company.com"),
    process: async (input: string) => {
      const strategy = new NewWebsiteStrategy();
      return await strategy.execute(input);
    },
  };
}
```

### 2. Register Strategy

```typescript
export const matchers = [
    NewWebsiteStrategy.toolRegistration,
    // ... other strategies
] as const;
```

### 3. URL Matching

The system finds the first matching strategy:

```typescript
const matcher = matchers.find((m) => m.condition(url));
if (!matcher) {
  throw new Error(`Unrecognized URL format: ${url}`);
}
```

### Development Process

1. Create strategy file
2. Register in matchers array  
3. Test and deploy

This ensures **reliability** over automatic discovery.

## Runtime Execution

### Request Flow

1. Client sends JSON-RPC request with URL
2. Server validates parameters
3. URL processor finds matching strategy
4. Strategy executes and processes website
5. Response formatted and returned

### Request Format

```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "read_internal_website",
    "arguments": {
      "url": "https://docs.company.com/api/documentation"
    }
  },
  "id": 1
}
```

### Strategy Selection

```typescript
export class UrlProcessor {
  public async processSingleUrl(url: string): Promise<any> {
    // Find first matching strategy
    const matcher = matchers.find((m) => m.condition(url));
    if (!matcher) {
      throw new Error(`Unrecognized URL format: ${url}`);
    }
    return await this.processWithStrategy(matcher, url);
  }
}
```

**Key Points:**
- Strategies checked in registration order
- First match wins
- Generic fallback available
- Clear error handling for unsupported URLs

## Key Design Patterns

1. **Strategy Pattern** - Each website type has its own processing strategy
2. **Static Registration** - Strategies registered at compile time for reliability
3. **Chain of Responsibility** - First matching strategy handles the request
4. **Batch Processing** - Concurrent processing with configurable limits
5. **Authentication Abstraction** - Transparent authentication handling
6. **Content Normalization** - Consistent markdown output format

## Summary

This architecture provides a solid foundation for building website browser tools with:

- **Modular design** for easy extension
- **Reliable authentication** handling
- **Performance optimization** through concurrency
- **Quality content extraction** using proven algorithms
- **Error resilience** with clear fallback mechanisms

The patterns demonstrated here work well for both internal tooling and public APIs requiring robust website browsing capabilities.

## URL Discovery and Documentation

### What Documentation Exists

The MCP server provides **tool-level** documentation but not individual URL documentation:

```typescript
export const ReadInternalWebsiteTool: Tool = {
  name: "read_internal_website",
  description: [
    "Read content from internal websites.",
    "",
    "Supported website categories:",
    "- docs.company.com: Technical documentation",
    "- wiki.company.com: Internal wikis", 
    "- code.company.com: Code repositories",
    "- tasks.company.com: Project management",
    // ... more categories
  ].join("\n")
};
```

### What's NOT Available

- **No individual URL documentation** - No descriptions for specific URLs
- **No URL discovery** - Can't query "what URLs are available?"
- **No parameter examples** - No guidance on URL structure

### How Clients Find URLs

1. **Tool description** - Lists supported website categories
2. **Trial and error** - Try URLs and handle errors
3. **External documentation** - Organization maintains URL catalogs separately
4. **Application logic** - Clients construct URLs based on business needs

### Example Discovery Process

```typescript
// Client tries a URL
const url = "https://wiki.company.com/project-status";

try {
  const result = await mcpClient.callTool("read_internal_website", { url });
  // Success - URL pattern is supported
} catch (error) {
  if (error.message.includes("Unrecognized URL format")) {
    // URL pattern not supported
  }
}
```

### Design Trade-offs

**Pros:**
- Simple server design
- Flexible URL handling
- No need to maintain URL catalogs

**Cons:**
- Clients must know URLs beforehand
- Limited discovery capabilities
- Trial-and-error approach needed

**Key Point:** The server handles "how to browse" while clients handle "what to browse" - this separation keeps the architecture simple and flexible. 