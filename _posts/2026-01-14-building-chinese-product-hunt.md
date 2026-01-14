---
layout: post
title: "Building a Chinese Product Hunt: Why the Market Needs It"
date: 2026-01-14 12:00:00 +0800
categories: [entrepreneurship, products]
tags: [product-hunt, indie-hacker, china, startup, side-project, maker-community]
---

# Building a Chinese Product Hunt: Why the Market Needs It

As a software developer based in Shanghai, I've been thinking about what side project could generate meaningful cash flow while solving a real problem. After exploring various ideas, I've landed on something I'm genuinely excited about: **a Chinese version of Product Hunt**.

---

## The Problem: Product Discovery in China is Broken

If you're a Chinese developer or tech enthusiast looking to discover new tools and products, your options are limited:

| Platform | What It Does | The Gap |
|----------|--------------|---------|
| **Product Hunt** | Daily curated products with voting | English-first, many products don't work in China |
| **36氪** | Tech news and funding coverage | Focus on news, not product discovery |
| **少数派** | App reviews and articles | Long-form content, not daily discovery format |
| **小众软件** | Software recommendations | Old-school forum format, not community-driven |
| **V2EX** | Developer community | Not product-focused |

There's no platform in China that combines:
- **Daily curated products** (like Product Hunt's daily launches)
- **Community voting and discussion** (upvotes, comments)
- **Chinese localization** (descriptions, context for Chinese users)
- **China-friendly alternatives** (products that actually work behind the GFW)

---

## Why This Matters Now

### 1. Growing Indie Developer Community

The 独立开发者 (indie developer) community in China is exploding. More Chinese developers are building their own products, but they lack a platform to launch and get discovered. WeChat groups and V2EX posts only get you so far.

### 2. Localization is Non-Trivial

Many products on Product Hunt:
- Don't support Chinese
- Require payment methods Chinese users don't have
- Are blocked or slow in China
- Solve problems that don't exist in the Chinese context

A Chinese Product Hunt would curate products that actually work for Chinese users and highlight local alternatives.

### 3. The Format Works

Product Hunt's daily discovery + voting format is proven. It creates:
- **FOMO**: Users check daily to not miss new products
- **Network effects**: Makers share their launches, bringing traffic
- **Community**: Voters feel invested in helping good products win

---

## The Product Vision

### Core Features (MVP)

```
┌─────────────────────────────────────────────┐
│           产品猎人 / Today's Products        │
├─────────────────────────────────────────────┤
│  🥇 AI写作助手 - 基于GPT的中文写作工具         │
│     ▲ 234  💬 12  🏷️ AI工具                  │
├─────────────────────────────────────────────┤
│  🥈 极简待办 - 没有多余功能的Todo应用           │
│     ▲ 189  💬 8   🏷️ 效率应用                │
├─────────────────────────────────────────────┤
│  🥉 代码截图 - 生成漂亮的代码分享图片           │
│     ▲ 156  💬 15  🏷️ 开发者工具              │
└─────────────────────────────────────────────┘
```

- **Daily products**: 5-10 curated products per day
- **Upvoting**: Simple voting system
- **Product pages**: Name, tagline, description, screenshots, link
- **Categories**: AI工具, 效率应用, 开发者工具, 设计, 生活
- **Comments**: Discussion threads

### Content Strategy

**Phase 1: Curated by me**
- Manually curate 5-10 products daily
- Source from Product Hunt, Hacker News, 少数派, V2EX
- Add Chinese descriptions and context
- Highlight China-friendly alternatives

**Phase 2: Community submissions**
- Open submissions from makers
- Moderate and approve quality products
- Featured spots for exceptional launches

---

## Technical Stack

Keeping it simple and cheap:

```
Frontend:    Next.js + Tailwind CSS
Backend:     Supabase (auth + database + storage)
Hosting:     Vercel (free tier)
Auth:        WeChat OAuth + Email
```

Total monthly cost: **~$0** until significant scale

### Database Schema

```sql
products:
  id, name, tagline, description, url, logo,
  screenshots, category, submitted_by, created_at

votes:
  id, product_id, user_id, created_at

comments:
  id, product_id, user_id, content, created_at

users:
  id, name, avatar, wechat_id, email
```

---

## Growth Strategy

### Channel Mix

| Channel | Tactic | Expected Impact |
|---------|--------|-----------------|
| **SEO** | "XX的中国替代品" articles | 5K-20K visits/month |
| **V2EX/即刻** | Daily product posts | 500 early adopters |
| **WeChat 公众号** | Daily digest newsletter | 2K followers/month |
| **小红书** | Tool recommendation videos | Viral potential |
| **Maker network** | Launch announcements | 100K organic reach |

### The Maker Network Effect

This is the key growth lever. Every maker who launches on the platform will share their launch with their audience. If we get:
- 100 makers launching
- Each with 1,000 followers on average
- = **100,000 potential organic reach**

We'll create a "Launch Kit" with social assets to make sharing easy.

### SEO Content Machine

Writing articles like:
- "Notion的最佳中国替代品"
- "2026年最好用的AI工具"
- "Figma中国版有哪些选择"

Each article links back to product pages, creating passive organic traffic.

---

## Monetization Model

Starting free, then adding revenue streams:

| Revenue Stream | When | Price |
|----------------|------|-------|
| Featured product spots | Month 4+ | ¥199-499/day |
| Sponsored collections | Month 5+ | ¥999/collection |
| Job board for makers | Month 6+ | ¥299/posting |
| Premium analytics | Month 6+ | ¥99/month |

### Revenue Projection

| Month | Users | Paid Features | Revenue |
|-------|-------|---------------|---------|
| Month 3 | 2,000 | - | ¥0 |
| Month 4 | 5,000 | Featured spots | ¥500 |
| Month 5 | 8,000 | + Sponsored | ¥1,500 |
| Month 6 | 10,000+ | Full suite | ¥3,000+ |

---

## Competitive Moat

### Why would this win?

1. **First-mover in format**: No one does daily discovery + voting in Chinese
2. **Bilingual curation**: I can bridge Western and Chinese content
3. **Maker community**: Network effects compound over time
4. **SEO content**: Articles become long-term traffic assets

### Why wouldn't a big player copy this?

- **36氪**: Too focused on news and funding, different DNA
- **少数派**: Editorial model, not community-driven
- **Tencent**: Too big to care about this niche
- **Product Hunt**: No China expertise, blocked in China

---

## Timeline

| Month | Milestone | Hours/Week |
|-------|-----------|------------|
| **Jan 2026** | Build MVP | 10 |
| **Feb 2026** | Launch, 500 users | 8 |
| **Mar 2026** | 2,000 users, add features | 6 |
| **Apr 2026** | Open submissions, 5,000 users | 6 |
| **May 2026** | First revenue | 5 |
| **Jun 2026** | 10,000+ users, ¥3,000+/month | 5 |

---

## Name Ideas

Still deciding on the name:

- **产品猎人** - Direct translation, recognizable
- **今日发现** - "Today's Discoveries"
- **新品日报** - "New Products Daily"
- **发现产品** - "Discover Products"
- **猎产品** - "Hunt Products"

Leaning towards **今日发现** because it's descriptive and doesn't require explaining what "Product Hunt" means.

---

## What's Next

I'm starting to build the MVP this week. My plan:

1. Set up Next.js + Supabase project
2. Build product listing page with upvote functionality
3. Create product detail pages
4. Seed with first 20-30 curated products
5. Deploy to Vercel and share for feedback

If you're interested in following along or have suggestions, feel free to reach out. And if you're a maker who wants to launch a product on the platform when it's ready, let me know!

---

## Related Reading

- [Learning from Pieter Levels: Lessons for Individual Developers](/2025/06/18/pieter-levels-lessons-for-individual-developers/)
- [Product Hunt](https://www.producthunt.com/) - The original inspiration
- [少数派](https://sspai.com/) - Chinese app review site
- [V2EX](https://www.v2ex.com/) - Chinese developer community

