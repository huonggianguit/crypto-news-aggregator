# DATABASE MIGRATION GUIDE

## 🔄 CẬP NHẬT DATABASE SCHEMA

Sau khi thêm models **Source** và **SystemLog** vào `schema.prisma`, bạn cần sync với MongoDB.

---

## ⚡ QUICK MIGRATION

### Bước 1: Generate Prisma Client

```bash
npx prisma generate
```

Lệnh này sẽ:
- Generate TypeScript types từ schema
- Tạo Prisma Client mới với models Source và SystemLog

### Bước 2: Push Schema to MongoDB

```bash
npx prisma db push
```

Lệnh này sẽ:
- Tạo collections `Source` và `SystemLog` trong MongoDB
- Không cần migration files (MongoDB schema-less)

### Bước 3: Verify

```bash
npx prisma studio
```

Mở http://localhost:5555 và kiểm tra xem có 2 bảng mới:
- ✅ Source
- ✅ SystemLog

---

## 📝 CHI TIẾT CHANGES

### Schema.prisma - Additions

```prisma
// Đã thêm vào cuối file

model Source {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  name          String
  domain        String   @unique
  baseUrl       String
  selectors     Json
  isActive      Boolean  @default(true)
  lastCrawlAt   DateTime?
  totalCrawled  Int      @default(0)
  failCount     Int      @default(0)
  language      String   @default("vi")
  country       String?
  category      String?
  priority      Int      @default(1)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@index([isActive])
  @@index([priority])
}

model SystemLog {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  level         String
  module        String
  action        String
  message       String
  details       Json?
  articleId     String?  @db.ObjectId
  sourceUrl     String?
  userId        String?
  duration      Int?
  memoryUsage   Float?
  timestamp     DateTime @default(now())
  
  @@index([level])
  @@index([module])
  @@index([timestamp])
}
```

---

## 🛠️ TROUBLESHOOTING

### Lỗi: "Environment variable not found: DATABASE_URL"

**Giải pháp**:
```bash
# Tạo file .env
copy .env.example .env

# Thêm vào .env:
DATABASE_URL="mongodb+srv://user:pass@cluster.mongodb.net/crypto_news"
```

### Lỗi: "Can't reach database server"

**Giải pháp**:
1. Kiểm tra MongoDB Atlas connection string
2. Whitelist IP address trong MongoDB Atlas
3. Test connection:
```bash
npx prisma db pull
```

### Lỗi: "Prisma Client is not generated"

**Giải pháp**:
```bash
npx prisma generate
```

---

## 📊 VERIFY MIGRATION

### Test trong TypeScript

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function test() {
  // Test Source model
  const source = await prisma.source.create({
    data: {
      name: 'Test Source',
      domain: 'test.com',
      baseUrl: 'https://test.com',
      selectors: {
        title: 'h1',
        content: 'div.content',
      },
      isActive: true,
      priority: 3,
    },
  });
  
  console.log('Source created:', source);
  
  // Test SystemLog model
  const log = await prisma.systemLog.create({
    data: {
      level: 'info',
      module: 'test',
      action: 'test_action',
      message: 'Test log message',
    },
  });
  
  console.log('Log created:', log);
}

test();
```

---

## 🔍 SCHEMA INSPECTION

### View all models

```bash
npx prisma studio
```

### Get schema info

```bash
npx prisma db pull
```

### Validate schema

```bash
npx prisma validate
```

---

## 📈 MIGRATION CHECKLIST

- [ ] `npx prisma generate` - Generate client
- [ ] `npx prisma db push` - Push to MongoDB
- [ ] `npx prisma studio` - Verify tables exist
- [ ] `npm run test-setup` - Test system
- [ ] `npm run add-source` - Add first source
- [ ] `npm run run-crawl -- --max 1` - Test crawl

---

## 🎯 NEXT: SEED INITIAL DATA

### Add predefined sources

```bash
npm run add-source
```

Chọn các nguồn:
1. CoinDesk
2. Cointelegraph
3. VnExpress
4. TapChiBitcoin
5. TheBlock

---

**Migration hoàn tất! Database sẵn sàng sử dụng.**
