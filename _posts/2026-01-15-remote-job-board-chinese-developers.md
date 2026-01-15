---
layout: post
title: "Building a Remote Job Board for Chinese Developers"
date: 2026-01-15 10:00:00 +0800
categories: [entrepreneurship, products]
tags: [remote-work, job-board, china, developers, side-project, career]
---

# Building a Remote Job Board for Chinese Developers

There's a growing wave of Chinese developers who want to work remotely for international companies. The appeal is obvious: USD salaries, flexible hours, exposure to global tech, and no need to relocate. But finding these opportunities is surprisingly hard.

This post explores the idea of building a **remote job board specifically for Chinese developers** targeting international companies.

---

## The Problem

### Chinese Developers Want Remote International Jobs

Why would a developer in Shanghai or Beijing want a remote job at a foreign company?

| Factor | Local Job | Remote International |
|--------|-----------|---------------------|
| **Salary** | ¥300K-800K/year | $80K-150K/year (¥550K-1M+) |
| **Work hours** | 996 culture common | Flexible, async-first |
| **Growth** | Limited global exposure | Work with global teams |
| **Stability** | Tech layoffs in China | Diversified income |
| **Location** | Office-bound | Work from anywhere |

### But Discovery is Fragmented

Where do Chinese developers currently find remote jobs?

| Source | Problem |
|--------|---------|
| **LinkedIn** | English-only, not optimized for remote |
| **AngelList/Wellfound** | US-focused, timezone mismatch concerns |
| **Remote OK, We Work Remotely** | No Chinese localization, payment friction |
| **V2EX 酷工作** | Mixed quality, mostly local jobs |
| **电鸭** | Small, limited international listings |
| **WeChat groups** | Scattered, hard to search, scams |

**The gap**: No dedicated platform that:
- Curates remote jobs open to China-based developers
- Provides Chinese translations and context
- Filters for timezone-friendly roles
- Addresses payment/contract concerns for Chinese freelancers

---

## Market Validation

### Growing Demand Signals

1. **"远程工作" (remote work) search volume** has grown 3x since 2020
2. **电鸭 (eleduck.com)** has 100K+ registered users - proving demand exists
3. **Toptal, Turing, Andela** are hiring Chinese developers - companies want this talent
4. **Post-COVID** normalization of remote work globally

### Why Now?

- **AI levels the playing field**: Chinese devs can use AI to overcome language barriers
- **Timezone overlap with US West Coast**: Shanghai is only 3-4 hours off from California morning
- **Cost arbitrage**: Companies save money; developers earn more than local rates
- **Tech layoffs in China**: Developers seeking alternatives to unstable local market

---

## Product Vision

### Name Ideas

- **远程猎** (Remote Hunt)
- **跨境工作** (Cross-border Jobs)
- **全球远程** (Global Remote)
- **远程开发者** (Remote Developer)

### Core Value Proposition

> "找到愿意雇佣中国开发者的远程国际公司"
> "Find international companies willing to hire China-based developers remotely"

### Target Users

| Segment | Description | Needs |
|---------|-------------|-------|
| **Senior devs** | 5+ years, want USD income | High-quality listings, vetted companies |
| **Freelancers** | Already doing contract work | Payment solutions, contract templates |
| **Explorers** | Curious about remote work | Education, success stories |

---

## MVP Features

### Phase 1: Curated Job Board (Month 1-2)

```
┌─────────────────────────────────────────────────┐
│           远程猎 / Remote Jobs for CN Devs       │
├─────────────────────────────────────────────────┤
│  🇺🇸 Senior Backend Engineer - Stripe           │
│     $150-200K · Remote · Python, Go             │
│     ✅ China-friendly · 🕐 Async-first          │
├─────────────────────────────────────────────────┤
│  🇪🇺 Full Stack Developer - Shopify             │
│     €80-120K · Remote · React, Ruby             │
│     ✅ China-friendly · 🕐 4hr overlap needed   │
├─────────────────────────────────────────────────┤
│  🇸🇬 Mobile Engineer - Grab                     │
│     $100-140K · Remote · Flutter, iOS           │
│     ✅ China-friendly · 🕐 Same timezone        │
└─────────────────────────────────────────────────┘
```

**Key features:**
- **China-friendly tag**: Verified that company hires from China
- **Timezone indicator**: Required overlap hours
- **Chinese descriptions**: Translated job requirements
- **Salary in USD + CNY**: Easy comparison
- **Payment method info**: How you'll get paid (Deel, Payoneer, etc.)

### Phase 2: Community + Resources (Month 3-4)

- **Success stories**: Interviews with Chinese devs at remote companies
- **Guides**: "How to get paid as a Chinese remote worker"
- **Contract templates**: Bilingual contractor agreements
- **Interview prep**: Common questions for remote interviews
- **Salary database**: What Chinese devs earn at remote companies

### Phase 3: Premium Features (Month 5-6)

- **Profile + matching**: Companies find you
- **Resume review**: AI + human feedback
- **Interview coaching**: 1-on-1 prep sessions
- **Job alerts**: Personalized notifications

---

## Content Strategy: The Growth Engine

### SEO-Driven Content

| Article | Target Keyword | Monthly Searches |
|---------|---------------|------------------|
| "中国开发者如何找远程工作" | 远程工作 开发者 | 2,000+ |
| "远程工作如何收款 (Payoneer vs Wise)" | 远程工作 收款 | 1,500+ |
| "美国公司远程面试技巧" | 远程面试 | 1,000+ |
| "2026年最适合远程的技术栈" | 远程 技术栈 | 800+ |
| "远程工作签合同注意事项" | 远程 合同 | 600+ |

Each article funnels readers to job listings.

### Community Building

- **WeChat group**: Verified remote workers only
- **Weekly newsletter**: 10 best new remote jobs
- **公众号**: Tips, success stories, job highlights

---

## Technical Implementation

### Simple Stack

```
Frontend:    Next.js + Tailwind CSS
Backend:     Supabase (auth + database)
Hosting:     Vercel (free tier)
Job scraping: Python scripts (manual initially)
Email:       Resend or Mailgun
```

### Database Schema

```sql
jobs:
  id, title, company, description_en, description_cn,
  salary_min, salary_max, currency, location,
  timezone_overlap, china_friendly, payment_method,
  tech_stack, experience_level, posted_at, expires_at

companies:
  id, name, logo, website, description,
  hires_from_china, payment_methods, size

applications:
  id, job_id, user_id, status, applied_at

users:
  id, email, name, wechat_id, resume_url,
  experience_years, tech_stack, looking_for
```

---

## Monetization

### Revenue Streams

| Stream | When | Price | Notes |
|--------|------|-------|-------|
| **Featured listings** | Month 3+ | $199/month | Premium placement |
| **Company profiles** | Month 4+ | $99/month | Branded pages |
| **Resume database** | Month 5+ | $299/month | Companies search candidates |
| **Premium job alerts** | Month 4+ | ¥29/month | Users pay for early access |
| **Coaching/courses** | Month 6+ | ¥299-999 | Interview prep, resume review |

### Revenue Projection

| Month | Jobs Listed | Users | Revenue |
|-------|-------------|-------|---------|
| Month 2 | 50 | 500 | ¥0 |
| Month 3 | 150 | 2,000 | ¥500 |
| Month 4 | 300 | 5,000 | ¥2,000 |
| Month 5 | 500 | 10,000 | ¥5,000 |
| Month 6 | 800 | 20,000 | ¥10,000+ |

---

## Competitive Landscape

| Platform | Focus | Gap |
|----------|-------|-----|
| **电鸭 (Eleduck)** | Chinese remote community | Limited international listings |
| **Remote OK** | Global remote jobs | No Chinese localization |
| **We Work Remotely** | Global remote jobs | No China-specific filters |
| **Toptal/Turing** | Talent marketplaces | High bar, platform takes cut |
| **LinkedIn** | Professional network | Not remote-focused |

**Our niche**: International remote jobs, localized for Chinese developers, with practical resources for cross-border work.

---

## Unique Challenges

### 1. Payment Complexity

Chinese developers face unique challenges getting paid:
- **SAFE limits**: $50K annual foreign exchange limit
- **Tax implications**: How to report foreign income
- **Payment platforms**: Payoneer, Wise, Deel, crypto?

**Our solution**: Comprehensive guides + vetted payment method recommendations

### 2. Timezone Communication

Many remote jobs require real-time collaboration:
- **Shanghai → SF**: 16-hour difference (3-4hr morning overlap)
- **Shanghai → London**: 8-hour difference (good overlap)
- **Shanghai → Singapore**: Same timezone

**Our solution**: Clear timezone overlap indicators on every listing

### 3. Trust Issues

Companies worry about hiring from China:
- IP protection concerns
- Communication barriers
- Contract enforcement

**Our solution**: Success stories, vetted companies, standardized contracts

---

## Growth Strategy

### Phase 1: Content + SEO (Month 1-2)
- Write 10 high-quality guides on remote work for Chinese devs
- Post in V2EX, 即刻 with valuable content (not just job links)
- Build email list through free resources

### Phase 2: Community (Month 3-4)
- Launch WeChat group for remote workers
- Weekly AMA with Chinese devs at remote companies
- Partner with coding bootcamps targeting international careers

### Phase 3: Partnerships (Month 5-6)
- Reach out to remote-first companies directly
- Partner with Deel, Remote.com for referral revenue
- Sponsor tech podcasts popular with Chinese devs

---

## Why I Can Build This

1. **I'm the target user**: SDE at Amazon, understanding both local and international tech
2. **Network**: Know other Chinese devs interested in remote work
3. **Technical skills**: Can build the MVP quickly
4. **Content ability**: Can write guides in both Chinese and English

---

## First Week Actions

1. **Validate demand**: Post in V2EX asking about remote job pain points
2. **Curate 20 jobs**: Manually find remote jobs open to China
3. **Build landing page**: Simple Next.js page with job listings
4. **Write first guide**: "中国开发者远程工作完整指南"
5. **Start WeChat group**: Invite 20 friends interested in remote work

---

## Related Reading

- [Building a Chinese Product Hunt](/2026/01/14/building-chinese-product-hunt/)
- [Learning from Pieter Levels](/2025/06/18/pieter-levels-lessons-for-individual-developers/)
- [电鸭 Eleduck](https://eleduck.com/) - Existing Chinese remote work community
- [Remote OK](https://remoteok.com/) - Global remote job board

