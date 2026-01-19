// lib/crawl.ts
import { chromium, BrowserContext } from 'playwright';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import slugify from 'slugify';
import pLimit from 'p-limit';

import { prisma } from '@/lib/db/index';
import { translateWithRetry, TocItem } from '@/lib/ai-gen';
import { generateEmbedding, vectorToString } from '@/lib/ai-embedding';

// ===== CONSTANTS =====
const DEFAULT_THUMBNAIL = '/file.svg';
const CONCURRENT_CRAWL_LIMIT = 10;
const CONCURRENT_AI_LIMIT = 5;
const MIN_ARTICLE_LENGTH = 2000;
const MIN_SLUG_LENGTH = 20;

// ===== CHUẨN HÓA URL =====
function normalizeUrl(input: string): string {
  if (!input.startsWith('http://') && !input.startsWith('https://')) {
    input = 'https://' + input;
  }
  input = input.replace(/\\/g, '/');
  return input;
} 

// ===== DELAY =====
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ===== TẠO BROWSER CONTEXT =====
async function createBrowser() {
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox',
      '--disable-dev-shm-usage'
    ]
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 },
    locale: 'en-US',
  });

  return { browser, context };
}

// ===== FETCH HTML =====
async function fetchHtmlWithContext(context: BrowserContext, url: string): Promise<string> {
  const page = await context.newPage();

  try {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
    });

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(1000);

    return await page.content();
  } finally {
    await page.close();
  }
}

// ===== EXTRACT TOC từ HTML =====
function extractToc(html: string): TocItem[] {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  const toc: TocItem[] = [];

  // Tìm tất cả headings h2, h3, h4
  const headings = document.querySelectorAll('h2, h3, h4');

  headings.forEach((heading, index) => {
    const level = parseInt(heading.tagName.charAt(1));
    const text = heading.textContent?.trim() || '';

    if (text) {
      // Tạo id nếu chưa có
      let id = heading.id;
      if (!id) {
        id = slugify(text, { lower: true, strict: true }) || `heading-${index}`;
      }

      toc.push({ id, text, level });
    }
  });

  return toc;
}

// ===== EXTRACT ARTICLE bằng Readability =====
function extractArticle(html: string, url: string) {
  const dom = new JSDOM(html, { url });
  const document = dom.window.document;

  const reader = new Readability(document);
  const article = reader.parse();

  // Lấy main image từ meta tags
  let mainImage = '';
  const ogImage = document.querySelector('meta[property="og:image"]');
  const twitterImage = document.querySelector('meta[name="twitter:image"]');

  if (ogImage) {
    mainImage = ogImage.getAttribute('content') || '';
  } else if (twitterImage) {
    mainImage = twitterImage.getAttribute('content') || '';
  }

  // Chuẩn hóa URL ảnh
  if (mainImage && !mainImage.startsWith('http')) {
    const urlObj = new URL(url);
    mainImage = mainImage.startsWith('/')
      ? `${urlObj.origin}${mainImage}`
      : `${urlObj.origin}/${mainImage}`;
  }

  // Extract TOC từ HTML content
  const toc = extractToc(article?.content || html);

  return {
    url,
    title: article?.title || document.title || 'No title',
    thumbnail: mainImage || DEFAULT_THUMBNAIL,
    content: article?.content || '', // HTML content
    textContent: article?.textContent?.trim() || '',
    toc,
  };
}

// ===== EXTRACT ALL LINKS từ HTML (để BFS bò khắp nơi) =====
function extractAllLinks(html: string, baseUrl: string): string[] {
  const dom = new JSDOM(html, { url: baseUrl });
  const document = dom.window.document;
  const baseOrigin = new URL(baseUrl).origin;

  // Chỉ exclude những trang CHẮC CHẮN không cần crawl
  const excludePatterns = [
    '/login', '/register', '/signup', '/signin',
    '/cart', '/checkout', '/account', '/profile',
    '/search', '/admin', '/wp-admin', '/wp-login',
    '/feed', '/rss', '/api/', '?', '#',
  ];

  // Exclude static files
  const staticExtensions = [
    '.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.ico',
    '.css', '.js', '.pdf', '.zip', '.mp4', '.mp3',
  ];

  const links: string[] = [];
  const anchors = document.querySelectorAll('a[href]');

  anchors.forEach((a) => {
    let href = a.getAttribute('href') || '';

    // Skip anchors, javascript, mailto
    if (href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:')) {
      return;
    }

    // Normalize URL
    if (href.startsWith('/')) {
      href = baseOrigin + href;
    } else if (!href.startsWith('http')) {
      href = baseOrigin + '/' + href;
    }

    // Chỉ lấy cùng domain
    if (!href.startsWith(baseOrigin)) {
      return;
    }

    // Skip current page
    if (href === baseUrl || href === baseUrl + '/') {
      return;
    }

    // Skip excluded patterns
    const lowerHref = href.toLowerCase();
    if (excludePatterns.some(pattern => lowerHref.includes(pattern))) {
      return;
    }

    // Skip static files
    if (staticExtensions.some(ext => lowerHref.endsWith(ext))) {
      return;
    }

    // Clean URL (remove trailing slash for consistency)
    href = href.replace(/\/+$/, '');

    links.push(href);
  });

  return [...new Set(links)];
}

// ===== CHECK XEM PAGE CÓ PHẢI BÀI VIẾT KHÔNG =====
interface ArticleCheckResult {
  isArticle: boolean;
  title: string | null;
  content: string | null;
  thumbnail: string | null;
  excerpt: string | null;
  reason?: string;
}

// Các URL patterns CHẮC CHẮN không phải bài viết
// Chỉ match nếu pattern ở CUỐI URL hoặc là toàn bộ path segment
const NON_ARTICLE_EXACT_PATHS = [
  '/about', '/about-us', '/about/',
  '/contact', '/contact-us', '/contact/',
  '/privacy', '/privacy-policy', '/privacy/',
  '/terms', '/terms-of-service', '/terms-of-use', '/terms/',
  '/disclaimer', '/disclaimer/',
  '/cookie', '/cookie-policy', '/cookies/',
  '/faq', '/faqs', '/faq/',
  '/help', '/help/', '/support', '/support/',
  '/team', '/our-team', '/team/',
  '/careers', '/jobs', '/careers/', '/jobs/',
  '/press', '/media', '/press', '/media/',
  '/advertise', '/advertising', '/sponsor/', '/partner/',
  '/sitemap', '/sitemap.xml',
];

// Patterns cho trang LISTING (không phải bài viết đơn lẻ)
const NON_ARTICLE_LISTING_PATTERNS = [
  '/author/', '/authors/',      // Trang profile author
  '/tag/', '/tags/',            // Trang listing theo tag
  '/category/', '/categories/', // Trang listing theo category
  '/page/', '/pages/',          // Pagination
  '/archive/', '/archives/',    // Archive pages
];

function checkIsArticle(html: string, url: string): ArticleCheckResult {
  const urlPath = new URL(url).pathname;

  // 1. Check slug length
  const slug = urlPath.split('/').filter(Boolean).pop() || '';
  if (slug.length < MIN_SLUG_LENGTH) {
    return {
      isArticle: false,
      title: null,
      content: null,
      thumbnail: null,
      excerpt: null,
      reason: `Slug too short (${slug.length} < ${MIN_SLUG_LENGTH})`
    };
  }
  
  const lowerUrlPath = urlPath.toLowerCase();

  // 2. Check EXACT paths - các trang utility
  for (const exactPath of NON_ARTICLE_EXACT_PATHS) {
    if (lowerUrlPath === exactPath || lowerUrlPath === exactPath.replace(/\/$/, '')) {
      return {
        isArticle: false,
        title: null,
        content: null,
        thumbnail: null,
        excerpt: null,
        reason: `Utility page: "${exactPath}"`
      };
    }
  }

  // 3. Check LISTING patterns - author/tag/category pages
  for (const pattern of NON_ARTICLE_LISTING_PATTERNS) {
    // Match: /author/name hoặc /author/name/
    // Nhưng không match nếu có thêm path segment (bài viết)
    const regex = new RegExp(`^${pattern.replace('/', '\\/')}[^/]+\\/?$`);
    if (regex.test(lowerUrlPath)) {
      return {
        isArticle: false,
        title: null,
        content: null,
        thumbnail: null,
        excerpt: null,
        reason: `Listing page: "${pattern}"`
      };
    }
  }

  const dom = new JSDOM(html, { url });
  const document = dom.window.document;

  // 4. Check og:type - nếu website khai báo rõ
  const ogType = document.querySelector('meta[property="og:type"]')?.getAttribute('content');

  // 5. Extract với Readability
  const reader = new Readability(document.cloneNode(true) as Document);
  const article = reader.parse();

  // 6. Lấy thumbnail từ og:image
  let thumbnail = document.querySelector('meta[property="og:image"]')?.getAttribute('content') || '';
  if (!thumbnail) {
    thumbnail = document.querySelector('meta[name="twitter:image"]')?.getAttribute('content') || '';
  }

  // 7. Check điều kiện
  const title = article?.title?.trim() || null;
  const content = article?.content?.trim() || null;
  const textContent = article?.textContent?.trim() || '';

  if (!title) {
    return { isArticle: false, title, content, thumbnail, excerpt: null, reason: 'No title' };
  }

  if (!content || textContent.length < MIN_ARTICLE_LENGTH) {
    return {
      isArticle: false,
      title,
      content,
      thumbnail,
      excerpt: null,
      reason: `Content too short (${textContent.length} < ${MIN_ARTICLE_LENGTH})`
    };
  }

  const excerpt = textContent.substring(0, 300).trim();

  return {
    isArticle: true,
    title,
    content,
    thumbnail: thumbnail || null,
    excerpt,
  };
}

// ===== CHECK ARTICLE EXISTS =====
async function articleExists(sourceUrl: string): Promise<boolean> {
  const existing = await prisma.article.findUnique({
    where: { sourceUrl },
    select: { id: true },
  });
  return existing !== null;
}

// ===== GENERATE SLUG =====
function generateSlug(title: string): string {
  const baseSlug = slugify(title, {
    lower: true,
    strict: true,
    locale: 'vi',
  });

  // Thêm timestamp để đảm bảo unique
  const timestamp = Date.now().toString(36);
  return `${baseSlug}-${timestamp}`;
}

// ===== PROCESS & SAVE ARTICLE =====
async function processAndSaveArticle(
  html: string,
  sourceUrl: string
): Promise<{ success: boolean; slug?: string; error?: string }> {
  try {
    if (await articleExists(sourceUrl)) {
      console.log(`   ⏭️ Already exists, skipping`);
      return { success: false, error: 'Article already exists' };
    }

    const extracted = extractArticle(html, sourceUrl);
    console.log(`   📰 Title: ${extracted.title}`);

    if (!extracted.content || extracted.content.length < 100) {
      console.log(`   ⚠️ Content too short, skipping`);
      return { success: false, error: 'Content too short' };
    }

    const aiOutput = await translateWithRetry({
      title: extracted.title,
      content: extracted.content,
      toc: extracted.toc,
    });

    console.log(`   📝 Category: ${aiOutput.category_slug}`);
    console.log(`   🏷️ Tags: ${aiOutput.tags.join(', ')}`);

    console.log(`   🧮 Generating embedding...`);
    const embedding = await generateEmbedding(aiOutput.excerpt);
    const vectorString = vectorToString(embedding);

    const slug = generateSlug(aiOutput.title_vi);

    console.log(`   💾 Saving to database...`);
    const newArticle = await prisma.article.create({
      data: {
        slug: slug,
        title: aiOutput.title_vi,
        excerpt: aiOutput.excerpt,
        content: aiOutput.content_vi,
        thumbnail: extracted.thumbnail,
        sourceUrl: sourceUrl,
        tags: aiOutput.tags, 
        categories: {
          connect: {
             slug: aiOutput.category_slug
          }
        },
        stats: {
          create: {
            views: 0,
            comments: 0,
            likes: 0,
            unlikes: 0
          }
        }
      } as any,
      select: { id: true }
    });

    await (prisma as any).$executeRaw`
      UPDATE "Article"
      SET embedding = ${vectorString}::vector
      WHERE id = ${newArticle.id}
    `;

    console.log(`   ✅ Saved: ${slug} (ID: ${newArticle.id})`);
    return { success: true, slug };

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    if (errorMessage.includes('Record to connect not found')) {
       console.log(`   ⚠️ Category '${'unknown'}' not found, saving without category...`);
    }
    console.log(`   ❌ Error: ${errorMessage}`);
    return { success: false, error: errorMessage };
  }
}

// =============================================
// PHASE 1: BÒ KHẮP NƠI + CHECK BÀI VIẾT
// =============================================
export async function collectNewLinks(startUrl: string, maxPages: number = 100): Promise<string[]> {
  console.log('═══════════════════════════════════════════');
  console.log('📡 PHASE 1: BÒ + TÌM BÀI VIẾT MỚI (CONCURRENT)');
  console.log('═══════════════════════════════════════════');
  console.log(`🌐 Start URL: ${startUrl}`);
  console.log(`📊 Giới hạn scan: ${maxPages} trang`);
  console.log(`🚀 Concurrency: ${CONCURRENT_CRAWL_LIMIT}\n`);

  const { browser, context } = await createBrowser();
  const limit = pLimit(CONCURRENT_CRAWL_LIMIT);

  const visited = new Set<string>();
  const queue: string[] = [startUrl];
  const articleUrls: string[] = [];

  let scannedCount = 0;
  let isArticleCount = 0;
  let notArticleCount = 0;
  let existsInDbCount = 0;

  const processUrl = async (url: string) => {
    const normalizedUrl = url.replace(/\/+$/, '');
    if (visited.has(normalizedUrl) || visited.size >= maxPages) {
      return;
    }
    
    if (visited.size >= maxPages) {
        return;
    }

    visited.add(normalizedUrl);
    scannedCount++;
    console.log(`🔍 [${scannedCount}/${maxPages}] ${normalizedUrl}`);

    try {
      const html = await fetchHtmlWithContext(context, normalizedUrl);
      const foundLinks = extractAllLinks(html, normalizedUrl);

      for (const link of foundLinks) {
        const normalizedLink = link.replace(/\/+$/, '');
        if (!visited.has(normalizedLink)) {
          queue.push(normalizedLink);
        }
      }

      const articleCheck = checkIsArticle(html, normalizedUrl);
      if (!articleCheck.isArticle) {
        notArticleCount++;
        console.log(`   📄 Không phải bài viết (${articleCheck.reason})`);
        return;
      }

      isArticleCount++;
      const existsInDb = await articleExists(normalizedUrl);
      if (existsInDb) {
        existsInDbCount++;
        console.log(`   📰 Bài viết - ĐÃ CÓ trong DB`);
      } else {
        articleUrls.push(normalizedUrl);
        console.log(`   ✅ Bài viết MỚI: "${articleCheck.title?.substring(0, 50)}..."`);
      }
    } catch (err) {
      console.log(`   ⚠️ Error processing ${normalizedUrl}: ${err instanceof Error ? err.message : err}\n`);
    }
  };

  try {
    const activePromises: Promise<void>[] = [];
    while (queue.length > 0 && visited.size < maxPages) {
        const batch = queue.splice(0, CONCURRENT_CRAWL_LIMIT * 2); 
        for (const url of batch) {
            activePromises.push(limit(() => processUrl(url)));
        }
        await Promise.all(activePromises);
        activePromises.length = 0; 
    }
  } finally {
    await browser.close();
  }

  console.log('═══════════════════════════════════════════');
  console.log('📊 PHASE 1 COMPLETE');
  console.log('═══════════════════════════════════════════');
  console.log(`🔍 Total pages scanned: ${scannedCount}`);
  console.log(`📰 Is Article: ${isArticleCount}`);
  console.log(`📄 Not Article: ${notArticleCount}`);
  console.log(`⏭️ Already in DB: ${existsInDbCount}`);
  console.log(`✅ NEW ARTICLES to crawl: ${articleUrls.length}`);
  console.log(`📋 Queue remaining: ${queue.length}`);
  console.log('═══════════════════════════════════════════\n');
  
  return articleUrls;
}

// =============================================
// PHASE 2: XỬ LÝ TỪNG URL (AI + SAVE DB)
// =============================================
export async function processNewUrls(urls: string[]): Promise<{
  success: number;
  skipped: number;
  errors: number;
  results: { url: string; status: string; slug?: string; error?: string }[];
}> {
  console.log('═══════════════════════════════════════════');
  console.log('🤖 PHASE 2: XỬ LÝ VỚI AI (CONCURRENT)');
  console.log('═══════════════════════════════════════════');
  console.log(`📊 URLs mới cần xử lý: ${urls.length}`);
  console.log(`🚀 Concurrency: ${CONCURRENT_AI_LIMIT}\n`);

  if (urls.length === 0) {
    console.log('✅ Không có URL mới nào cần xử lý!\n');
    return { success: 0, skipped: 0, errors: 0, results: [] };
  }

  const { browser, context } = await createBrowser();
  const limit = pLimit(CONCURRENT_AI_LIMIT);

  const results: { url: string; status: string; slug?: string; error?: string }[] = [];
  let successCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  const processSingleUrl = async (url: string, index: number) => {
    console.log(`\n📖 [${index + 1}/${urls.length}] Processing: ${url}`);
    try {
      const alreadyExists = await articleExists(url);
      if (alreadyExists) {
        skippedCount++;
        console.log(`   ⏭️ Đã có trong DB, skip`);
        results.push({ url, status: 'skipped', error: 'Already exists' });
        return;
      }

      const html = await fetchHtmlWithContext(context, url);
      const extracted = extractArticle(html, url);
      console.log(`   📰 Title: ${extracted.title}`);

      if (!extracted.content || extracted.content.length < 100) {
        console.log(`   ⚠️ Content too short, skip`);
        errorCount++;
        results.push({ url, status: 'error', error: 'Content too short' });
        return;
      }

      console.log(`   🤖 Calling AI...`);
      const aiOutput = await translateWithRetry({
        title: extracted.title,
        content: extracted.content,
        toc: extracted.toc,
      });

      console.log(`   📝 Category: ${aiOutput.category_slug}`);
      console.log(`   🏷️ Tags: ${aiOutput.tags.join(', ')}`);

      console.log(`   🧮 Generating embedding...`);
      const embedding = await generateEmbedding(aiOutput.excerpt);
      const vectorString = vectorToString(embedding);

      const slug = generateSlug(aiOutput.title_vi);

      console.log(`   💾 Saving to database...`);
      const newArticle = await prisma.article.create({
        data: {
          slug,
          title: aiOutput.title_vi,
          excerpt: aiOutput.excerpt,
          content: aiOutput.content_vi,
          thumbnail: extracted.thumbnail,
          sourceUrl: url,
          tags: aiOutput.tags,
          toc: aiOutput.toc_vi,
          categories: {
            connect: { slug: aiOutput.category_slug }
          },
          stats: {
            create: { views: 0, comments: 0, likes: 0, unlikes: 0 }
          }
        },
        select: { id: true, slug: true }
      });

      await (prisma as any).$executeRaw`
        UPDATE "Article"
        SET embedding = ${vectorString}::vector
        WHERE id = ${newArticle.id}
      `;

      successCount++;
      results.push({ url, status: 'success', slug: newArticle.slug });
      console.log(`   ✅ Saved: ${newArticle.slug}`);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      errorCount++;
      results.push({ url, status: 'error', error: errMsg });
      console.log(`   ❌ Error: ${errMsg}`);
    }
  };

  try {
    const promises = urls.map((url, index) => limit(() => processSingleUrl(url, index)));
    await Promise.all(promises);
  } finally {
    await browser.close();
  }

  console.log('\n═══════════════════════════════════════════');
  console.log('📊 PHASE 2 COMPLETE');
  console.log('═══════════════════════════════════════════');
  console.log(`✅ Success: ${successCount}`);
  console.log(`⏭️ Skipped (đã có DB): ${skippedCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log(`📊 Total processed: ${urls.length}`);
  console.log('═══════════════════════════════════════════\n');

  return { success: successCount, skipped: skippedCount, errors: errorCount, results };
}


// =============================================
// MAIN CRAWLER: GỌI CẢ 2 PHASE
// =============================================
export async function crawlWebsiteBFS(startUrl: string, maxPages: number = 100) {
  console.log('🚀 ═══════════════════════════════════════════');
  console.log('🚀 CRAWLER BẮT ĐẦU');
  console.log('🚀 ═══════════════════════════════════════════');
  console.log(`🌐 Target: ${startUrl}`);
  console.log(`📊 Max scan pages: ${maxPages}\n`);

  const startTime = Date.now();

  // PHASE 1: Thu thập links MỚI (đã check DB)
  const newUrls = await collectNewLinks(startUrl, maxPages);

  if (newUrls.length === 0) {
    console.log('✅ Tất cả URLs đã có trong DB, không cần crawl thêm!');
    return {
      startUrl,
      crawledAt: new Date().toISOString(),
      stats: { scanned: 0, newFound: 0, success: 0, errors: 0 },
      results: [],
    };
  }

  console.log(`📋 Tìm thấy ${newUrls.length} URLs mới cần crawl\n`);

  // PHASE 2: Xử lý với AI (chỉ URLs mới)
  const { success, skipped, errors, results } = await processNewUrls(newUrls);

  const duration = Math.round((Date.now() - startTime) / 1000);

  console.log('═══════════════════════════════════════════');
  console.log('🏁 CRAWLER HOÀN TẤT');
  console.log('═══════════════════════════════════════════');
  console.log(`⏱️ Duration: ${Math.floor(duration / 60)}m ${duration % 60}s`);
  console.log(`📊 New URLs found: ${newUrls.length}`);
  console.log(`✅ Success: ${success}`);
  console.log(`⏭️ Skipped: ${skipped}`);
  console.log(`❌ Errors: ${errors}`);
  console.log('═══════════════════════════════════════════\n');

  return {
    startUrl,
    crawledAt: new Date().toISOString(),
    duration: `${Math.floor(duration / 60)}m ${duration % 60}s`,
    stats: { newFound: newUrls.length, success, skipped, errors },
    results,
  };
}

// ===== CRAWL SINGLE URL =====
export async function crawlSingleUrl(url: string) {
  console.log('🚀 Crawling single URL:', url);

  const { browser, context } = await createBrowser();

  try {
    const normalizedUrl = normalizeUrl(url);
    const html = await fetchHtmlWithContext(context, normalizedUrl);
    const result = await processAndSaveArticle(html, normalizedUrl);

    return result;
  } finally {
    await browser.close();
  }
}

// ===== CLI ENTRY =====
async function main() {
  const inputUrl = 'https://www.coindesk.com/markets/2026/01/17/a-new-crypto-project-with-cz-as-advisor-sees-usd2-billion-in-volume-surge-on-airdrop-hype';
  const mode = 'bfs';
  const maxPages = 1000;

  if (!inputUrl) {
    console.error('❌ Missing URL');
    console.log('Usage:');
    console.log('  npx ts-node lib/crawl.ts <URL> bfs [maxPages]  - BFS crawl entire site');
    console.log('  npx ts-node lib/crawl.ts <URL> single          - Crawl single article');
    console.log('\nExamples:');
    console.log('  npx ts-node lib/crawl.ts https://coinminutes.com bfs 100');
    console.log('  npx ts-node lib/crawl.ts https://coinminutes.com/article.html single');
    process.exit(1);
  }

  try {
    const url = normalizeUrl(inputUrl);

    if (mode === 'bfs') {
      await crawlWebsiteBFS(url, maxPages);
    } else {
      const result = await crawlSingleUrl(url);
      console.log('\nResult:', result);
    }

  } catch (error) {
    console.error('❌ Fatal Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}
