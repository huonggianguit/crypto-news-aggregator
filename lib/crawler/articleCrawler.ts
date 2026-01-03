// lib/crawler/articleCrawler.ts
import { chromium } from 'playwright';
import crypto from 'crypto';

export interface CrawledArticle {
  sourceUrl: string;
  title: string;
  content: string;
  author?: string;
  publishedDate?: Date;
  source: string;
  mainImage?: string;
  description?: string;
  tags?: string[];
  checksum: string;
}

/**
 * Base crawler interface
 */
export interface ArticleCrawler {
  source: string;
  fetchArticle(url: string): Promise<CrawledArticle | null>;
  isValidUrl(url: string): boolean;
}

/**
 * Generate checksum for content
 */
export function generateChecksum(content: string): string {
  return crypto.createHash('sha256').update(content.trim()).digest('hex');
}

/**
 * Fetch HTML from URL using Playwright (renders JavaScript)
 */
export async function fetchHtmlWithPlaywright(url: string): Promise<string> {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    const html = await page.content();
    return html;
  } finally {
    await browser.close();
  }
}

/**
 * VnExpress crawler using Playwright
 */
export class VnExpressCrawler implements ArticleCrawler {
  source = 'vnexpress';

  isValidUrl(url: string): boolean {
    return url.includes('vnexpress.net');
  }

  async fetchArticle(url: string): Promise<CrawledArticle | null> {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    try {
      console.log(`[VnExpress] Loading page: ${url}`);
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      
      // Wait for content to load
      await page.waitForSelector('h1.title-detail, h1', { timeout: 10000 }).catch(() => {});

      // Extract data using page.evaluate
      const data = await page.evaluate(() => {
        const titleEl = document.querySelector('h1.title-detail') || document.querySelector('h1');
        const title = titleEl?.textContent?.trim() || '';
        
        const descEl = document.querySelector('p.description');
        const description = descEl?.textContent?.trim() || '';
        
        const authorEl = document.querySelector('.author_mail');
        const author = authorEl?.textContent?.trim() || undefined;
        
        const imgEl = document.querySelector('.fig-picture img') || document.querySelector('.content_detail img');
        const mainImage = imgEl?.getAttribute('src') || imgEl?.getAttribute('data-src') || undefined;
        
        // Content
        const contentEl = document.querySelector('.fck_detail');
        const contentHtml = contentEl?.innerHTML || '';
        
        // Date
        const dateEl = document.querySelector('span.date');
        const dateStr = dateEl?.textContent?.trim() || '';
        
        // Tags
        const tags: string[] = [];
        document.querySelectorAll('ul.tags li a').forEach(el => {
          const tag = el.textContent?.trim();
          if (tag) tags.push(tag);
        });
        
        return { title, description, author, mainImage, contentHtml, dateStr, tags };
      });

      if (!data.title) {
        console.log(`[VnExpress] No title found for: ${url}`);
        await browser.close();
        return null;
      }

      // Parse date
      let publishedDate: Date | undefined;
      if (data.dateStr) {
        publishedDate = new Date(data.dateStr);
        if (isNaN(publishedDate.getTime())) {
          publishedDate = undefined;
        }
      }

      // Check if related to crypto
      const fullText = `${data.title} ${data.description} ${data.contentHtml}`.toLowerCase();
      const cryptoKeywords = ['bitcoin', 'btc', 'ethereum', 'eth', 'crypto', 'blockchain', 'tiền mã hóa', 'tiền ảo', 'tiền điện tử', 'defi', 'nft', 'altcoin', 'binance', 'coinbase', 'solana', 'xrp', 'dogecoin'];
      const isCryptoRelated = cryptoKeywords.some(kw => fullText.includes(kw));

      if (!isCryptoRelated) {
        console.log(`[VnExpress] Skipping non-crypto article: ${data.title}`);
        await browser.close();
        return null;
      }

      const checksum = generateChecksum(data.contentHtml);

      console.log(`[VnExpress] ✓ Extracted: ${data.title}`);
      
      await browser.close();
      
      return {
        sourceUrl: url,
        title: data.title,
        content: data.contentHtml,
        author: data.author,
        publishedDate,
        source: this.source,
        mainImage: data.mainImage,
        description: data.description,
        tags: data.tags.length > 0 ? data.tags : undefined,
        checksum,
      };
    } catch (error) {
      console.error(`[VnExpress] Error crawling ${url}:`, error);
      await browser.close();
      return null;
    }
  }
}

/**
 * Tạp chí Bitcoin (CoinPhoton) crawler using Playwright
 */
export class TapChiBitcoinCrawler implements ArticleCrawler {
  source = 'coinphoton';

  isValidUrl(url: string): boolean {
    return url.includes('coinphoton.com') || url.includes('tapchibitcoin');
  }

  async fetchArticle(url: string): Promise<CrawledArticle | null> {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    try {
      console.log(`[CoinPhoton] Loading page: ${url}`);
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      
      // Wait for content to load
      await page.waitForSelector('h1, article', { timeout: 10000 }).catch(() => {});

      // Extract data using page.evaluate
      const data = await page.evaluate(() => {
        const titleEl = document.querySelector('h1.entry-title') || document.querySelector('h1');
        const title = titleEl?.textContent?.trim() || '';
        
        const descEl = document.querySelector('.excerpt, .entry-excerpt, meta[name="description"]');
        const description = descEl?.textContent?.trim() || descEl?.getAttribute('content') || '';
        
        const authorEl = document.querySelector('.author-name, .entry-author, [rel="author"]');
        const author = authorEl?.textContent?.trim() || undefined;
        
        const imgEl = document.querySelector('.featured-image img, .entry-content img, article img');
        const mainImage = imgEl?.getAttribute('src') || imgEl?.getAttribute('data-src') || undefined;
        
        // Content
        const contentEl = document.querySelector('.entry-content, .post-content, article .content');
        const contentHtml = contentEl?.innerHTML || '';
        
        // Date
        const dateEl = document.querySelector('time, .published-date, .entry-date');
        const dateStr = dateEl?.getAttribute('datetime') || dateEl?.textContent?.trim() || '';
        
        // Tags
        const tags: string[] = [];
        document.querySelectorAll('.post-tags a, .entry-tags a, .tag-links a').forEach(el => {
          const tag = el.textContent?.trim();
          if (tag) tags.push(tag);
        });
        
        return { title, description, author, mainImage, contentHtml, dateStr, tags };
      });

      if (!data.title) {
        console.log(`[CoinPhoton] No title found for: ${url}`);
        await browser.close();
        return null;
      }

      // Parse date
      let publishedDate: Date | undefined;
      if (data.dateStr) {
        publishedDate = new Date(data.dateStr);
        if (isNaN(publishedDate.getTime())) {
          publishedDate = undefined;
        }
      }

      // TapChiBitcoin is already crypto-focused, but still check
      const fullText = `${data.title} ${data.description} ${data.contentHtml}`.toLowerCase();
      const cryptoKeywords = ['bitcoin', 'btc', 'ethereum', 'eth', 'crypto', 'blockchain', 'tiền mã hóa', 'tiền ảo', 'tiền điện tử', 'defi', 'nft', 'altcoin', 'binance', 'coinbase', 'solana', 'xrp', 'dogecoin'];
      const isCryptoRelated = cryptoKeywords.some(kw => fullText.includes(kw));

      if (!isCryptoRelated) {
        console.log(`[CoinPhoton] Skipping non-crypto article: ${data.title}`);
        await browser.close();
        return null;
      }

      const checksum = generateChecksum(data.contentHtml);

      console.log(`[CoinPhoton] ✓ Extracted: ${data.title}`);
      
      await browser.close();
      
      return {
        sourceUrl: url,
        title: data.title,
        content: data.contentHtml,
        author: data.author,
        publishedDate,
        source: this.source,
        mainImage: data.mainImage,
        description: data.description,
        tags: data.tags.length > 0 ? data.tags : undefined,
        checksum,
      };
    } catch (error) {
      console.error(`[CoinPhoton] Error crawling ${url}:`, error);
      await browser.close();
      return null;
    }
  }
}

/**
 * Tuổi Trẻ crawler using Playwright
 */
export class TuoiTreCrawler implements ArticleCrawler {
  source = 'tuoitre';

  isValidUrl(url: string): boolean {
    return url.includes('tuoitre.vn');
  }

  async fetchArticle(url: string): Promise<CrawledArticle | null> {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    try {
      console.log(`[TuoiTre] Loading page: ${url}`);
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      
      // Wait for content
      await page.waitForSelector('h1.article-title, h1.detail-title, h1', { timeout: 10000 }).catch(() => {});

      const data = await page.evaluate(() => {
        const titleEl = document.querySelector('h1.article-title') || document.querySelector('h1.detail-title') || document.querySelector('h1');
        const title = titleEl?.textContent?.trim() || '';
        
        const descEl = document.querySelector('h2.detail-sapo');
        const description = descEl?.textContent?.trim() || '';
        
        const authorEl = document.querySelector('.author-info .author-name');
        const author = authorEl?.textContent?.trim() || undefined;
        
        const imgEl = document.querySelector('.detail-content img') || document.querySelector('.VCSortableInPreviewMode img');
        const mainImage = imgEl?.getAttribute('src') || imgEl?.getAttribute('data-src') || undefined;
        
        const contentEl = document.querySelector('#main-detail-content') || document.querySelector('.detail-content');
        const contentHtml = contentEl?.innerHTML || '';
        
        const dateEl = document.querySelector('time');
        const dateStr = dateEl?.getAttribute('datetime') || document.querySelector('.date-time')?.textContent?.trim() || '';
        
        const tags: string[] = [];
        document.querySelectorAll('.detail-tag a').forEach(el => {
          const tag = el.textContent?.trim();
          if (tag) tags.push(tag);
        });
        
        return { title, description, author, mainImage, contentHtml, dateStr, tags };
      });

      if (!data.title) {
        console.log(`[TuoiTre] No title found for: ${url}`);
        await browser.close();
        return null;
      }

      let publishedDate: Date | undefined;
      if (data.dateStr) {
        publishedDate = new Date(data.dateStr);
        if (isNaN(publishedDate.getTime())) {
          publishedDate = undefined;
        }
      }

      const fullText = `${data.title} ${data.description} ${data.contentHtml}`.toLowerCase();
      const cryptoKeywords = ['bitcoin', 'btc', 'ethereum', 'eth', 'crypto', 'blockchain', 'tiền mã hóa', 'tiền ảo', 'tiền điện tử', 'defi', 'nft', 'altcoin', 'binance', 'coinbase', 'solana', 'xrp', 'dogecoin'];
      const isCryptoRelated = cryptoKeywords.some(kw => fullText.includes(kw));

      if (!isCryptoRelated) {
        console.log(`[TuoiTre] Skipping non-crypto article: ${data.title}`);
        await browser.close();
        return null;
      }

      const checksum = generateChecksum(data.contentHtml);
      
      console.log(`[TuoiTre] ✓ Extracted: ${data.title}`);
      
      await browser.close();

      return {
        sourceUrl: url,
        title: data.title,
        content: data.contentHtml,
        author: data.author,
        publishedDate,
        source: this.source,
        mainImage: data.mainImage,
        description: data.description,
        tags: data.tags.length > 0 ? data.tags : undefined,
        checksum,
      };
    } catch (error) {
      console.error(`[TuoiTre] Error crawling ${url}:`, error);
      await browser.close();
      return null;
    }
  }
}



/**
 * Crawler factory - auto detect source (Vietnamese sources only)
 */
export function getCrawler(url: string): ArticleCrawler | null {
  const crawlers: ArticleCrawler[] = [
    new VnExpressCrawler(),
    new TuoiTreCrawler(),
    new TapChiBitcoinCrawler(),
  ];

  for (const crawler of crawlers) {
    if (crawler.isValidUrl(url)) {
      return crawler;
    }
  }

  return null;
}

/**
 * Batch crawl multiple URLs with 6 concurrent tabs
 * Much faster than opening/closing browser for each URL
 */
export async function batchCrawlArticles(
  urls: string[], 
  concurrency = 6
): Promise<(CrawledArticle | null)[]> {
  const results: (CrawledArticle | null)[] = [];
  
  console.log(`[Batch Crawl] Starting batch crawl for ${urls.length} URLs (concurrency: ${concurrency})`);
  
  for (let i = 0; i < urls.length; i += concurrency) {
    const batch = urls.slice(i, i + concurrency);
    console.log(`\n[Batch Crawl] Processing batch ${Math.floor(i/concurrency) + 1}/${Math.ceil(urls.length/concurrency)} (${batch.length} URLs)`);
    
    const browser = await chromium.launch({ headless: true });
    
    try {
      const crawlPromises = batch.map(async (url) => {
        const crawler = getCrawler(url);
        if (!crawler) return null;
        
        const page = await browser.newPage();
        
        try {
          await page.goto(url, { 
            waitUntil: 'domcontentloaded',
            timeout: 45000 
          });
          
          await page.waitForSelector('h1, article', { timeout: 15000 }).catch(() => {});

          const data = await page.evaluate(() => {
            const titleEl = document.querySelector('h1.title-detail, h1.article-title, h1.entry-title, h1');
            const title = titleEl?.textContent?.trim() || '';
            
            const descEl = document.querySelector('p.description, h2.detail-sapo, .excerpt, meta[name="description"]');
            const description = descEl?.textContent?.trim() || descEl?.getAttribute?.('content') || '';
            
            const authorEl = document.querySelector('.author_mail, .author-name, [rel="author"]');
            const author = authorEl?.textContent?.trim() || undefined;
            
            const imgEl = document.querySelector('.fig-picture img, .detail-content img, .featured-image img, article img');
            const mainImage = imgEl?.getAttribute('src') || imgEl?.getAttribute('data-src') || undefined;
            
            const contentEl = document.querySelector('.fck_detail, #main-detail-content, .entry-content, .post-content, article .content');
            const contentHtml = contentEl?.innerHTML || '';
            
            const dateEl = document.querySelector('span.date, time, .published-date, .entry-date');
            const dateStr = dateEl?.getAttribute?.('datetime') || dateEl?.textContent?.trim() || '';
            
            const tags: string[] = [];
            document.querySelectorAll('ul.tags li a, .detail-tag a, .post-tags a').forEach(el => {
              const tag = el.textContent?.trim();
              if (tag) tags.push(tag);
            });
            
            return { title, description, author, mainImage, contentHtml, dateStr, tags };
          });

          await page.close();

          if (!data.title) return null;

          let publishedDate: Date | undefined;
          if (data.dateStr) {
            try {
              publishedDate = new Date(data.dateStr);
              if (isNaN(publishedDate.getTime())) publishedDate = undefined;
            } catch (e) {
              publishedDate = undefined;
            }
          }

          const fullText = `${data.title} ${data.description} ${data.contentHtml}`.toLowerCase();
          const cryptoKeywords = ['bitcoin', 'btc', 'ethereum', 'eth', 'crypto', 'blockchain', 'tiền mã hóa', 'tiền ảo', 'tiền điện tử', 'defi', 'nft', 'altcoin', 'binance', 'coinbase', 'solana', 'xrp', 'dogecoin'];
          const isCryptoRelated = cryptoKeywords.some(kw => fullText.includes(kw));

          if (!isCryptoRelated) return null;

          const checksum = generateChecksum(data.contentHtml);
          console.log(`[${crawler.source}] ✓ Extracted: ${data.title}`);

          return {
            sourceUrl: url,
            title: data.title,
            content: data.contentHtml,
            author: data.author,
            publishedDate,
            source: crawler.source,
            mainImage: data.mainImage,
            description: data.description,
            tags: data.tags?.length > 0 ? data.tags : undefined,
            checksum,
          };
        } catch (error) {
          console.error(`[Crawl] Error: ${error}`);
          await page.close().catch(() => {});
          return null;
        }
      });
      
      const batchResults = await Promise.all(crawlPromises);
      results.push(...batchResults);
      
    } finally {
      await browser.close();
    }
    
    if (i + concurrency < urls.length) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  const successCount = results.filter(r => r !== null).length;
  console.log(`\n[Batch Crawl] ✓ Complete: ${successCount}/${urls.length} articles extracted`);
  
  return results;
}
