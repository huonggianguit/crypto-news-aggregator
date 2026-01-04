# 🚀 API KEYS & SETUP - LINKS ĐẦY ĐỦ

## 📋 TÓM TẮT NHANH

| Service | Status | Link | Time | Cost |
|---------|--------|------|------|------|
| **MongoDB Atlas** | ✅ REQUIRED | [cloud.mongodb.com](https://cloud.mongodb.com/) | 5 min | FREE |
| **Groq API** | ✅ REQUIRED | [console.groq.com/keys](https://console.groq.com/keys) | 1 min | FREE (7000/day) |
| **OpenAI API** | ⚪ Optional | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) | 2 min | $0.15/1M tokens |
| **Unsplash API** | ⚪ Optional | [unsplash.com/oauth/applications](https://unsplash.com/oauth/applications/new) | 3 min | FREE (50 requests/hour) |
| **CRON_SECRET** | ✅ REQUIRED | Generate locally | 10 sec | FREE |

**Total Setup Time**: ~10 phút (chỉ cần REQUIRED)

---

## 1️⃣ MONGODB ATLAS (DATABASE) - REQUIRED ✅

### 🔗 Link
**https://cloud.mongodb.com/**

### 📝 Steps (5 phút)

1. **Tạo Account**
   - Vào: https://www.mongodb.com/cloud/atlas/register
   - Sign up với Google hoặc Email
   - Verify email

2. **Tạo Cluster FREE**
   - Click "Create" → "Deploy a database"
   - Chọn **M0 FREE** (512MB storage - đủ dùng)
   - Cloud Provider: **AWS** (recommended)
   - Region: **Singapore** (ap-southeast-1) hoặc gần nhất
   - Cluster Name: `crypto-news` (hoặc tên bạn muốn)
   - Click **Create Cluster**

3. **Security - Database Access**
   - Sidebar: **Security** → **Database Access**
   - Click **Add New Database User**
   - Username: `crypto_admin` (hoặc tên bạn muốn)
   - Password: Click **Autogenerate** (copy & save!)
   - Built-in Role: **Atlas admin**
   - Click **Add User**

4. **Security - Network Access**
   - Sidebar: **Security** → **Network Access**
   - Click **Add IP Address**
   - Click **Allow Access from Anywhere** (0.0.0.0/0)
   - Confirm

5. **Get Connection String**
   - Sidebar: **Deployment** → **Database**
   - Click **Connect** button
   - Click **Drivers**
   - Copy connection string:
     ```
     mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - Replace `<username>` với username của bạn
   - Replace `<password>` với password đã copy
   - Add database name: `/crypto_news` sau `.net`
   
   **Final string:**
   ```
   mongodb+srv://crypto_admin:yourpassword@cluster0.xxxxx.mongodb.net/crypto_news?retryWrites=true&w=majority
   ```

6. **Paste vào .env**
   ```env
   DATABASE_URL="mongodb+srv://crypto_admin:yourpassword@cluster0.xxxxx.mongodb.net/crypto_news?retryWrites=true&w=majority"
   ```

---

## 2️⃣ GROQ API (AI WRITER) - REQUIRED ✅

### 🔗 Link
**https://console.groq.com/keys**

### 📝 Steps (1 phút)

1. **Tạo Account**
   - Vào: https://console.groq.com/
   - Click **Sign in with Google** hoặc **GitHub**
   - Authorize

2. **Create API Key**
   - Đã tự động vào trang: https://console.groq.com/keys
   - Click **Create API Key**
   - Name: `crypto-news-crawler`
   - Click **Submit**
   - **COPY KEY NGAY** (chỉ hiển thị 1 lần!)
   - Format: `gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

3. **Paste vào .env**
   ```env
   GROQ_API_KEY="gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
   ```

### 💡 Features
- **FREE**: 7,000 requests/day (đủ cho ~350 articles/day)
- **Fast**: 200-500 tokens/second
- **Model**: Llama-3.3-70b-versatile (70B parameters)
- **No Credit Card Required**

### 📊 Check Usage
- Dashboard: https://console.groq.com/
- View requests, tokens used, rate limits

---

## 3️⃣ OPENAI API (OPTIONAL FALLBACK) ⚪

### 🔗 Link
**https://platform.openai.com/api-keys**

### 📝 Steps (2 phút)

1. **Tạo Account**
   - Vào: https://platform.openai.com/signup
   - Sign up với Email
   - Verify email

2. **Add Payment Method** (REQUIRED)
   - Dashboard: https://platform.openai.com/account/billing/overview
   - Add credit card
   - Minimum: $5

3. **Create API Key**
   - Vào: https://platform.openai.com/api-keys
   - Click **Create new secret key**
   - Name: `crypto-news-crawler`
   - Click **Create secret key**
   - **COPY KEY NGAY** (chỉ hiển thị 1 lần!)
   - Format: `sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

4. **Paste vào .env**
   ```env
   OPENAI_API_KEY="sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
   ```

### 💰 Pricing
- **GPT-4o-mini**: $0.15 per 1M input tokens, $0.60 per 1M output tokens
- ~$0.002 per article (~1500 tokens in + 2000 tokens out)
- $5 credit → ~2,500 articles

### 📊 Check Usage
- Dashboard: https://platform.openai.com/usage
- Set budget limits: https://platform.openai.com/account/limits

---

## 4️⃣ UNSPLASH API (IMAGES - OPTIONAL) ⚪

### 🔗 Link
**https://unsplash.com/oauth/applications/new**

### 📝 Steps (3 phút)

1. **Tạo Account**
   - Vào: https://unsplash.com/join
   - Sign up với Email
   - Verify email

2. **Create Application**
   - Vào: https://unsplash.com/oauth/applications/new
   - Application name: `Crypto News Aggregator`
   - Description: `Automated crypto news website with AI rewriter`
   - Click **Create application**

3. **Accept Terms**
   - Accept API Use and Guidelines
   - Confirm

4. **Get Access Key**
   - Scroll to **Keys** section
   - Copy **Access Key**
   - Format: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

5. **Paste vào .env**
   ```env
   UNSPLASH_ACCESS_KEY="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
   ```

### 💡 Features
- **FREE**: 50 requests/hour (demo apps)
- Production: Apply for higher limits (5,000/hour)
- High-quality images
- Auto attribution

---

## 5️⃣ CRON_SECRET (SECURITY) - REQUIRED ✅

### 🔗 Generate Methods

**Option 1: Online Generator (Fastest)**
```
https://generate-secret.vercel.app/32
```

**Option 2: Node.js Command**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Option 3: PowerShell Command**
```powershell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

**Option 4: Manual**
```
Use password manager to generate 32+ random characters
Example: Kx9mPz2vQw8nLs4fR1hY7tBc3jDa6eGx
```

### 📝 Paste vào .env
```env
CRON_SECRET="your_generated_32_character_secret_here"
```

### 🔒 Security
- **NEVER commit** .env file to Git
- **NEVER share** this secret publicly
- Use different secrets for dev/production
- Rotate every 3-6 months

---

## 🚀 QUICK START - SAU KHI CÓ API KEYS

### Step 1: Update .env file
```bash
# Open .env and fill in all values from above
code .env
```

### Step 2: Setup Database
```bash
# Generate Prisma Client
npx prisma generate

# Push schema to MongoDB
npx prisma db push

# Open Prisma Studio to verify
npx prisma studio
```

### Step 3: Add News Sources
```bash
npm run add-source
# Choose: 1 (CoinDesk), 2 (Cointelegraph), 3 (VnExpress)
```

### Step 4: Test Crawl
```bash
# Test with 3 articles
npm run run-crawl -- --max 3

# Should see:
# ✓ Crawled 3 articles
# ✓ AI rewritten 3 articles
# ✓ Saved to database
```

### Step 5: Start Dev Server
```bash
npm run dev
# Open: http://localhost:3000
```

---

## 📊 VERIFY SETUP

### Check 1: Environment Variables
```bash
npm run test-setup
# Should show all ✓ green checks
```

### Check 2: Database Connection
```bash
npx prisma studio
# Should open: http://localhost:5555
# Check tables: Source, CrawlArticle, Post
```

### Check 3: Crawler
```bash
npm run run-crawl -- --max 1
# Should crawl 1 article successfully
```

### Check 4: AI Rewriter
```bash
# Check logs from previous command
# Should see: [AI Writer] Using provider: groq
# Should see: [AI Writer] ✓ Rewritten in 3.2s
```

---

## ❌ TROUBLESHOOTING

### Error: "GROQ_API_KEY not found"
```bash
# Check .env file exists
cat .env

# Check variable name (case-sensitive)
# Should be: GROQ_API_KEY="gsk_..."

# Restart terminal after editing .env
```

### Error: "Database connection failed"
```bash
# Check MongoDB Atlas:
# 1. Cluster is running (not paused)
# 2. IP whitelist includes 0.0.0.0/0
# 3. User has correct permissions
# 4. Password is correct (no special chars in URL)

# Test connection
npx prisma db push
```

### Error: "Playwright not installed"
```bash
# Install Playwright browsers
npx playwright install chromium

# Should download ~100MB Chrome binary
```

### Error: "Module not found"
```bash
# Reinstall dependencies
npm install

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 🎓 LEARNING RESOURCES

### MongoDB Atlas
- Docs: https://www.mongodb.com/docs/atlas/
- Free Tier: https://www.mongodb.com/pricing
- Connection Guide: https://www.mongodb.com/docs/guides/atlas/connection-string/

### Groq API
- Docs: https://console.groq.com/docs
- Models: https://console.groq.com/docs/models
- Rate Limits: https://console.groq.com/docs/rate-limits

### OpenAI API
- Docs: https://platform.openai.com/docs/introduction
- Pricing: https://openai.com/api/pricing/
- Best Practices: https://platform.openai.com/docs/guides/production-best-practices

### Unsplash API
- Docs: https://unsplash.com/documentation
- Guidelines: https://help.unsplash.com/en/articles/2511245-unsplash-api-guidelines

---

## 💰 COST ESTIMATE

### Development (Testing)
| Service | Cost | Usage |
|---------|------|-------|
| MongoDB Atlas | **FREE** | M0 tier (512MB) |
| Groq API | **FREE** | 7000 requests/day |
| Unsplash | **FREE** | 50 requests/hour |
| **Total** | **$0/month** | ✅ |

### Production (1000 articles/day)
| Service | Cost | Usage |
|---------|------|-------|
| MongoDB Atlas | **FREE** | M0 tier sufficient |
| Groq API | **FREE** | ~140 requests/day |
| Vercel Hosting | **FREE** | Hobby tier |
| Domain | **$12/year** | .com domain |
| **Total** | **~$1/month** | 🎉 |

### High Volume (10,000 articles/day)
| Service | Cost | Usage |
|---------|------|-------|
| MongoDB Atlas | **$9/month** | M2 tier (2GB) |
| Groq API | **FREE** | 1,400 requests/day (within limit) |
| Vercel Pro | **$20/month** | Better performance |
| **Total** | **~$29/month** | 📈 |

---

## 📞 SUPPORT LINKS

- **MongoDB Support**: https://www.mongodb.com/community/forums/
- **Groq Discord**: https://discord.gg/groq
- **OpenAI Support**: https://help.openai.com/
- **Unsplash Help**: https://help.unsplash.com/

---

## ✅ CHECKLIST

Sau khi setup xong, check các items này:

- [ ] MongoDB Atlas cluster đang chạy
- [ ] Database connection string trong .env
- [ ] Groq API key trong .env (hoặc OpenAI)
- [ ] CRON_SECRET generated (32+ chars)
- [ ] `npm install` completed
- [ ] `npx prisma generate` completed
- [ ] `npx prisma db push` completed
- [ ] `npm run add-source` added sources
- [ ] `npm run test-setup` all green checks
- [ ] `npm run run-crawl -- --max 3` successful
- [ ] `npm run dev` server running
- [ ] http://localhost:3000 shows homepage

**Khi tất cả checked → Bạn đã sẵn sàng! 🎉**

---

**Last Updated**: January 4, 2026  
**Estimated Total Setup Time**: 10-15 phút
