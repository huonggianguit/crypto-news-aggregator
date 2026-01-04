# HƯỚNG DẪN SETUP VÀ SỬ DỤNG HỆ THỐNG TIN TỨC TỰ ĐỘNG

## 📋 MỤC LỤC
1. [Giới thiệu](#giới-thiệu)
2. [Tech Stack](#tech-stack)
3. [Cài đặt](#cài-đặt)
4. [Cấu hình Database](#cấu-hình-database)
5. [Thêm nguồn tin](#thêm-nguồn-tin)
6. [Chạy Crawler](#chạy-crawler)
7. [AI Writer](#ai-writer)
8. [Scheduler](#scheduler)

---

## 🎯 GIỚI THIỆU

Hệ thống Website Tin Tức Tự Động (Automated News Aggregator) tập trung vào thị trường Crypto. Tự động:
- Thu thập tin tức từ các nguồn nước ngoài và trong nước
- Sử dụng AI để dịch và viết lại chuẩn SEO
- Tự động đăng bài lên website

## 🛠️ TECH STACK

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Database**: MongoDB + Prisma ORM
- **Crawler**: Playwright (xử lý JavaScript rendering)
- **AI Writer**: Groq API (Llama-3.3-70b) hoặc OpenAI (GPT-4o-mini)
- **Styling**: Tailwind CSS + Shadcn/UI
- **Job Queue**: node-cron
- **Anti-Detection**: Custom stealth browser config

---

## 📦 CÀI ĐẶT

### 1. Clone và install dependencies

```bash
cd d:\crypto_news\crypto-news
npm install
```

### 2. Cài thêm Playwright browsers

```bash
npx playwright install chromium
```

### 3. Setup environment variables

```bash
# Copy file .env.example thành .env
copy .env.example .env

# Chỉnh sửa .env với thông tin thật
```

**QUAN TRỌNG**: Cần có ít nhất 1 trong 2:
- `GROQ_API_KEY`: Đăng ký tại https://console.groq.com (Free tier: 7000 requests/day)
- `OPENAI_API_KEY`: Đăng ký tại https://platform.openai.com

### 4. Setup Database

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to MongoDB
npx prisma db push
```

---

## 💾 CẤU HÌNH DATABASE

### Cấu trúc các bảng chính

```
Source         -> Quản lý nguồn tin (URL, selector)
CrawlArticle   -> Bài báo đã crawl (staging)
Post           -> Bài viết đã publish
Category       -> Danh mục bài viết
SystemLog      -> Log hệ thống
```

### Kiểm tra Database

```bash
# Mở Prisma Studio
npx prisma studio

# Truy cập: http://localhost:5555
```

---

## 🌐 THÊM NGUỒN TIN

Trước khi crawl, bạn cần thêm nguồn tin vào bảng `Source`.

### Ví dụ: Thêm CoinDesk

```javascript
// Chạy trong Prisma Studio hoặc Node.js script
{
  name: "CoinDesk",
  domain: "coindesk.com",
  baseUrl: "https://www.coindesk.com/latest",
  selectors: {
    title: "h1.headline",
    content: "div.article-content",
    author: "span.author-name",
    date: "time",
    mainImage: "figure.lead-image img",
    description: "p.lead"
  },
  isActive: true,
  language: "en",
  country: "US",
  category: "crypto",
  priority: 5
}
```

### Ví dụ: Thêm VnExpress

```javascript
{
  name: "VnExpress",
  domain: "vnexpress.net",
  baseUrl: "https://vnexpress.net/kinh-doanh/tien-ao",
  selectors: {
    title: "h1.title-detail",
    content: "article.fck_detail",
    author: "p.author_mail",
    date: "span.date",
    mainImage: "div.fig-picture img",
    description: "p.description"
  },
  isActive: true,
  language: "vi",
  country: "VN",
  category: "crypto",
  priority: 4
}
```

**Script helper để thêm nguồn**:

```bash
# Tạo file scripts/add-source.ts
ts-node scripts/add-source.ts --name "CoinDesk" --url "https://coindesk.com/latest"
```

---

## 🤖 CHẠY CRAWLER

### 1. Crawl thủ công

```bash
# Sử dụng script mới (smartCrawler)
npm run crawl

# Với options
npm run crawl -- --max 10          # Giới hạn 10 bài
npm run crawl -- --skip-rewrite    # Crawl nhưng không AI rewrite
npm run crawl -- --source "CoinDesk"  # Chỉ crawl từ 1 nguồn
```

### 2. Crawl tự động với keywords

```bash
npm run auto-crawl

# Với custom keywords
npm run auto-crawl -- --keyword "Bitcoin" --keyword "DeFi" --max 30
```

### 3. Test crawler cho 1 URL

```bash
ts-node scripts/test-crawler.ts "https://coindesk.com/article-slug"
```

---

## 🤖 AI WRITER

### Module mới: `lib/ai/aiWriter.ts`

**Features**:
- ✅ Retry với exponential backoff (3 lần)
- ✅ Hỗ trợ Groq API (Llama-3.3-70b) và OpenAI (GPT-4o-mini)
- ✅ Parse JSON với markdown code block handling
- ✅ Prompt engineering chuẩn cho tin tức crypto

### Sử dụng AI Writer

```typescript
import { rewriteArticle } from '@/lib/ai/aiWriter';

const result = await rewriteArticle({
  title: "Bitcoin Surges to $50K",
  content: "<p>Original content...</p>",
  description: "Brief description",
  source: "CoinDesk"
}, 'groq'); // hoặc 'openai'

console.log(result.title);        // Tiêu đề mới
console.log(result.content_html); // HTML mới
console.log(result.summary);      // Tóm tắt
```

### Test AI Writer

```bash
ts-node scripts/test-ai-writer.ts
```

---

## ⏰ SCHEDULER

### Chạy daemon tự động

```bash
npm run scheduler

# Hoặc với PM2 (production)
pm2 start npm --name "crypto-crawler" -- run scheduler
pm2 save
pm2 startup
```

### Cấu hình trong `lib/scheduler/crawlScheduler.ts`

```typescript
// Chạy mỗi 30 phút
cron.schedule('*/30 * * * *', async () => {
  await runCrawlTask();
});
```

---

## 📊 WORKFLOW HOÀN CHỈNH

```
1. SEARCH
   └─> searchCrawler.ts
       └─> Tìm bài viết mới theo keywords

2. CRAWL
   └─> smartCrawler.ts (với anti-detection)
       └─> Lấy nội dung HTML từ URL

3. CHECK DUPLICATE
   └─> So sánh checksum (SHA-256)
       └─> Skip nếu trùng

4. AI REWRITE
   └─> aiWriter.ts (Groq/OpenAI)
       └─> Viết lại tiếng Việt, chuẩn SEO
       └─> Retry 3 lần nếu lỗi

5. SAVE TO DB
   └─> Lưu vào CrawlArticle
       └─> Status: "processed"

6. PUBLISH
   └─> articlePublisher.ts
       └─> Chuyển sang bảng Post
       └─> Hiển thị trên website
```

---

## 🔧 TROUBLESHOOTING

### Lỗi: "GROQ_API_KEY not found"
**Giải pháp**: Kiểm tra file `.env`, đảm bảo có `GROQ_API_KEY="gsk_..."`

### Lỗi: "Playwright browser not found"
**Giải pháp**: Chạy `npx playwright install chromium`

### Lỗi: "Database connection failed"
**Giải pháp**: 
1. Kiểm tra `DATABASE_URL` trong `.env`
2. Chạy `npx prisma db push` để sync schema
3. Test connection: `npx prisma db pull`

### Lỗi: "Rate limit exceeded" (Groq API)
**Giải pháp**:
1. Giảm tốc độ crawl (tăng delay)
2. Hoặc chuyển sang OpenAI API

### Crawler bị chặn IP
**Giải pháp**:
1. Module `browserConfig.ts` đã có anti-detection
2. Nếu vẫn bị chặn, thêm proxy trong `.env`
3. Hoặc chạy trên VPS nước ngoài

---

## 📈 MONITORING

### Xem logs hệ thống

```typescript
// Query SystemLog từ Prisma Studio
// Hoặc tạo API endpoint

import { prisma } from '@/lib/prisma';

const logs = await prisma.systemLog.findMany({
  where: { module: 'crawler' },
  orderBy: { timestamp: 'desc' },
  take: 100
});
```

### Stats crawl

```bash
# API endpoint: /api/scheduler/status
curl http://localhost:3000/api/scheduler/status
```

---

## 🚀 PRODUCTION DEPLOYMENT

### 1. Setup PM2

```bash
# Install PM2
npm install -g pm2

# Start crawler daemon
pm2 start npm --name "crypto-crawler" -- run scheduler

# Monitor
pm2 logs crypto-crawler
pm2 monit
```

### 2. Setup Nginx reverse proxy

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 3. Environment cho Production

```bash
NODE_ENV="production"
DATABASE_URL="mongodb+srv://prod_user:..."
GROQ_API_KEY="gsk_prod_key..."
```

---

## 📚 TÀI LIỆU THAM KHẢO

- [Prisma Docs](https://www.prisma.io/docs)
- [Playwright Docs](https://playwright.dev)
- [Groq API Docs](https://console.groq.com/docs)
- [Next.js Docs](https://nextjs.org/docs)

---

## 🤝 SUPPORT

Nếu gặp vấn đề:
1. Kiểm tra [Troubleshooting](#troubleshooting)
2. Xem logs: `npx prisma studio` -> SystemLog table
3. Test từng module riêng lẻ

---

**Made with ❤️ for Vietnamese Crypto Community**
