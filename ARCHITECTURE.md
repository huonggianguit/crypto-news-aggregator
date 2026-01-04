# ARCHITECTURE DOCUMENTATION

## 📐 CẤU TRÚC DỰ ÁN

```
crypto-news/
├── app/                          # Next.js App Router
│   ├── api/                     # API endpoints
│   │   ├── chat/               # Chatbot API
│   │   ├── search/             # Search API
│   │   └── scheduler/          # Scheduler status API
│   ├── article/[slug]/         # Article detail page
│   └── van-ban-phap-ly/        # Legal documents page
│
├── lib/                         # Core Business Logic
│   ├── ai/                     # AI Writer modules
│   │   ├── articleRewriter.ts  # AI rewriter (existing)
│   │   └── aiWriter.ts         # NEW: Groq/OpenAI integration
│   │
│   ├── crawler/                # Crawler engines
│   │   ├── articleCrawler.ts   # Article crawlers (existing)
│   │   ├── searchCrawler.ts    # Search crawler (existing)
│   │   ├── crawlRepository.ts  # DB operations (existing)
│   │   ├── browserConfig.ts    # NEW: Anti-detection config
│   │   └── smartCrawler.ts     # NEW: Smart crawler với retry
│   │
│   ├── publisher/              # Publishing logic
│   │   └── articlePublisher.ts # Publish to Post table
│   │
│   ├── scheduler/              # Job scheduling
│   │   └── crawlScheduler.ts   # Cron jobs
│   │
│   └── prisma.ts               # Prisma client
│
├── scripts/                     # Executable scripts
│   ├── auto-crawl-crypto.ts    # Auto crawl with keywords
│   ├── crawl-crypto-news.ts    # Manual crawl
│   ├── run-crawl.ts            # NEW: Master orchestration
│   ├── add-source.ts           # NEW: Add news sources
│   ├── publish-articles.ts     # Publish crawled articles
│   └── scheduler-daemon.ts     # Start scheduler daemon
│
├── prisma/
│   └── schema.prisma           # UPDATED: Added Source, SystemLog
│
├── .env.example                # NEW: Environment template
└── SETUP_GUIDE.md              # NEW: Complete setup guide
```

---

## 🔄 DATA FLOW

### 1. CRAWLING PHASE

```
[External Source]
    ↓
[smartCrawler.ts] ──→ Playwright + Anti-Detection
    ↓
[fetchNews()]
    ├─ User-Agent rotation
    ├─ Viewport randomization
    ├─ Stealth scripts
    └─ Human-like navigation
    ↓
[HTML Content]
    ↓
[Cheerio Parser] ──→ Extract data using selectors
    ↓
[CrawlResult Object]
```

### 2. DEDUPLICATION PHASE

```
[CrawlResult]
    ↓
[Generate SHA-256 Checksum]
    ↓
[Check Database]
    ├─ Same URL? ──→ Skip
    ├─ Same checksum? ──→ Skip
    └─ New content? ──→ Continue
    ↓
[Save to CrawlArticle]
    └─ status: "pending"
```

### 3. AI REWRITING PHASE

```
[CrawlArticle (pending)]
    ↓
[aiWriter.ts]
    ↓
[rewriteArticle()]
    ├─ Build prompt
    ├─ Call Groq API (Llama-3.3-70b)
    ├─ Retry 3 times if fail
    └─ Parse JSON response
    ↓
[AIRewriteOutput]
    ├─ title (SEO)
    ├─ content_html
    └─ summary
    ↓
[Update CrawlArticle]
    └─ status: "processed"
```

### 4. PUBLISHING PHASE

```
[CrawlArticle (processed)]
    ↓
[articlePublisher.ts]
    ↓
[publishPendingArticles()]
    ├─ Map to Category
    ├─ Generate slug
    └─ Fetch thumbnail from Unsplash
    ↓
[Create Post]
    └─ Visible on website
```

---

## 🧩 MODULE DETAILS

### browserConfig.ts (Anti-Detection)

**Purpose**: Chống website phát hiện bot

**Features**:
- User-Agent rotation (pool of 6 real browsers)
- Viewport randomization (5 common resolutions)
- Stealth scripts (hide `navigator.webdriver`)
- Override plugins, languages, permissions
- Human-like navigation (random delays, scroll)

**Key Functions**:
```typescript
createStealthBrowser()      // Launch browser với args chống detect
createStealthPage()         // Tạo page với fingerprint random
navigateHumanLike()         // Navigate như người thật
retryWithBackoff()          // Retry với exponential backoff
```

---

### smartCrawler.ts (Intelligent Crawler)

**Purpose**: Crawler thông minh với selector config

**Features**:
- Nhận `SelectorConfig` (CSS selectors động)
- Retry logic tích hợp
- Batch crawl với connection pooling
- Convert relative URLs sang absolute
- Check crypto-related content

**Key Functions**:
```typescript
fetchNews(url, selectors, retries)     // Crawl 1 URL
batchFetchNews(urls[], concurrency)    // Crawl nhiều URLs
isCryptoRelated(text)                  // Filter crypto content
normalizeImageUrl(url, base)           // Fix relative URLs
```

**Example Usage**:
```typescript
const result = await fetchNews(
  'https://coindesk.com/article',
  {
    title: 'h1.headline',
    content: 'div.article-content',
    mainImage: 'figure img',
  },
  3 // retry 3 lần
);
```

---

### aiWriter.ts (AI Rewriter)

**Purpose**: Viết lại bài báo với Groq/OpenAI

**Features**:
- Groq API (Llama-3.3-70b) - Free tier
- OpenAI API (GPT-4o-mini) - Fallback
- Retry 3 lần với exponential backoff
- Parse JSON kể cả có markdown code blocks
- System prompt chuẩn báo chí

**Key Functions**:
```typescript
rewriteArticle(input, provider)        // Rewrite 1 bài
batchRewriteArticles(inputs[], provider) // Rewrite nhiều bài
getAvailableProvider()                  // Detect API key available
```

**AI Prompt Strategy**:
- System: Define role và format
- User: Provide article + context
- Output: JSON với title, content_html, summary

**Example**:
```typescript
const output = await rewriteArticle({
  title: "Bitcoin hits $50K",
  content: "<p>...</p>",
  source: "CoinDesk",
}, 'groq');

console.log(output.title);        // "Bitcoin vượt $50K..."
console.log(output.content_html); // "<p>Sapo...</p><h2>..."
```

---

### run-crawl.ts (Master Orchestration)

**Purpose**: Script chính điều phối toàn bộ workflow

**Workflow**:
```
1. Load Sources from DB
2. For each source:
   ├─ Crawl using smartCrawler
   ├─ Check crypto-related
   ├─ Check duplicate
   ├─ Save to CrawlArticle
   └─ AI Rewrite (if not --skip-rewrite)
3. Update Source stats
4. Log to SystemLog
```

**CLI Options**:
```bash
--max 20               # Limit 20 articles
--skip-rewrite         # Crawl only, no AI
--skip-duplicate       # No duplicate check
--source "CoinDesk"    # Specific source only
```

---

### add-source.ts (Source Management)

**Purpose**: Helper để thêm nguồn tin

**Features**:
- 5 predefined sources (CoinDesk, Cointelegraph, VnExpress, etc.)
- Custom source wizard
- Interactive CLI
- Validation

**Predefined Sources**:
1. CoinDesk (EN)
2. Cointelegraph (EN)
3. VnExpress (VI)
4. TapChiBitcoin (VI)
5. TheBlock (EN)

---

## 🗄️ DATABASE SCHEMA

### New Tables

#### Source
```prisma
model Source {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  name          String   // CoinDesk, VnExpress
  domain        String   @unique
  baseUrl       String   // URL để crawl
  selectors     Json     // CSS selectors
  isActive      Boolean  @default(true)
  lastCrawlAt   DateTime?
  totalCrawled  Int      @default(0)
  failCount     Int      @default(0)
  language      String   @default("vi")
  country       String?
  category      String?
  priority      Int      @default(1) // 1-5
}
```

#### SystemLog
```prisma
model SystemLog {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  level         String   // info, warn, error, debug
  module        String   // crawler, ai_writer, publisher
  action        String   // crawl_start, rewrite_success
  message       String
  details       Json?
  articleId     String?  @db.ObjectId
  sourceUrl     String?
  duration      Int?     // ms
  memoryUsage   Float?   // MB
  timestamp     DateTime @default(now())
}
```

---

## ⚙️ CONFIGURATION

### Environment Variables

#### Required
```env
DATABASE_URL="mongodb+srv://..."
GROQ_API_KEY="gsk_..." hoặc OPENAI_API_KEY="sk-..."
```

#### Optional
```env
UNSPLASH_ACCESS_KEY="..."
MAX_CRAWL_PER_RUN=20
CRAWL_INTERVAL_MINUTES=30
CONCURRENT_TABS=6
PROXY_HOST="..."
```

---

## 🚀 DEPLOYMENT

### Development
```bash
npm run dev                    # Next.js dev server
npm run run-crawl              # Test crawl
npm run add-source             # Setup sources
```

### Production
```bash
npm run build
npm run start                  # Next.js production
pm2 start npm --name crawler -- run scheduler
```

---

## 📊 MONITORING

### Log Queries
```typescript
// Get recent errors
const errors = await prisma.systemLog.findMany({
  where: { level: 'error' },
  orderBy: { timestamp: 'desc' },
  take: 50,
});

// Get crawler performance
const crawlLogs = await prisma.systemLog.findMany({
  where: { 
    module: 'crawler',
    action: 'crawl_complete',
  },
  orderBy: { timestamp: 'desc' },
  take: 10,
});

crawlLogs.forEach(log => {
  console.log(log.details.duration, 'ms');
  console.log(log.details.totalCrawled, 'articles');
});
```

### Source Health
```typescript
const sources = await prisma.source.findMany({
  where: { isActive: true },
  orderBy: { failCount: 'desc' },
});

sources.forEach(s => {
  if (s.failCount > 5) {
    console.warn(`Source ${s.name} has ${s.failCount} consecutive failures`);
  }
});
```

---

## 🔧 TROUBLESHOOTING

### Anti-Detection không hoạt động?
- Check `browserConfig.ts` - User-Agent pool
- Thêm proxy trong `.env`
- Tăng delay giữa requests

### AI rewrite lỗi?
- Check `GROQ_API_KEY` hoặc `OPENAI_API_KEY`
- Xem SystemLog với `module: 'ai_writer'`
- Retry logic tự động 3 lần

### Duplicate không detect?
- Checksum dựa trên `content` only
- Nếu content bị modify, checksum khác
- Có thể thêm check by `title` similarity

---

## 📚 DEPENDENCIES

### Core
- `next`: ^16.0.10
- `@prisma/client`: ^5.22.0
- `playwright`: ^1.57.0
- `cheerio`: ^1.1.2
- `node-cron`: ^4.2.1

### AI
- Groq API (Free tier: 7000 requests/day)
- OpenAI API (Paid)

### Dev
- `typescript`: ^5
- `ts-node`: ^10.9.2
- `prisma`: ^5.22.0

---

**Last Updated**: January 4, 2026
