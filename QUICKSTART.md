# ⚡ QUICK START - 5 PHÚT SETUP

## 📋 CHECKLIST

- [ ] Node.js 18+ đã cài
- [ ] MongoDB Atlas account (hoặc local MongoDB)
- [ ] Groq API key (FREE) từ https://console.groq.com

---

## 🚀 5 BƯỚC SETUP

### 1️⃣ Cài Packages (2 phút)

```bash
cd d:\crypto_news\crypto-news
npm install
npx playwright install chromium
```

### 2️⃣ Setup Environment (1 phút)

```bash
# Copy template
copy .env.example .env

# Chỉnh sửa .env - CHỈ CẦN 2 DÒNG NÀY:
```

Mở `.env` và thêm:

```env
DATABASE_URL="mongodb+srv://YOUR_USER:YOUR_PASS@cluster.mongodb.net/crypto_news"
GROQ_API_KEY="gsk_YOUR_GROQ_KEY_HERE"
```

**Lấy Groq API Key FREE**:
1. Vào https://console.groq.com
2. Sign up (free)
3. Tạo API key
4. Copy vào `.env`

### 3️⃣ Setup Database (30 giây)

```bash
npx prisma generate
npx prisma db push
```

### 4️⃣ Thêm Nguồn Tin (1 phút)

```bash
npm run add-source
```

- Chọn `1` (Add predefined source)
- Chọn `1` (CoinDesk)
- Nhập `y` để confirm
- Lặp lại để thêm Cointelegraph, VnExpress, etc.

### 5️⃣ Test Crawl (30 giây)

```bash
npm run run-crawl -- --max 3
```

Xem kết quả trong Prisma Studio:

```bash
npx prisma studio
# Mở http://localhost:5555
# Xem bảng CrawlArticle
```

---

## ✅ DONE! BẠN ĐÃ CÓ:

✅ Crawler với anti-detection  
✅ AI rewriter (Groq - Llama-3.3-70b)  
✅ Database với Source management  
✅ SystemLog monitoring  
✅ 3 bài báo crypto đã crawl & rewrite  

---

## 🎯 TIẾP THEO

### Chạy Website

```bash
npm run dev
# Open http://localhost:3000
```

### Chạy Scheduler (Auto Crawl mỗi 30 phút)

```bash
npm run scheduler
```

### Publish Bài Viết

```bash
npm run publish
```

---

## 📊 SCRIPTS THƯỜNG DÙNG

```bash
# Crawl 10 bài
npm run run-crawl -- --max 10

# Crawl không AI rewrite (nhanh hơn)
npm run run-crawl -- --skip-rewrite

# Crawl từ 1 nguồn cụ thể
npm run run-crawl -- --source "CoinDesk"

# Auto crawl với keywords
npm run auto-crawl -- --keyword "Bitcoin" --max 20

# Thêm nguồn mới
npm run add-source

# Publish bài đã xử lý
npm run publish

# Xem Database
npx prisma studio
```

---

## 🐛 LỖI THƯỜNG GẶP

### "GROQ_API_KEY not found"
→ Chưa thêm vào `.env` hoặc `.env` không đúng vị trí

### "Playwright not found"
→ Chạy: `npx playwright install chromium`

### "Database connection failed"
→ Kiểm tra `DATABASE_URL` trong `.env`

### "No active sources found"
→ Chạy: `npm run add-source` để thêm nguồn

---

## 📚 ĐỌC THÊM

- [SETUP_GUIDE.md](SETUP_GUIDE.md) - Hướng dẫn chi tiết
- [ARCHITECTURE.md](ARCHITECTURE.md) - Kiến trúc hệ thống
- [README_V2.md](README_V2.md) - Full documentation

---

## 🎉 CHÚC MỪNG!

Bạn đã có một hệ thống tin tức crypto tự động hoàn chỉnh!

**Next Steps:**
1. Thêm nhiều nguồn tin hơn
2. Customize AI prompt trong `lib/ai/aiWriter.ts`
3. Setup scheduler cho production với PM2
4. Deploy website lên Vercel

---

**Need Help?**  
Xem [SETUP_GUIDE.md](SETUP_GUIDE.md) hoặc open GitHub issue
