// lib/crawler/smartCrawler.ts
/**
 * Smart Crawler với Anti-Detection và Retry Logic
 * Sử dụng browserConfig để chống phát hiện bot
 */

import { Browser, Page } from 'playwright';
import * as cheerio from 'cheerio';
import {
  createStealthBrowser,
  createStealthPage,
  navigateHumanLike,
  closeBrowserSafely,
  retryWithBackoff,
} from './browserConfig';

export interface SelectorConfig {
  title: string;           // CSS selector cho title
  content: string;         // CSS selector cho content
  author?: string;         // CSS selector cho author
  date?: string;           // CSS selector cho date
  mainImage?: string;      // CSS selector cho main image
  description?: string;    // CSS selector cho description
  tags?: string;           // CSS selector cho tags
}

export interface CrawlResult {
  sourceUrl: string;
  title: string;
  content: string;
  author?: string;
  publishedDate?: Date;
  mainImage?: string;
  description?: string;
  tags?: string[];
  html: string;           // Full HTML for backup
  checksum?: string;      // Content checksum for duplicate detection
}

/**
 * Main crawler function với anti-detection
 */
export async function fetchNews(
  sourceUrl: string,
  selectors: SelectorConfig,
  retries: number = 3
): Promise<CrawlResult | null> {
  return retryWithBackoff(
    async () => {
      const browser = await createStealthBrowser();
      
      try {
        const page = await createStealthPage(browser);
        
        // Navigate với human-like behavior
        console.log(`[SmartCrawler] Fetching: ${sourceUrl}`);
        await navigateHumanLike(page, sourceUrl);
        
        // Wait for content to load
        await page.waitForSelector(selectors.title, { timeout: 10000 }).catch(() => {
          console.log('[SmartCrawler] Title selector not found, continuing...');
        });
        
        // Extract data
        const result = await extractData(page, sourceUrl, selectors);
        
        await closeBrowserSafely(browser);
        return result;
      } catch (error) {
        await closeBrowserSafely(browser);
        throw error;
      }
    },
    retries,
    2000 // 2s base delay
  );
}

/**
 * Extract data from page using selectors
 */
async function extractData(
  page: Page,
  sourceUrl: string,
  selectors: SelectorConfig
): Promise<CrawlResult | null> {
  const html = await page.content();
  const $ = cheerio.load(html);
  
  // Extract title
  const title = $(selectors.title).first().text().trim();
  if (!title) {
    console.log('[SmartCrawler] No title found');
    return null;
  }
  
  // Extract content (remove unwanted elements)
  const contentEl = $(selectors.content).first();
  contentEl.find('script, style, iframe, .ads, .advertisement').remove();
  const content = contentEl.html()?.trim() || '';
  
  if (!content) {
    console.log('[SmartCrawler] No content found');
    return null;
  }
  
  // Extract optional fields
  const author = selectors.author ? $(selectors.author).first().text().trim() : undefined;
  const description = selectors.description ? $(selectors.description).first().text().trim() : undefined;
  
  // Extract main image
  let mainImage: string | undefined;
  if (selectors.mainImage) {
    const imgEl = $(selectors.mainImage).first();
    mainImage = imgEl.attr('src') || imgEl.attr('data-src');
    
    // Convert relative URL to absolute
    if (mainImage && !mainImage.startsWith('http')) {
      const url = new URL(sourceUrl);
      if (mainImage.startsWith('//')) {
        mainImage = `${url.protocol}${mainImage}`;
      } else if (mainImage.startsWith('/')) {
        mainImage = `${url.protocol}//${url.host}${mainImage}`;
      } else {
        mainImage = `${url.protocol}//${url.host}/${mainImage}`;
      }
    }
  }
  
  // Extract date
  let publishedDate: Date | undefined;
  if (selectors.date) {
    const dateStr = $(selectors.date).first().text().trim();
    if (dateStr) {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        publishedDate = date;
      }
    }
  }
  
  // Extract tags
  let tags: string[] | undefined;
  if (selectors.tags) {
    tags = [];
    $(selectors.tags).each((_: number, el: any) => {
      const tag = $(el).text().trim();
      if (tag) tags!.push(tag);
    });
    
    if (tags.length === 0) {
      tags = undefined;
    }
  }
  
  console.log(`[SmartCrawler] ✓ Extracted: ${title.substring(0, 60)}...`);
  
  return {
    sourceUrl,
    title,
    content,
    author,
    publishedDate,
    mainImage,
    description,
    tags,
    html,
  };
}

/**
 * Batch crawl multiple URLs với connection pooling
 */
export async function batchFetchNews(
  urls: { url: string; selectors: SelectorConfig }[],
  concurrency: number = 3
): Promise<(CrawlResult | null)[]> {
  const results: (CrawlResult | null)[] = [];
  const browser = await createStealthBrowser();
  
  try {
    // Process in batches
    for (let i = 0; i < urls.length; i += concurrency) {
      const batch = urls.slice(i, i + concurrency);
      
      const batchResults = await Promise.all(
        batch.map(async ({ url, selectors }) => {
          try {
            const page = await createStealthPage(browser);
            await navigateHumanLike(page, url);
            await page.waitForSelector(selectors.title, { timeout: 10000 }).catch(() => {});
            
            const result = await extractData(page, url, selectors);
            await page.close();
            
            return result;
          } catch (error) {
            console.error(`[SmartCrawler] Error crawling ${url}:`, error);
            return null;
          }
        })
      );
      
      results.push(...batchResults);
      
      // Delay between batches
      if (i + concurrency < urls.length) {
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      }
    }
  } finally {
    await closeBrowserSafely(browser);
  }
  
  return results;
}

/**
 * Convert relative image URLs to absolute
 */
export function normalizeImageUrl(imageUrl: string, baseUrl: string): string {
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }
  
  const url = new URL(baseUrl);
  
  if (imageUrl.startsWith('//')) {
    return `${url.protocol}${imageUrl}`;
  }
  
  if (imageUrl.startsWith('/')) {
    return `${url.protocol}//${url.host}${imageUrl}`;
  }
  
  return `${url.protocol}//${url.host}/${imageUrl}`;
}

/**
 * Check if content is crypto-related
 */
export function isCryptoRelated(text: string): boolean {
  const cryptoKeywords = [
    'bitcoin', 'btc', 'ethereum', 'eth', 'crypto', 'blockchain',
    'tiền mã hóa', 'tiền ảo', 'tiền điện tử', 'tiền kỹ thuật số',
    'defi', 'nft', 'altcoin', 'binance', 'coinbase',
    'solana', 'xrp', 'dogecoin', 'ada', 'cardano',
    'web3', 'metaverse', 'token', 'mining', 'wallet',
  ];
  
  const lowerText = text.toLowerCase();
  return cryptoKeywords.some(keyword => lowerText.includes(keyword));
}
