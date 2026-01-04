# ⚡ QUICK START - 5 PHÚT

## 🎯 CÁC LINK API KEYS CẦN THIẾT

### ✅ REQUIRED (Bắt buộc)

1. **MongoDB Atlas** (Database - FREE)
   - Link: **https://cloud.mongodb.com/**
   - Time: 5 phút
   - Steps: Create cluster → Get connection string
   - Guide: [API_LINKS_SETUP.md](API_LINKS_SETUP.md#1%EF%B8%8F⃣-mongodb-atlas-database---required-)

2. **Groq API** (AI Writer - FREE 7000/day)
   - Link: **https://console.groq.com/keys**
   - Time: 1 phút
   - Steps: Sign in → Create API key → Copy
   - Guide: [API_LINKS_SETUP.md](API_LINKS_SETUP.md#2%EF%B8%8F⃣-groq-api-ai-writer---required-)

3. **CRON_SECRET** (Security - FREE)
   - Command: `node scripts/generate-cron-secret.js`
   - Time: 10 giây
   - Already generated: `ed5bbe377124d93091258349b7c2ebb225a0e0b6e8cdfaf3f913c7f78e54ac25`

### ⚪ OPTIONAL (Không bắt buộc)

4. **OpenAI API** (Fallback AI - Paid)
   - Link: **https://platform.openai.com/api-keys**
   - Cost: ~$0.002/article
   - Only needed if Groq fails

5. **Unsplash API** (Images - FREE 50/hour)
   - Link: **https://unsplash.com/oauth/applications/new**
   - Only for better thumbnail images

---

## 🚀 SETUP COMMANDS (Copy & Paste)

### Step 1: Cài Dependencies (nếu chưa)
```bash
npm install
npx playwright install chromium
```

### Step 2: Generate CRON_SECRET
```bash
node scripts/generate-cron-secret.js
# Copy secret vào .env
```

### Step 3: Update .env File
```bash
# Open .env và điền:
# 1. DATABASE_URL từ MongoDB Atlas
# 2. GROQ_API_KEY từ Groq Console
# 3. CRON_SECRET từ command trên
code .env
```

### Step 4: Setup Database
```bash
# Generate Prisma Client
npx prisma generate

# Push schema to MongoDB
npx prisma db push

# Verify (optional)
npx prisma studio
```

### Step 5: Add News Sources
```bash
npm run add-source
# Choose: 1 (CoinDesk), 2 (Cointelegraph), 3 (VnExpress)
# Or add all by typing: 1,2,3,4
```

### Step 6: Test Crawl (1 article)
```bash
npm run run-crawl -- --max 1
```

### Step 7: Run Full Crawl
```bash
npm run run-crawl -- --max 10
```

### Step 8: Start Dev Server
```bash
npm run dev
```

### Step 9: Open Browser
```
http://localhost:3000
```

---

## 📋 .env FILE TEMPLATE

```env
# ============================================
# REQUIRED
# ============================================

# MongoDB Atlas - Get from: https://cloud.mongodb.com/
DATABASE_URL="mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/crypto_news?retryWrites=true&w=majority"

# Groq API - Get from: https://console.groq.com/keys
GROQ_API_KEY="gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# CRON Secret - Generate with: node scripts/generate-cron-secret.js
CRON_SECRET="ed5bbe377124d93091258349b7c2ebb225a0e0b6e8cdfaf3f913c7f78e54ac25"

# ============================================
# OPTIONAL
# ============================================

# OpenAI API (fallback) - Get from: https://platform.openai.com/api-keys
# OPENAI_API_KEY="sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# Unsplash API - Get from: https://unsplash.com/oauth/applications/new
# UNSPLASH_ACCESS_KEY="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# ============================================
# SYSTEM
# ============================================
NODE_ENV="development"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
MAX_CRAWL_PER_RUN=20
```

---

## ✅ VERIFY CHECKLIST

Chạy từng command này để verify setup:

```bash
# 1. Check environment variables
npm run test-setup
# Expected: All ✓ green checks

# 2. Check database connection
npx prisma studio
# Expected: Opens http://localhost:5555, shows tables

# 3. Check sources added
# In Prisma Studio: Open "Source" table
# Expected: See CoinDesk, Cointelegraph, etc.

# 4. Check crawler works
npm run run-crawl -- --max 1
# Expected: 
# ✓ Crawled 1 article
# ✓ AI rewritten 1 article
# ✓ Saved to database

# 5. Check articles in database
# In Prisma Studio: Open "CrawlArticle" table
# Expected: See 1+ articles

# 6. Check dev server
npm run dev
# Expected: Server running at http://localhost:3000

# 7. Check homepage
# Open browser: http://localhost:3000
# Expected: See homepage (may be empty if no published posts)
```

---

## 🎓 DETAILED GUIDES

Nếu gặp vấn đề, xem guides chi tiết:

1. **[API_LINKS_SETUP.md](API_LINKS_SETUP.md)** - Chi tiết cách lấy tất cả API keys
2. **[QUICKSTART.md](QUICKSTART.md)** - Hướng dẫn setup từ đầu
3. **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Guide đầy đủ với troubleshooting
4. **[FINAL_COMPLETE.md](FINAL_COMPLETE.md)** - Tổng hợp toàn bộ hệ thống

---

## 🐛 COMMON ERRORS & FIXES

### Error: "Cannot find module '@prisma/client'"
```bash
npx prisma generate
```

### Error: "GROQ_API_KEY not found"
```bash
# Check .env file exists and has correct format:
# GROQ_API_KEY="gsk_..."
# Restart terminal after editing
```

### Error: "Database connection failed"
```bash
# Check MongoDB Atlas:
# 1. Cluster is running (not paused)
# 2. Network Access: 0.0.0.0/0 whitelisted
# 3. Database Access: User has correct permissions
```

### Error: "Playwright browser not found"
```bash
npx playwright install chromium
```

### No articles on homepage
```bash
# Articles are in "draft" status by default
# Need to publish them first:
npm run publish
# Or manually in Prisma Studio: Set status = "published"
```

---

## 📊 EXPECTED RESULTS

### After `npm run run-crawl -- --max 3`:
```
[Step 1] Loading sources from database...
[Step 1] Found 3 active sources
  - CoinDesk (coindesk.com)
  - Cointelegraph (cointelegraph.com)
  - VnExpress (vnexpress.net)

[Step 2] Crawling articles...

[SmartCrawler] Fetching: https://coindesk.com/...
[SmartCrawler] ✓ Extracted: Bitcoin Breaks $45,000...
[Crawler] ✓ Crypto-related: Bitcoin Breaks $45,000...
[AI Writer] Using provider: groq
[AI Writer] ✓ Rewritten in 3.2s
[DB] ✓ Saved article: bitcoin-breaks-45000...

... (2 more articles)

[Summary] Crawl completed in 45.2s
  ✓ Success: 3
  ⊘ Skipped: 0
  ✗ Failed: 0
```

### After `npm run dev`:
```
  ▲ Next.js 16.0.10
  - Local:        http://localhost:3000
  - Environments: .env

 ✓ Ready in 2.3s
```

---

## 🎉 YOU'RE READY!

Sau khi hoàn tất checklist:

- ✅ Database connected
- ✅ AI API working
- ✅ Crawler functional
- ✅ Articles in database
- ✅ Dev server running

**Next Steps:**
1. Crawl more articles: `npm run run-crawl -- --max 20`
2. Publish articles: `npm run publish` hoặc trong Prisma Studio
3. Customize UI: Edit `app/page.tsx`, `components/`
4. Deploy to production: See [FINAL_COMPLETE.md](FINAL_COMPLETE.md#deployment)

---

**Questions?** Check [API_LINKS_SETUP.md](API_LINKS_SETUP.md) for detailed guides!

**Total Setup Time**: 10-15 phút ⚡
