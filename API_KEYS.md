# 🔑 API KEYS - QUICK REFERENCE

## ✅ REQUIRED API KEYS

### 1. MongoDB Atlas (Database)
```
🔗 https://cloud.mongodb.com/
⏱️ 5 minutes
💰 FREE (M0 tier - 512MB)
📝 DATABASE_URL="mongodb+srv://..."
```

### 2. Groq API (AI Writer)
```
🔗 https://console.groq.com/keys
⏱️ 1 minute
💰 FREE (7,000 requests/day)
📝 GROQ_API_KEY="gsk_..."
```

### 3. CRON Secret (Security)
```
🔗 node scripts/generate-cron-secret.js
⏱️ 10 seconds
💰 FREE
📝 CRON_SECRET="ed5bbe377124d93091258349b7c2ebb225a0e0b6e8cdfaf3f913c7f78e54ac25"
```

---

## ⚪ OPTIONAL API KEYS

### 4. OpenAI API (Fallback AI)
```
🔗 https://platform.openai.com/api-keys
⏱️ 2 minutes
💰 $0.002 per article
📝 OPENAI_API_KEY="sk-proj-..."
```

### 5. Unsplash API (Images)
```
🔗 https://unsplash.com/oauth/applications/new
⏱️ 3 minutes
💰 FREE (50 requests/hour)
📝 UNSPLASH_ACCESS_KEY="..."
```

---

## 🚀 QUICK COMMANDS

```bash
# 1. Generate CRON secret
node scripts/generate-cron-secret.js

# 2. Install & setup
npm install
npx playwright install chromium
npx prisma generate
npx prisma db push

# 3. Add sources
npm run add-source

# 4. Test crawl
npm run run-crawl -- --max 3

# 5. Start dev
npm run dev
```

---

## 📄 FULL GUIDES

- **[START_HERE.md](START_HERE.md)** - 5 minute quickstart
- **[API_LINKS_SETUP.md](API_LINKS_SETUP.md)** - Detailed API setup with screenshots
- **[QUICKSTART.md](QUICKSTART.md)** - Complete setup guide
- **[FINAL_COMPLETE.md](FINAL_COMPLETE.md)** - Full system documentation

---

**Total Time**: 10 minutes | **Total Cost**: $0 (FREE tier)
