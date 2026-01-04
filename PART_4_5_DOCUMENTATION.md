# 🚀 PHẦN 4 & 5 - AUTOMATION & FRONTEND

## ✅ ĐÃ HOÀN THÀNH

### 🔄 PHẦN 4: AUTOMATION & CRON JOB

#### 1. API Route: /api/cron/crawl ✨

**File**: `app/api/cron/crawl/route.ts`

**Features**:
- ✅ POST endpoint để trigger crawl process
- ✅ Authentication với `CRON_SECRET` header
- ✅ Query param `?max=10` để giới hạn số bài
- ✅ Tự động crawl -> check duplicate -> AI rewrite
- ✅ Response JSON với stats
- ✅ Log vào SystemLog table

**Usage**:
```bash
# Test local
curl -X POST http://localhost:3000/api/cron/crawl?max=5 \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Response
{
  "success": true,
  "message": "Crawl completed",
  "stats": {
    "totalCrawled": 5,
    "totalSkipped": 2,
    "totalFailed": 0,
    "sources": [...]
  },
  "timestamp": "2026-01-04T..."
}
```

**Security**:
- Yêu cầu `CRON_SECRET` trong `.env`
- Authorization header: `Bearer YOUR_SECRET`
- Unauthorized (401) nếu sai secret

---

#### 2. GitHub Actions Workflow ✨

**File**: `.github/workflows/auto-crawl.yml`

**Triggers**:
- ⏰ Cron: Mỗi 30 phút (`*/30 * * * *`)
- 🔘 Manual: Workflow dispatch

**Setup**:
1. Tạo GitHub Secrets:
   - `SITE_URL`: URL website của bạn (vd: https://yourdomain.com)
   - `CRON_SECRET`: Secret key giống trong .env

2. Push code lên GitHub
3. GitHub Actions tự động chạy mỗi 30 phút

**Manual Trigger**:
- Vào GitHub repo -> Actions tab
- Chọn "Auto Crawl Crypto News"
- Click "Run workflow"

---

#### 3. Vercel Cron Jobs ✨

**File**: `vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/cron/crawl?max=10",
      "schedule": "*/30 * * * *"
    }
  ]
}
```

**Setup trên Vercel**:
1. Deploy lên Vercel
2. Thêm Environment Variable: `CRON_SECRET`
3. Vercel tự động chạy cron theo schedule

**Note**: Vercel Cron chỉ chạy trên **Production** deployment

---

#### 4. Environment Variables

Cập nhật `.env`:
```env
# Cron Secret (Required)
CRON_SECRET="your_random_secret_32_chars_min"

# Site URL (for GitHub Actions)
NEXT_PUBLIC_SITE_URL="https://yourdomain.com"
```

**Generate Secret**:
```bash
# Linux/Mac
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

---

### 🎨 PHẦN 5: FRONTEND UI

#### 1. NewsCard Component ✨

**File**: `components/NewsCard.tsx`

**3 Variants**:

1. **Featured** (Large) - Dùng cho tin nổi bật
   - 2 cột (image + content)
   - Gradient background
   - Hover effects

2. **Default** (Grid) - Dùng cho danh sách
   - Card style với shadow
   - Aspect ratio video
   - 3 columns grid

3. **Compact** (Small) - Dùng cho sidebar
   - Horizontal layout
   - Small thumbnail
   - 2 lines title

**Props**:
```typescript
{
  slug: string;
  title: string;
  description?: string;
  main_img: string;
  createdAt: Date;
  category?: { name: string; slug: string };
  variant?: 'default' | 'featured' | 'compact';
}
```

**Usage**:
```tsx
<NewsCard
  slug="bitcoin-vuot-50k"
  title="Bitcoin vượt mốc $50K"
  main_img="/image.jpg"
  createdAt={new Date()}
  variant="featured"
/>
```

---

#### 2. PostDetail Component ✨

**File**: `components/PostDetail.tsx`

**Features**:
- ✅ Responsive typography
- ✅ Share buttons (Facebook, Twitter, WhatsApp)
- ✅ Related posts section (3 columns)
- ✅ Category badge
- ✅ Reading time estimate
- ✅ Prose styling cho content HTML

**Prose Styling**:
- H2: Text-3xl, border-bottom
- H3: Text-2xl
- P: Leading-relaxed, mb-6
- Links: Blue, hover underline
- Blockquote: Left border, italic
- Images: Rounded, shadow

---

#### 3. Homepage (New) ✨

**File**: `app/homepage-new.tsx`

**Sections**:

1. **Hero Section** (Gradient blue-purple)
   - Title: "Tin Tức Crypto Mới Nhất"
   - Featured post (large card)

2. **Categories Bar**
   - Horizontal scrollable
   - Shows post count
   - Links to category pages

3. **Latest News Grid**
   - 3 columns (responsive)
   - 12 posts
   - "Xem tất cả" link

4. **CTA Section** (Gradient)
   - Call to action buttons
   - Links to main sections

**Data Fetching**:
```typescript
// Server Component
async function getLatestPosts() {
  return prisma.post.findMany({
    include: { category: true },
    orderBy: { createdAt: 'desc' },
    take: 13, // 1 featured + 12 latest
  });
}
```

---

#### 4. Article Detail Page (SEO) ✨

**File**: `app/article/[slug]/page-seo.tsx`

**SEO Features**:

1. **Dynamic Metadata**:
```typescript
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `${post.title} | Crypto News Hub`,
    description: post.description,
    keywords: '...',
    openGraph: { ... },
    twitter: { ... },
  };
}
```

2. **JSON-LD Structured Data**:
```json
{
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  "headline": "...",
  "datePublished": "...",
  "author": { "@type": "Organization" }
}
```

3. **Open Graph Tags** (Facebook sharing)
4. **Twitter Card** (Twitter sharing)
5. **Related Posts** (3 posts from same category)

**Static Generation**:
```typescript
export async function generateStaticParams() {
  const posts = await prisma.post.findMany({
    select: { slug: true },
    take: 100,
  });
  return posts.map(p => ({ slug: p.slug }));
}
```

**Revalidation**: Every 10 minutes (ISR)

---

## 📊 WORKFLOW AUTOMATION

```mermaid
graph LR
    A[GitHub Actions<br/>Every 30 min] -->|POST| B[/api/cron/crawl]
    C[Vercel Cron<br/>Every 30 min] -->|POST| B
    B -->|Crawl| D[smartCrawler]
    D -->|Articles| E[Check Duplicate]
    E -->|New| F[AI Rewrite]
    F -->|Processed| G[(CrawlArticle)]
    G -->|Publish| H[(Post)]
    H -->|Display| I[Frontend]
```

---

## 🎯 SETUP INSTRUCTIONS

### GitHub Actions

1. **Thêm Secrets**:
   ```
   Settings -> Secrets and variables -> Actions
   
   Secrets:
   - SITE_URL: https://yourdomain.com
   - CRON_SECRET: your_secret_key
   ```

2. **Enable Actions**:
   ```
   Actions tab -> Enable workflows
   ```

3. **Test Manual Run**:
   ```
   Actions -> Auto Crawl Crypto News -> Run workflow
   ```

---

### Vercel Deployment

1. **Deploy**:
   ```bash
   npm run build
   vercel --prod
   ```

2. **Environment Variables**:
   ```
   Settings -> Environment Variables
   
   Add:
   - CRON_SECRET
   - GROQ_API_KEY
   - DATABASE_URL
   - NEXT_PUBLIC_SITE_URL
   ```

3. **Verify Cron**:
   ```
   Settings -> Cron Jobs
   
   Should show:
   - Path: /api/cron/crawl?max=10
   - Schedule: */30 * * * *
   ```

---

### Local Testing

1. **Setup .env**:
   ```env
   CRON_SECRET="test_secret_12345"
   NEXT_PUBLIC_SITE_URL="http://localhost:3000"
   ```

2. **Test API**:
   ```bash
   curl -X POST http://localhost:3000/api/cron/crawl?max=3 \
     -H "Authorization: Bearer test_secret_12345"
   ```

3. **Test Components**:
   ```bash
   npm run dev
   # Visit http://localhost:3000
   ```

---

## 🎨 STYLING SYSTEM

### Tailwind Classes

**Colors**:
- Primary: `blue-600`
- Secondary: `purple-600`
- Text: `gray-900` (dark), `white` (dark mode)
- Background: `gray-50` (light), `gray-900` (dark)

**Spacing**:
- Container: `max-w-7xl mx-auto px-4`
- Section: `py-12 md:py-20`
- Gap: `gap-6 md:gap-8`

**Typography**:
- H1: `text-4xl md:text-6xl font-bold`
- H2: `text-3xl md:text-4xl font-bold`
- H3: `text-lg font-bold`
- Body: `text-gray-700 dark:text-gray-300`

**Hover Effects**:
- Scale: `hover:scale-105 transition-transform`
- Shadow: `hover:shadow-xl transition-all`
- Color: `hover:text-blue-600 transition-colors`

---

## 📈 SEO BEST PRACTICES

### Meta Tags
```html
<title>Bitcoin vượt $50K | Crypto News Hub</title>
<meta name="description" content="..." />
<meta name="keywords" content="crypto, bitcoin, ..." />
```

### Open Graph
```html
<meta property="og:title" content="..." />
<meta property="og:description" content="..." />
<meta property="og:image" content="https://..." />
<meta property="og:type" content="article" />
```

### Structured Data
```json
{
  "@type": "NewsArticle",
  "headline": "...",
  "datePublished": "2026-01-04T...",
  "author": { "@type": "Organization", "name": "..." }
}
```

### Performance
- Image optimization: Next.js `<Image>` component
- ISR (Incremental Static Regeneration): `revalidate = 600`
- Static Generation: `generateStaticParams()`

---

## 🚀 DEPLOYMENT CHECKLIST

- [ ] Update `.env` với CRON_SECRET
- [ ] Push code lên GitHub
- [ ] Setup GitHub Actions secrets
- [ ] Deploy lên Vercel
- [ ] Add Vercel environment variables
- [ ] Verify cron job chạy
- [ ] Test API endpoint
- [ ] Check logs trong Prisma Studio

---

## 🎉 KẾT QUẢ

Sau khi hoàn thành PHẦN 4 & 5, bạn có:

✅ **Automation**:
- Hệ thống tự động crawl mỗi 30 phút
- 2 cách: GitHub Actions + Vercel Cron
- API endpoint bảo mật
- Logging đầy đủ

✅ **Frontend**:
- Homepage đẹp với Featured + Latest
- NewsCard component (3 variants)
- PostDetail với typography chuẩn
- SEO optimization hoàn chỉnh
- Responsive design
- Dark mode support

✅ **SEO**:
- Dynamic metadata
- Open Graph tags
- Twitter Card
- JSON-LD structured data
- Static generation
- ISR revalidation

**Website chạy hoàn toàn tự động 24/7!** 🎊
