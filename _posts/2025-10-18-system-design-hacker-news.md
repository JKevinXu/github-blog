---
layout: post
title: "System Design Interview: Building Hacker News"
date: 2025-10-18
tags: [system-design, interview, architecture, scalability, hacker-news]
---

# System Design Interview: Building Hacker News

An interview-style walkthrough of designing a Hacker News-like system, presented as a conversation between interviewer and candidate.

---

## Interview Transcript

**Interviewer:** Today, we're going to design a system similar to Hacker News. Are you familiar with Hacker News?

**Candidate:** Yes! Hacker News is a social news website focusing on tech and startups. Users can submit posts, comment on them, and upvote content. The front page shows top-ranked stories based on votes and time.

**Interviewer:** Exactly. Let's design a similar system. Where would you start?

---

## Clarifying Requirements

**Candidate:** I'd like to start by clarifying the requirements. Let me ask a few questions:

**Q1: What are the core features we need to support?**

**Interviewer:** Focus on these main features:
- Users can submit posts (links or text)
- Users can comment on posts with nested/threaded comments
- Users can upvote posts and comments
- Posts are ranked and displayed on the homepage
- User profiles showing karma (reputation points)

**Candidate:** Got it. What about features like downvoting, editing posts, or searching?

**Interviewer:** Let's keep those out of scope for now. Focus on the MVP.

---

**Candidate:** **Q2: What kind of scale are we targeting?**

**Interviewer:** Let's assume:
- 5 million daily active users
- About 10,000 new posts per day
- Around 100,000 comments per day
- Roughly 5 million votes per day

**Candidate:** Okay, so if I calculate the write throughput:
- Posts: 10,000 / 24 / 3600 ≈ **0.1 posts/second** (low)
- Comments: 100,000 / 24 / 3600 ≈ **1 comment/second** (moderate)
- Votes: 5,000,000 / 24 / 3600 ≈ **58 votes/second** (peak could be 500+)

And since this is a social news site, I'd expect the read/write ratio to be heavily skewed towards reads—maybe **100:1**?

**Interviewer:** That sounds reasonable.

---

**Candidate:** **Q3: What are the performance and availability requirements?**

**Interviewer:** Aim for:
- Homepage should load in under 200ms (p95)
- Post detail pages under 300ms
- System should have 99.9% uptime

**Candidate:** Great, let me summarize what we're building:

**Functional Requirements:**
- ✅ Submit posts (links/text)
- ✅ Comment on posts (nested/threaded)
- ✅ Upvote posts and comments
- ✅ Ranked homepage
- ✅ User profiles with karma

**Non-Functional Requirements:**
- 📊 5M DAU, 10K posts/day, 100K comments/day, 5M votes/day
- ⚡ <200ms homepage load, <300ms post page
- 🎯 99.9% availability
- 📖 Read-heavy workload (100:1 ratio)

**Interviewer:** Perfect. Let's move to high-level design.

---

## High-Level Architecture

**Interviewer:** How would you structure the system at a high level?

**Candidate:** I'd propose a classic three-tier architecture with caching. Let me draw this out:

```
┌─────────────┐
│   Clients   │
│ (Web/Mobile)│
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────┐
│          Load Balancer (ALB)            │
└──────────────┬──────────────────────────┘
               │
       ┌───────┴────────┐
       ▼                ▼
┌─────────────┐  ┌─────────────┐
│  API Server │  │  API Server │  (Auto-scaling)
│   (Node.js) │  │   (Node.js) │
└──────┬──────┘  └──────┬──────┘
       │                │
       └───────┬────────┘
               ▼
      ┌────────────────┐
      │  Redis Cache   │  (Read-through cache)
      └────────┬───────┘
               │
       ┌───────┴────────┐
       ▼                ▼
┌─────────────┐  ┌─────────────┐
│  PostgreSQL │  │  PostgreSQL │  (Primary-Replica)
│   Primary   │→ │   Replica   │
└─────────────┘  └─────────────┘
```

**Candidate:** Here's my reasoning:

1. **Load Balancer**: Distributes traffic across multiple API servers for high availability
2. **API Servers**: Stateless Node.js servers that can auto-scale based on traffic
3. **Redis Cache**: Stores frequently accessed data like top posts, reducing database load
4. **PostgreSQL**: 
   - Primary for all writes (posts, comments, votes)
   - Read replicas for query scaling
   - Good fit because we need ACID guarantees for votes and comments

**Interviewer:** Why PostgreSQL over NoSQL?

**Candidate:** Good question! Here's my thinking:
- We need **strong consistency** for votes (no double-voting)
- We have **complex relationships** (posts → comments → votes)
- **Transaction support** for operations like: vote + update karma + update score
- **Structured data** with clear schema
- The data size is manageable even at 5M DAU

NoSQL would make sense if we needed horizontal write scaling beyond what Postgres can handle, but at our scale, Postgres with replicas should be sufficient.

**Interviewer:** Fair enough. What about the data model?

---

## Data Model Design

**Candidate:** Let me design the database schema. I'll need four main tables:

### Database Schema (PostgreSQL)

**Users Table:**
```sql
CREATE TABLE users (
    user_id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    karma INT DEFAULT 0,
    about TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    INDEX idx_username (username),
    INDEX idx_karma (karma DESC)
);
```

**Posts Table:**
```sql
CREATE TABLE posts (
    post_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(user_id),
    title VARCHAR(300) NOT NULL,
    url VARCHAR(2000),
    text TEXT,
    score INT DEFAULT 0,
    comment_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    ranking_score FLOAT,  -- Calculated: score / (age_hours + 2)^1.8
    INDEX idx_ranking (ranking_score DESC, created_at DESC),
    INDEX idx_created_at (created_at DESC),
    INDEX idx_user_id (user_id)
);
```

**Comments Table:**
```sql
CREATE TABLE comments (
    comment_id BIGSERIAL PRIMARY KEY,
    post_id BIGINT REFERENCES posts(post_id),
    parent_comment_id BIGINT REFERENCES comments(comment_id),
    user_id BIGINT REFERENCES users(user_id),
    text TEXT NOT NULL,
    score INT DEFAULT 0,
    depth INT DEFAULT 0,  -- For nested comments
    path VARCHAR(1000),   -- Materialized path: "1.5.23"
    created_at TIMESTAMP DEFAULT NOW(),
    INDEX idx_post_id (post_id, path),
    INDEX idx_parent_id (parent_comment_id),
    INDEX idx_score (score DESC)
);
```

**Votes Table:**
```sql
CREATE TABLE votes (
    vote_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(user_id),
    post_id BIGINT REFERENCES posts(post_id),
    comment_id BIGINT REFERENCES comments(comment_id),
    vote_type SMALLINT DEFAULT 1,  -- 1 for upvote
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (user_id, post_id),
    UNIQUE (user_id, comment_id),
    INDEX idx_post_votes (post_id),
    INDEX idx_comment_votes (comment_id)
);
```

**Interviewer:** This schema looks good. One question—why did you add a `ranking_score` column to the posts table? Couldn't you calculate that on the fly?

**Candidate:** Great observation! Yes, we *could* calculate it on the fly, but that would be expensive for every homepage query. Instead, I'm pre-computing it and storing it. We can update it periodically (say, every 5 minutes) via a background job. This trades storage space for query performance, which is critical for our < 200ms homepage requirement.

**Interviewer:** Makes sense. What about the APIs?

---

## API Design

**Candidate:** I'd design RESTful APIs like this:

**Posts:**
```
GET    /api/posts?page=1&type=top         # Get top posts
GET    /api/posts?page=1&type=new         # Get new posts
GET    /api/posts/:postId                 # Get post details
POST   /api/posts                         # Submit new post
GET    /api/posts/:postId/comments        # Get post comments
```

**Comments:**
```
POST   /api/comments                      # Submit comment
GET    /api/comments/:commentId/replies   # Get comment replies
```

**Votes:**
```
POST   /api/votes                         # Submit vote
       Body: { postId: 123, type: "upvote" }
```

**Users:**
```
GET    /api/users/:username               # Get user profile
GET    /api/users/:username/posts         # Get user posts
GET    /api/users/:username/comments      # Get user comments
```

**Interviewer:** How would you handle the ranking algorithm? That's a key part of Hacker News.

---

## Ranking Algorithm

**Candidate:** Yes, the ranking algorithm is crucial! Hacker News uses a time-decay algorithm. The formula is:

**Hacker News Ranking Formula:**
```javascript
function calculateRankingScore(votes, ageInHours) {
    const gravity = 1.8;
    const score = (votes - 1) / Math.pow(ageInHours + 2, gravity);
    return score;
}
```

**Candidate:** And here's how we'd update rankings periodically:

**Background Job (Every 5 minutes):**
```javascript
async function updateRankings() {
    const posts = await db.query(`
        SELECT post_id, score, created_at 
        FROM posts 
        WHERE created_at > NOW() - INTERVAL '7 days'
    `);
    
    for (const post of posts) {
        const ageHours = (Date.now() - post.created_at) / (1000 * 60 * 60);
        const rankingScore = calculateRankingScore(post.score, ageHours);
        
        await db.query(
            'UPDATE posts SET ranking_score = $1 WHERE post_id = $2',
            [rankingScore, post.post_id]
        );
    }
}
```

**Interviewer:** Why only posts from the last 7 days?

**Candidate:** Two reasons: 
1. Older posts won't appear on the front page anyway due to time decay
2. It reduces the number of updates we need to perform, improving efficiency

**Interviewer:** Good thinking. What about comment threading? That can be tricky.

---

## Comment Threading

**Candidate:** Yes! Nested comments are challenging. I'd use the **materialized path** approach:

**Materialized Path Approach:**
```javascript
// Parent comment path: "1.5"
// New child comment path: "1.5.23"

async function addComment(postId, parentCommentId, userId, text) {
    let path = '';
    let depth = 0;
    
    if (parentCommentId) {
        const parent = await getComment(parentCommentId);
        path = `${parent.path}.${commentId}`;
        depth = parent.depth + 1;
    } else {
        path = `${commentId}`;
        depth = 0;
    }
    
    await db.query(`
        INSERT INTO comments (post_id, parent_comment_id, user_id, text, path, depth)
        VALUES ($1, $2, $3, $4, $5, $6)
    `, [postId, parentCommentId, userId, text, path, depth]);
}

// Fetch comments with proper nesting
async function getPostComments(postId) {
    return await db.query(`
        SELECT * FROM comments 
        WHERE post_id = $1 
        ORDER BY path
    `);
}
```

**Interviewer:** Clever! So you're storing the full path to each comment, which allows you to query and sort them easily. What's the trade-off here?

**Candidate:** The main trade-off is:
- **Pro**: Very fast reads—just query by post_id and sort by path
- **Con**: If we ever need to move a comment to a different parent (which is rare), we'd need to update all descendant paths

Since Hacker News doesn't allow moving comments, this trade-off works well for us.

**Interviewer:** I see. Now, you mentioned caching earlier. How would you approach that?

---

## Caching Strategy

**Candidate:** Caching is critical for our < 200ms homepage requirement. I'd implement a multi-layer caching strategy using Redis:

**1. Homepage Cache (Top Posts):**
```javascript
const CACHE_TTL = 60; // 1 minute

async function getTopPosts(page = 1) {
    const cacheKey = `top_posts:${page}`;
    
    // Check cache first
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);
    
    // Cache miss - query database
    const posts = await db.query(`
        SELECT * FROM posts 
        ORDER BY ranking_score DESC 
        LIMIT 30 OFFSET ${(page - 1) * 30}
    `);
    
    // Store in cache
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(posts));
    return posts;
}
```

**2. Post Details Cache:**
```javascript
async function getPost(postId) {
    const cacheKey = `post:${postId}`;
    
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);
    
    const post = await db.query(
        'SELECT * FROM posts WHERE post_id = $1',
        [postId]
    );
    
    await redis.setex(cacheKey, 300, JSON.stringify(post)); // 5 min TTL
    return post;
}
```

**3. User Karma Cache:**
```javascript
async function getUserKarma(userId) {
    const cacheKey = `user_karma:${userId}`;
    
    const cached = await redis.get(cacheKey);
    if (cached) return parseInt(cached);
    
    const result = await db.query(
        'SELECT karma FROM users WHERE user_id = $1',
        [userId]
    );
    
    await redis.setex(cacheKey, 3600, result.karma); // 1 hour TTL
    return result.karma;
}
```

**Cache Invalidation:**
```javascript
async function onVote(postId) {
    // Invalidate related caches
    await redis.del(`post:${postId}`);
    await redis.del('top_posts:1');
    await redis.del('top_posts:2');
    // Update rankings asynchronously
    await queue.add('update_rankings', { postId });
}
```

**Interviewer:** Good caching strategy. But what if one of our posts goes viral and we suddenly get 10x the traffic? How would you scale this system?

---

## Scalability & Performance Optimization

**Candidate:** Great question! Let me think about both read and write scaling:

**Database Read Replicas:**
- Primary for writes (posts, comments, votes)
- Multiple read replicas for queries
- Route read queries to replicas with load balancing

```javascript
const readDB = selectReadReplica(); // Round-robin selection
const posts = await readDB.query('SELECT * FROM posts...');
```

**CDN for Static Assets:**
- CSS, JavaScript, images
- Reduce load on application servers
- Global distribution for faster load times

### Write Scaling

**Vote Aggregation (Redis Counter):**
```javascript
// Instead of writing to DB immediately
async function handleVote(postId, userId) {
    // Check if user already voted (Redis Set)
    const hasVoted = await redis.sismember(`voted:${postId}`, userId);
    if (hasVoted) return;
    
    // Add to voted set
    await redis.sadd(`voted:${postId}`, userId);
    
    // Increment counter
    await redis.incr(`votes:${postId}`);
    
    // Async batch write to DB (every 10 seconds)
    await queue.add('persist_votes', { postId });
}
```

**Message Queue for Background Jobs:**
```javascript
// Bull queue with Redis
const Queue = require('bull');
const rankingQueue = new Queue('ranking-updates');

rankingQueue.process(async (job) => {
    await updatePostRanking(job.data.postId);
});

// On vote, add job to queue
await rankingQueue.add({ postId: 123 });
```

---

## 8. Database Optimization

### Indexes Strategy

**Critical Indexes:**
```sql
-- Posts ranking query
CREATE INDEX idx_posts_ranking ON posts(ranking_score DESC, created_at DESC);

-- User posts query
CREATE INDEX idx_posts_user ON posts(user_id, created_at DESC);

-- Comments by post (with path for threading)
CREATE INDEX idx_comments_post_path ON comments(post_id, path);

-- Vote lookups
CREATE INDEX idx_votes_user_post ON votes(user_id, post_id);
```

### Partitioning

**Time-based Partitioning for Votes:**
```sql
-- Partition by month for historical votes
CREATE TABLE votes_2025_10 PARTITION OF votes
    FOR VALUES FROM ('2025-10-01') TO ('2025-11-01');

CREATE TABLE votes_2025_11 PARTITION OF votes
    FOR VALUES FROM ('2025-11-01') TO ('2025-12-01');
```

---

## 9. Monitoring & Observability

### Key Metrics

**Application Metrics:**
- Request latency (p50, p95, p99)
- Error rates (4xx, 5xx)
- Throughput (requests/second)

**Database Metrics:**
- Query execution time
- Connection pool usage
- Replication lag

**Cache Metrics:**
- Cache hit rate
- Cache eviction rate
- Memory usage

**Business Metrics:**
- Posts per day
- Comments per day
- Vote activity
- User growth

### Logging Strategy

```javascript
// Structured logging with context
logger.info('vote_submitted', {
    userId: 123,
    postId: 456,
    timestamp: Date.now(),
    duration: 45
});
```

---

## 10. Security Considerations

### Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

// Limit vote submissions
const voteLimit = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 votes per minute
    keyGenerator: (req) => req.user.id
});

app.post('/api/votes', voteLimit, handleVote);
```

### Input Validation

```javascript
// Sanitize user input
const validator = require('validator');

function validatePost(title, url, text) {
    if (!title || title.length > 300) {
        throw new Error('Invalid title');
    }
    
    if (url && !validator.isURL(url)) {
        throw new Error('Invalid URL');
    }
    
    if (text && text.length > 10000) {
        throw new Error('Text too long');
    }
}
```

### Authentication

```javascript
// JWT-based authentication
const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) return res.sendStatus(401);
    
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}
```

**Interviewer:** One more thing—what are some key trade-offs you made in this design?

---

## Trade-offs & Design Decisions

**Candidate:** Great question! Let me highlight the key trade-offs:

**1. Eventually Consistent Vote Counts**
- ✅ **Pro**: Lower write latency, better scalability with Redis counters
- ❌ **Con**: Vote counts may be slightly delayed (up to 10 seconds)
- **Decision**: Acceptable—users don't need real-time vote counts

**2. Denormalized Comment Count**
- ✅ **Pro**: Fast homepage rendering (no JOIN or COUNT needed)
- ❌ **Con**: Must update parent post on every comment
- **Decision**: Worth it for our read-heavy workload (100:1 ratio)

**3. Materialized Path for Comments**
- ✅ **Pro**: Simple queries, excellent read performance
- ❌ **Con**: Path updates are complex if comment hierarchy changes
- **Decision**: Acceptable since comments rarely move

**4. Short Cache TTL**
- ✅ **Pro**: 1-minute TTL keeps homepage relatively fresh
- ❌ **Con**: Some users may see slightly stale rankings
- **Decision**: Good balance between performance and freshness

**Interviewer:** Excellent. Let me ask a few follow-up questions to test your depth...

---

## Follow-up Questions

**Interviewer:** **How would you handle 10x traffic growth?**

**Candidate:** I'd take a phased approach:

1. **Short-term** (immediate):
   - Scale API servers horizontally (easy since they're stateless)
   - Add more read replicas for database
   - Increase Redis cache capacity
   - Enable CDN for static assets

2. **Medium-term** (weeks):
   - Database sharding by post_id ranges
   - Separate service for vote processing
   - CDN for frequently-accessed API endpoints (homepage JSON)

3. **Long-term** (months):
   - Consider moving to event-driven architecture
   - Separate read and write databases (CQRS)
   - Geographic distribution for global users

---

**Interviewer:** **What if we wanted to add full-text search?**

**Candidate:** I'd integrate Elasticsearch:

1. Set up Elasticsearch cluster
2. Index posts and comments with fields: title, text, author, timestamp
3. Sync data from PostgreSQL using:
   - **Option A**: Change Data Capture (CDC) with Debezium
   - **Option B**: Application-level dual writes
4. Add search API endpoint: `GET /api/search?q=golang&page=1`
5. Rank results by relevance × recency × score

**Trade-off**: Adds complexity but essential for user experience at scale.

---

**Interviewer:** **How would you prevent spam and abuse?**

**Candidate:** Multiple layers of defense:

1. **Rate Limiting**:
   - 10 votes/minute per user
   - 5 posts/day for new users
   - 20 comments/hour per user

2. **Reputation System**:
   - New users (karma < 10) have stricter limits
   - Users with high karma get more privileges

3. **Content Filtering**:
   - Blacklist of spam domains
   - Profanity filter for comments
   - ML model for spam detection (trained on historical data)

4. **Manual Moderation**:
   - Flag system for users to report spam
   - Moderator dashboard for quick actions
   - Shadowban capability for repeat offenders

5. **Technical Measures**:
   - CAPTCHA for suspicious patterns
   - IP-based rate limiting
   - Browser fingerprinting

---

**Interviewer:** **What about real-time updates when someone votes on a post you're viewing?**

**Candidate:** I'd implement WebSocket connections:

```javascript
// Server-side: Redis Pub/Sub
async function handleVote(postId, userId) {
    // Process vote...
    
    // Publish event
    await redis.publish('votes', JSON.stringify({
        postId: postId,
        newScore: updatedScore
    }));
}

// WebSocket server listens and broadcasts
redis.subscribe('votes', (message) => {
    const event = JSON.parse(message);
    wss.broadcast(event); // Send to all connected clients
});
```

```javascript
// Client-side: WebSocket connection
const ws = new WebSocket('wss://api.hackernews.com/live');

ws.onmessage = (event) => {
    const { postId, newScore } = JSON.parse(event.data);
    updateScoreInUI(postId, newScore);
};
```

**Trade-off**: Adds server complexity and WebSocket infrastructure, but provides better UX.

---

## Interview Wrap-up

**Interviewer:** Great work! You've covered all the key aspects. Let me summarize what I liked:

✅ **Structured approach**: Started with requirements, moved to high-level design, then details  
✅ **Trade-off analysis**: Clearly explained pros/cons of design decisions  
✅ **Scalability thinking**: Addressed both current scale and future growth  
✅ **Practical solutions**: Used appropriate technologies (PostgreSQL, Redis, message queues)  
✅ **Performance optimization**: Caching strategy, indexing, denormalization  

**Key Takeaways:**
- **PostgreSQL** for ACID guarantees and complex relationships
- **Redis caching** for read-heavy workload optimization
- **Materialized path** for efficient comment threading
- **Async processing** for ranking updates via message queues
- **Read replicas** for horizontal read scaling

This design handles **5M DAU** with room to scale to 50M+ with sharding and geographic distribution.

**Interviewer:** Any questions for me?

**Candidate:** Yes! In production, have you found the materialized path approach for comments to scale well, or have you moved to alternative approaches like closure tables?

---

## Further Resources

**Learn More:**
- [How Hacker News Ranking Works](https://medium.com/hacking-and-gonzo/how-hacker-news-ranking-algorithm-works-1d9b0cf2c08d)
- [Designing Data-Intensive Applications](https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/)
- [System Design Primer on GitHub](https://github.com/donnemartin/system-design-primer)
- [Real HN Architecture](https://news.ycombinator.com/item?id=1769270)

**Practice More System Design:**
- Design Twitter
- Design Instagram
- Design YouTube
- Design Uber
