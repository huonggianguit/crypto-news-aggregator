# Crypto News Crawler

Crawler tự động thu thập bài báo về tiền mã hóa từ các nguồn tin uy tín.

## Nguồn tin được hỗ trợ

- ✅ **VnExpress** (vnexpress.net)
- ✅ **Tuổi Trẻ** (tuoitre.vn)

## Cách sử dụng

### 1. Crawl từ URL cụ thể

```bash
npm run crawl https://vnexpress.net/bao-hiem-xe-co-vu-phai-boi-thuong-khong-4536789.html
```

Hoặc nhiều URL cùng lúc:

```bash
npm run crawl https://vnexpress.net/article1.html https://tuoitre.vn/article2.htm
```

### 2. Xem thống kê

```bash
npm run crawl -- --stats
```

### 3. Xem trợ giúp

```bash
npm run crawl -- --help
```

## Cách hoạt động

1. **Fetch**: Tải HTML từ URL nguồn
2. **Parse**: Trích xuất tiêu đề, nội dung, ảnh, tác giả, ngày đăng
3. **Filter**: Chỉ lưu bài có từ khóa liên quan crypto (bitcoin, ethereum, blockchain, defi, nft, ...)
4. **Checksum**: Tính hash nội dung để detect thay đổi
5. **Save**: Lưu vào database (model `CrawlArticle`)
6. **Dedup**: Nếu URL đã tồn tại:
   - Checksum giống → skip
   - Checksum khác → update + đặt status = `pending`

## Database Schema

```prisma
model CrawlArticle {
  id             String   @id
  sourceUrl      String   @unique  // URL gốc
  title          String
  content        String           // HTML gốc
  author         String?
  publishedDate  DateTime?
  source         String           // vnexpress, tuoitre
  checksum       String?          // SHA256 hash
  status         String           // pending, processed, rejected
  mainImage      String?
  description    String?
  tags           Json?
  lastFetchedAt  DateTime
  createdAt      DateTime
  updatedAt      DateTime
}
```

## Ví dụ URL test

### VnExpress
```
https://vnexpress.net/bao-hiem-xe-co-vu-phai-boi-thuong-khong-4536789.html
https://vnexpress.net/bao-hiem-nhan-tho-tang-truong-4567890.html
```

### CoinDesk
```
https://www.coindesk.com/markets/2024/01/01/bitcoin-price-analysis/
https://www.coindesk.com/tech/2024/01/01/ethereum-upgrade/
```

### CoinTelegraph
```
https://cointelegraph.com/news/bitcoin-reaches-new-high
https://cointelegraph.com/news/defi-ecosystem-growth
```

## Troubleshooting

### Lỗi "EPERM: operation not permitted" khi prisma generate

```bash
# Đóng tất cả terminal đang chạy npm run dev
# Rồi chạy lại:
npx prisma generate
```

### Crawler không tìm thấy nội dung

- Kiểm tra selector trong `lib/crawler/articleCrawler.ts`
- Các trang tin có thể thay đổi HTML structure → cần update selector
- Test bằng cách xem source HTML của bài báo

### Bài báo bị skip

- Check console log: `[VnExpress] Skipping non-crypto article`
- Nghĩa là bài không chứa từ khóa crypto
- Thêm từ khóa vào mảng `cryptoKeywords` trong crawler

## Roadmap

- [x] Thêm crawler cho CoinDesk, CoinTelegraph
- [ ] Crawl RSS feed để tự động phát hiện bài mới
- [x] Tích hợp AI để viết lại bài (rewrite)
- [x] Tự động publish bài đã rewrite vào `Post`
- [ ] Scheduled job (GitHub Actions / cron)
