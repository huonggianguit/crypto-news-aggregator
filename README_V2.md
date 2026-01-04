# 🚀 CRYPTO NEWS AGGREGATOR - HỆ THỐNG TIN TỨC TỰ ĐỘNG

> **Website Tin Tức Crypto Tự Động** - Crawl, AI Rewrite, và Publish tự động từ các nguồn quốc tế

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)](https://www.mongodb.com/)
[![Playwright](https://img.shields.io/badge/Playwright-1.57-orange)](https://playwright.dev/)
[![Groq AI](https://img.shields.io/badge/Groq-Llama%203.3-purple)](https://groq.com/)

---

## 📋 MỤC LỤC

- [✨ Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [📦 Installation](#-installation)
- [⚙️ Configuration](#️-configuration)
- [🚀 Usage](#-usage)
- [📚 Documentation](#-documentation)
- [🤝 Contributing](#-contributing)

---

## ✨ FEATURES

### 🔄 Tự Động Hoàn Toàn
- ✅ Crawl tin tức từ CoinDesk, Cointelegraph, VnExpress, TapChiBitcoin, TheBlock
- ✅ AI rewrite sang tiếng Việt với Groq (Llama-3.3-70b) hoặc OpenAI (GPT-4o-mini)
- ✅ SEO optimization (title, description, heading structure)
- ✅ Check trùng lặp bằng SHA-256 checksum
- ✅ Tự động lấy ảnh từ Unsplash
- ✅ Scheduler chạy mỗi 30 phút (node-cron)

### 🛡️ Anti-Detection
- ✅ User-Agent rotation (6 real browsers)
- ✅ Viewport randomization (5 common resolutions)
- ✅ Stealth scripts (hide `navigator.webdriver`)
- ✅ Human-like navigation (random delays, scroll)
- ✅ Retry với exponential backoff

### 📊 Monitoring & Logging
- ✅ SystemLog table (info, warn, error, debug)
- ✅ Source health tracking (fail count, last crawl)
- ✅ Performance metrics (duration, memory usage)
- ✅ Prisma Studio dashboard

---

## 🛠️ TECH STACK

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| **Backend** | Next.js API Routes |
| **Database** | MongoDB Atlas + Prisma ORM |
| **Crawler** | Playwright (JavaScript rendering) + Cheerio |
| **AI Writer** | Groq API (Llama-3.3-70b) hoặc OpenAI (GPT-4o-mini) |
| **Job Queue** | node-cron |
| **Image CDN** | Unsplash API |

---

## 📦 INSTALLATION

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (hoặc local MongoDB)
- Groq API key (FREE) hoặc OpenAI API key

### Steps

```bash
# 1. Clone repository (hoặc unzip project)
cd d:\crypto_news\crypto-news

# 2. Install dependencies
npm install

# 3. Install Playwright browsers
npx playwright install chromium

# 4. Setup environment variables
copy .env.example .env
# Chỉnh sửa .env với DATABASE_URL và GROQ_API_KEY

# 5. Setup database
npx prisma generate
npx prisma db push

# 6. Add news sources
npm run add-source
# Chọn option 1 để thêm CoinDesk, Cointelegraph, etc.

# 7. Test crawl
npm run run-crawl -- --max 5

# 8. Start development server
npm run dev
```

---

## ⚙️ CONFIGURATION

### Environment Variables

Tạo file `.env` từ `.env.example`:

```env
# Database (Required)
DATABASE_URL="mongodb+srv://user:pass@cluster.mongodb.net/crypto_news"

# AI Provider (Required - chọn 1 trong 2)
GROQ_API_KEY="gsk_xxxxxxxxxxxxxxxxxxxxx"
# hoặc
OPENAI_API_KEY="sk-xxxxxxxxxxxxxxxxxxxxx"

# Optional
UNSPLASH_ACCESS_KEY="your_unsplash_key"
MAX_CRAWL_PER_RUN=20
CONCURRENT_TABS=6
```

### Groq API Key (FREE)

1. Đăng ký tại: https://console.groq.com
2. Tạo API key
3. Free tier: **7,000 requests/day** (đủ cho 200+ bài/ngày)

---

## 🚀 USAGE

### Development

```bash
# Start Next.js dev server
npm run dev

# Open http://localhost:3000
```

### Crawling

```bash
# Crawl thủ công (master orchestration)
npm run run-crawl

# Options:
npm run run-crawl -- --max 10           # Limit 10 bài
npm run run-crawl -- --skip-rewrite     # Không AI rewrite
npm run run-crawl -- --source "CoinDesk" # Chỉ 1 nguồn

# Auto crawl với keywords
npm run auto-crawl
npm run auto-crawl -- --keyword "Bitcoin" --max 30

# Add news source
npm run add-source
```

### Scheduler (Production)

```bash
# Chạy scheduler daemon (crawl mỗi 30 phút)
npm run scheduler

# Hoặc với PM2
pm2 start npm --name "crypto-crawler" -- run scheduler
pm2 save
pm2 startup
```

### Publishing

```bash
# Publish bài đã rewrite (CrawlArticle -> Post)
npm run publish
```

---

## 📁 PROJECT STRUCTURE

```
crypto-news/
├── lib/
│   ├── ai/
│   │   ├── articleRewriter.ts     # AI rewriter (existing)
│   │   └── aiWriter.ts            # NEW: Groq/OpenAI với retry
│   ├── crawler/
│   │   ├── articleCrawler.ts      # Article crawlers
│   │   ├── searchCrawler.ts       # Search crawler
│   │   ├── browserConfig.ts       # NEW: Anti-detection
│   │   └── smartCrawler.ts        # NEW: Smart crawler với retry
│   ├── publisher/
│   │   └── articlePublisher.ts    # Publish logic
│   └── scheduler/
│       └── crawlScheduler.ts      # Cron jobs
│
├── scripts/
│   ├── run-crawl.ts               # NEW: Master orchestration
│   ├── add-source.ts              # NEW: Add news sources
│   ├── auto-crawl-crypto.ts       # Auto crawl
│   └── scheduler-daemon.ts        # Scheduler daemon
│
├── prisma/
│   └── schema.prisma              # UPDATED: +Source, +SystemLog
│
├── .env.example                   # NEW: Environment template
├── SETUP_GUIDE.md                 # NEW: Complete setup guide
└── ARCHITECTURE.md                # NEW: Architecture docs
```

---

## 📚 DOCUMENTATION

- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Hướng dẫn setup từng bước chi tiết
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Kiến trúc hệ thống, data flow
- **[CRAWLER_README.md](CRAWLER_README.md)** - Chi tiết về crawler engine

---

## 🔄 WORKFLOW

```mermaid
graph TD
    A[External Sources] -->|Playwright| B[smartCrawler.ts]
    B -->|Anti-Detection| C[HTML Content]
    C -->|Cheerio| D[CrawlResult]
    D -->|SHA-256| E{Check Duplicate?}
    E -->|New| F[Save to CrawlArticle]
    E -->|Duplicate| X[Skip]
    F -->|Groq API| G[aiWriter.ts]
    G -->|Retry 3x| H[Rewritten Content]
    H -->|Update| I[CrawlArticle - processed]
    I -->|articlePublisher| J[Post Table]
    J -->|Next.js| K[Website]
```

---

## 📊 DATABASE SCHEMA

### Main Tables

- **Source** - Quản lý nguồn tin (URL, selectors, stats)
- **CrawlArticle** - Bài báo đã crawl (staging)
- **Post** - Bài viết đã publish
- **Category** - Danh mục
- **SystemLog** - Log hệ thống (monitoring)

### Example: Add Source

```javascript
{
  name: "CoinDesk",
  domain: "coindesk.com",
  baseUrl: "https://www.coindesk.com/latest",
  selectors: {
    title: "h1.headline",
    content: "div.article-content",
    mainImage: "figure img"
  },
  isActive: true,
  priority: 5
}
```

---

## 🎯 KEY FEATURES EXPLAINED

### 1. Anti-Detection (browserConfig.ts)

```typescript
// User-Agent rotation
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/120.0.0.0',
  // ... 6 real browsers
];

// Stealth scripts
await page.addInitScript(() => {
  Object.defineProperty(navigator, 'webdriver', {
    get: () => undefined, // Hide automation
  });
});
```

### 2. AI Rewriter (aiWriter.ts)

```typescript
const output = await rewriteArticle({
  title: "Bitcoin Surges to $50K",
  content: "<p>Original content...</p>",
  source: "CoinDesk"
}, 'groq');

// Output:
// {
//   title: "Bitcoin vượt mốc $50K...",
//   content_html: "<p>Sapo...</p><h2>Phân tích</h2>...",
//   summary: "Tóm tắt 150-200 ký tự"
// }
```

### 3. Retry Logic

```typescript
async function retryWithBackoff(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      const delay = 1000 * Math.pow(2, i); // 1s, 2s, 4s
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

---

## 🐛 TROUBLESHOOTING

### Lỗi: "GROQ_API_KEY not found"
✅ Kiểm tra file `.env`, đảm bảo có `GROQ_API_KEY="gsk_..."`

### Lỗi: "Playwright browser not found"
✅ Chạy `npx playwright install chromium`

### Lỗi: "Database connection failed"
✅ Kiểm tra `DATABASE_URL` trong `.env`
✅ Chạy `npx prisma db push`

### Crawler bị chặn IP
✅ Module `browserConfig.ts` đã có anti-detection
✅ Thêm proxy trong `.env` nếu cần
✅ Tăng delay giữa requests

---

## 🎨 FRONTEND

Website tự động hiển thị bài viết từ bảng `Post`:

- Homepage: Danh sách bài mới nhất
- Article Detail: `/article/[slug]`
- Category: Lọc theo danh mục
- Search: Tìm kiếm bài viết
- Chatbot: AI chat assistant

---

## 📈 MONITORING

### Prisma Studio

```bash
npx prisma studio
# Open http://localhost:5555
```

### SystemLog Queries

```typescript
// Xem lỗi gần nhất
const errors = await prisma.systemLog.findMany({
  where: { level: 'error' },
  orderBy: { timestamp: 'desc' },
  take: 50,
});

// Xem stats crawl
const stats = await prisma.systemLog.findMany({
  where: { action: 'crawl_complete' },
  orderBy: { timestamp: 'desc' },
  take: 10,
});
```

---

## 🚀 PRODUCTION DEPLOYMENT

### Vercel (Next.js)

```bash
npm run build
vercel --prod
```

### PM2 (Scheduler)

```bash
pm2 start npm --name "crypto-crawler" -- run scheduler
pm2 start npm --name "crypto-website" -- run start
pm2 save
pm2 startup
```

### Environment

```env
NODE_ENV="production"
DATABASE_URL="mongodb+srv://prod_user:..."
GROQ_API_KEY="gsk_prod_key..."
NEXT_PUBLIC_SITE_URL="https://yourdomain.com"
```

---

## 🤝 CONTRIBUTING

Contributions are welcome! Please:

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 LICENSE

MIT License - See [LICENSE](LICENSE) file for details

---

## 🙏 ACKNOWLEDGMENTS

- [Next.js](https://nextjs.org/) - React Framework
- [Playwright](https://playwright.dev/) - Browser Automation
- [Groq](https://groq.com/) - Fast AI Inference
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [MongoDB](https://www.mongodb.com/) - Database

---

## 📞 SUPPORT

Nếu gặp vấn đề:

1. Đọc [SETUP_GUIDE.md](SETUP_GUIDE.md)
2. Check [ARCHITECTURE.md](ARCHITECTURE.md)
3. Xem SystemLog trong Prisma Studio
4. Open GitHub Issue

---

**Made with ❤️ for Vietnamese Crypto Community**

**Version**: 2.0.0  
**Last Updated**: January 4, 2026
