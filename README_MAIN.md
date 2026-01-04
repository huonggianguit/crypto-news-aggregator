# 🚀 CRYPTO NEWS AGGREGATOR - HỆ THỐNG TIN TỨC TỰ ĐỘNG V2.0

> **Hệ thống tin tức crypto tự động hoàn chỉnh** - Crawl, AI Rewrite, và Publish 24/7

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?logo=mongodb)](https://www.mongodb.com/)
[![Playwright](https://img.shields.io/badge/Playwright-1.57-orange)](https://playwright.dev/)
[![Groq AI](https://img.shields.io/badge/Groq-Llama%203.3-purple)](https://groq.com/)

---

## 🎉 PHIÊN BẢN MỚI NHẤT (V2.0)

### ✨ What's New?

- ✅ **Automation 24/7**: Tự động crawl mỗi 30 phút với GitHub Actions & Vercel Cron
- ✅ **Anti-Detection**: Browser stealth, User-Agent rotation, human-like behavior
- ✅ **Groq AI Integration**: Llama-3.3-70b với retry mechanism
- ✅ **Modern UI**: Featured + Latest grid, responsive, dark mode
- ✅ **SEO Optimization**: Dynamic metadata, Open Graph, JSON-LD
- ✅ **System Monitoring**: SystemLog table, performance metrics

---

## 📋 QUICK START (5 PHÚT)

### Prerequisites
- Node.js 18+
- MongoDB Atlas (hoặc local MongoDB)
- Groq API key (FREE) từ https://console.groq.com

### Setup

```bash
# 1. Install
npm install
npx playwright install chromium

# 2. Environment
copy .env.example .env
# Edit .env: DATABASE_URL, GROQ_API_KEY, CRON_SECRET

# 3. Database
npx prisma generate
npx prisma db push

# 4. Add sources
npm run add-source
# Chọn CoinDesk, Cointelegraph, etc.

# 5. Test
npm run test-setup
npm run run-crawl -- --max 3

# 6. Start
npm run dev
# Open http://localhost:3000
```

**Chi tiết**: Xem [QUICKSTART.md](QUICKSTART.md)

---

## 🏗️ KIẾN TRÚC HỆ THỐNG

```
┌─────────────────────────────────────────────────────────┐
│              AUTOMATION LAYER (24/7)                     │
│  ┌──────────────────┐  ┌───────────────────┐           │
│  │ GitHub Actions   │  │  Vercel Cron      │           │
│  │ Every 30 minutes │  │  Every 30 minutes │           │
│  └────────┬─────────┘  └─────────┬─────────┘           │
│           │                       │                      │
│           └───────────┬───────────┘                      │
│                       ▼                                  │
│              ┌────────────────┐                         │
│              │ /api/cron/crawl│ (Secure API)            │
│              └────────┬───────┘                         │
└───────────────────────┼──────────────────────────────────┘
                        │
┌───────────────────────▼──────────────────────────────────┐
│              CRAWLER LAYER (Anti-Detect)                 │
│  ┌──────────────────────────────────────────────────┐   │
│  │ smartCrawler.ts + browserConfig.ts              │   │
│  │ • User-Agent rotation                           │   │
│  │ • Stealth scripts                               │   │
│  │ • Human-like navigation                         │   │
│  │ • Retry with exponential backoff                │   │
│  └────────────────────┬─────────────────────────────┘   │
└─────────────────────┼──────────────────────────────────┘
                      │
                      ▼
        ┌──────────────────────────┐
        │  External News Sources   │
        │  • CoinDesk              │
        │  • Cointelegraph         │
        │  • VnExpress             │
        │  • TapChiBitcoin         │
        └──────────┬───────────────┘
                   │ HTML Content
                   ▼
┌───────────────────────────────────────────────────────────┐
│              AI PROCESSING LAYER                          │
│  ┌──────────────────────────────────────────────────┐    │
│  │ aiWriter.ts (Groq API - Llama-3.3-70b)          │    │
│  │ • Vietnamese rewriting                           │    │
│  │ • SEO optimization                               │    │
│  │ • Retry 3 times                                  │    │
│  │ • JSON parsing                                   │    │
│  └────────────────────┬─────────────────────────────┘    │
└────────────────────┼──────────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │   MongoDB (Prisma)     │
        │  • CrawlArticle        │
        │  • Post                │
        │  • Category            │
        │  • Source              │
        │  • SystemLog           │
        └──────────┬─────────────┘
                   │
                   ▼
┌───────────────────────────────────────────────────────────┐
│              FRONTEND LAYER (Next.js 14)                  │
│  ┌──────────────────────────────────────────────────┐    │
│  │ Components:                                       │    │
│  │ • NewsCard (3 variants)                          │    │
│  │ • PostDetail (SEO optimized)                     │    │
│  │                                                   │    │
│  │ Pages:                                            │    │
│  │ • Homepage (Featured + Latest grid)              │    │
│  │ • Article Detail (dynamic metadata)              │    │
│  │ • Category pages                                 │    │
│  └───────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────┘
```

---

## 🛠️ TECH STACK

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 14 (App Router) | React framework, SSR/SSG |
| **Styling** | Tailwind CSS | Utility-first CSS |
| **Database** | MongoDB Atlas | NoSQL database |
| **ORM** | Prisma | Type-safe database client |
| **Crawler** | Playwright | Browser automation |
| **Parser** | Cheerio | HTML parsing |
| **AI** | Groq API (Llama-3.3-70b) | Article rewriting |
| **Automation** | GitHub Actions + Vercel Cron | Scheduled jobs |
| **Monitoring** | SystemLog (DB) | Performance tracking |

---

## 📦 PROJECT STRUCTURE

```
crypto-news/
├── app/                        # Next.js App Router
│   ├── api/
│   │   └── cron/
│   │       └── crawl/         # ✨ Cron API endpoint
│   ├── article/[slug]/        # Article detail pages
│   └── page.tsx               # Homepage
│
├── components/                 # React components
│   ├── NewsCard.tsx           # ✨ News card (3 variants)
│   └── PostDetail.tsx         # ✨ Article detail view
│
├── lib/                       # Core business logic
│   ├── ai/
│   │   ├── articleRewriter.ts
│   │   └── aiWriter.ts        # ✨ Groq/OpenAI integration
│   ├── crawler/
│   │   ├── articleCrawler.ts
│   │   ├── browserConfig.ts   # ✨ Anti-detection
│   │   └── smartCrawler.ts    # ✨ Intelligent crawler
│   ├── publisher/
│   │   └── articlePublisher.ts
│   └── scheduler/
│       └── crawlScheduler.ts
│
├── scripts/                   # CLI scripts
│   ├── run-crawl.ts          # ✨ Master orchestration
│   ├── add-source.ts         # ✨ Source management
│   └── test-setup.ts         # ✨ System verification
│
├── prisma/
│   └── schema.prisma         # ✨ Updated schema
│
├── .github/
│   └── workflows/
│       └── auto-crawl.yml    # ✨ GitHub Actions
│
├── vercel.json               # ✨ Vercel Cron config
└── [Docs]                    # Documentation
    ├── QUICKSTART.md
    ├── SETUP_GUIDE.md
    ├── ARCHITECTURE.md
    └── FINAL_COMPLETE.md
```

---

## 🎯 MAIN FEATURES

### 🤖 Intelligent Crawler
- **Anti-Detection**: User-Agent rotation, stealth scripts
- **Dynamic Selectors**: Database-driven selector config
- **Batch Processing**: Multiple articles simultaneously
- **Retry Logic**: Exponential backoff on failures
- **Content Filtering**: Crypto-related detection

### 🧠 AI Rewriter
- **Multi-Provider**: Groq (Llama-3.3) + OpenAI fallback
- **Vietnamese Optimization**: Natural Vietnamese writing style
- **SEO-Friendly**: Title, description, heading structure
- **Retry Mechanism**: 3 attempts with backoff
- **JSON Parsing**: Handles markdown code blocks

### ⏰ Automation
- **GitHub Actions**: Runs every 30 minutes
- **Vercel Cron**: Production-ready scheduling
- **Secure API**: CRON_SECRET authentication
- **Manual Trigger**: On-demand execution
- **Stats Tracking**: Detailed crawl statistics

### 🎨 Modern UI
- **Responsive Design**: Mobile-first approach
- **Dark Mode**: Full dark mode support
- **Card Variants**: Featured, default, compact
- **Typography**: Prose styling for articles
- **Share Buttons**: Social media integration

### 📈 SEO Optimization
- **Dynamic Metadata**: Per-article title, description
- **Open Graph**: Facebook sharing optimization
- **Twitter Cards**: Twitter preview cards
- **JSON-LD**: Structured data for Google
- **ISR**: Incremental Static Regeneration

### 📊 Monitoring
- **SystemLog**: Database logging
- **Source Health**: Track failures, success rate
- **Performance Metrics**: Duration, memory usage
- **Prisma Studio**: Visual database explorer

---

## 📚 DOCUMENTATION

### Getting Started
- **[QUICKSTART.md](QUICKSTART.md)** - Setup trong 5 phút
- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Hướng dẫn chi tiết đầy đủ

### Technical Docs
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Kiến trúc hệ thống
- **[PART_4_5_DOCUMENTATION.md](PART_4_5_DOCUMENTATION.md)** - Automation & Frontend

### Reference
- **[FINAL_COMPLETE.md](FINAL_COMPLETE.md)** - Tổng hợp tất cả
- **[FILES_CREATED.md](FILES_CREATED.md)** - Danh sách files
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Summary Parts 1-3

---

## 🚀 USAGE

### Development

```bash
npm run dev                     # Start dev server
npm run build                   # Build for production
npm run start                   # Start production server
```

### Crawling

```bash
npm run run-crawl               # Master crawl script
npm run run-crawl -- --max 10   # Limit 10 articles
npm run run-crawl -- --skip-rewrite  # No AI rewrite
npm run auto-crawl              # Crawl with keywords
```

### Management

```bash
npm run add-source              # Add news source
npm run test-setup              # Verify system
npx prisma studio               # View database
```

### Automation

```bash
# Local scheduler
npm run scheduler

# Production with PM2
pm2 start npm --name crawler -- run scheduler
pm2 save
pm2 startup
```

---

## 🔧 CONFIGURATION

### Environment Variables

```env
# Required
DATABASE_URL="mongodb+srv://..."
GROQ_API_KEY="gsk_..."           # hoặc OPENAI_API_KEY
CRON_SECRET="your_secret_32+"

# Optional
NEXT_PUBLIC_SITE_URL="https://yourdomain.com"
UNSPLASH_ACCESS_KEY="..."
MAX_CRAWL_PER_RUN=20
CONCURRENT_TABS=6
```

### Adding News Sources

```bash
npm run add-source

# Predefined sources:
# 1. CoinDesk (EN)
# 2. Cointelegraph (EN)
# 3. VnExpress (VI)
# 4. TapChiBitcoin (VI)
# 5. TheBlock (EN)
```

---

## 📊 MONITORING

### SystemLog Queries

```typescript
// View recent errors
const errors = await prisma.systemLog.findMany({
  where: { level: 'error' },
  orderBy: { timestamp: 'desc' },
  take: 50,
});

// Crawl statistics
const stats = await prisma.systemLog.findMany({
  where: { 
    module: 'cron_api',
    action: 'crawl_complete',
  },
  orderBy: { timestamp: 'desc' },
  take: 10,
});
```

### Prisma Studio

```bash
npx prisma studio
# Open http://localhost:5555
```

---

## 🌐 DEPLOYMENT

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Add environment variables in dashboard
# Enable Vercel Cron (automatic with vercel.json)
```

### GitHub Actions

```bash
# Push to GitHub
git push origin main

# Add secrets in repo settings:
# - SITE_URL
# - CRON_SECRET

# Workflow runs automatically every 30 mins
```

---

## 🐛 TROUBLESHOOTING

| Issue | Solution |
|-------|----------|
| GROQ_API_KEY not found | Add to `.env` file |
| Playwright not found | Run `npx playwright install chromium` |
| Database connection failed | Check `DATABASE_URL` in `.env` |
| Cron not running | Must be **production** deployment on Vercel |
| No articles on homepage | Run `npm run publish` to publish articles |

Xem thêm: [SETUP_GUIDE.md](SETUP_GUIDE.md#troubleshooting)

---

## 📈 PERFORMANCE

- **Crawler**: 6 concurrent tabs, 2-3s per article
- **AI Rewrite**: ~5-10s per article (Groq)
- **Database**: MongoDB Atlas with indexes
- **Frontend**: ISR with 10-minute revalidation
- **Images**: Next.js Image optimization

---

## 🤝 CONTRIBUTING

Contributions welcome! Please:

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open Pull Request

---

## 📄 LICENSE

MIT License - See [LICENSE](LICENSE) file

---

## 🙏 ACKNOWLEDGMENTS

- [Next.js](https://nextjs.org/) - React Framework
- [Playwright](https://playwright.dev/) - Browser Automation
- [Groq](https://groq.com/) - Fast AI Inference
- [Prisma](https://www.prisma.io/) - Next-gen ORM
- [MongoDB](https://www.mongodb.com/) - Database

---

## 📞 SUPPORT

Nếu gặp vấn đề:

1. Đọc [QUICKSTART.md](QUICKSTART.md)
2. Check [SETUP_GUIDE.md](SETUP_GUIDE.md)
3. Xem SystemLog trong Prisma Studio
4. Open GitHub Issue

---

## 🎊 WHAT'S NEXT?

### Immediate
- [ ] Deploy to production
- [ ] Setup GitHub Actions
- [ ] Verify cron job
- [ ] Monitor SystemLog

### Enhancements
- [ ] Add more sources
- [ ] User authentication
- [ ] Comment system
- [ ] Admin dashboard
- [ ] Telegram notifications
- [ ] Redis caching
- [ ] Google Analytics

---

**Made with ❤️ for Vietnamese Crypto Community**

**Version**: 2.0.0  
**Status**: ✅ Production Ready  
**Last Updated**: January 4, 2026

🚀 **Website tự động crawl tin tức mỗi 30 phút!**
