// lib/crawler/searchCrawler.ts
import { chromium } from 'playwright';

export interface SearchResult {
  title: string;
  url: string;
  snippet?: string;
  source: string;
}

/**
 * Search VnExpress for crypto-related articles
 */
export async function searchVnExpress(keyword: string, maxResults = 20): Promise<SearchResult[]> {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const results: SearchResult[] = [];

  try {
    const searchUrl = `https://timkiem.vnexpress.net/?q=${encodeURIComponent(keyword)}`;
    console.log(`[VnExpress Search] Searching for: ${keyword}`);
    
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForSelector('.item-news, article', { timeout: 15000 }).catch(() => {});

    const items = await page.evaluate(() => {
      const articles: SearchResult[] = [];
      
      // VnExpress search result selectors
      const elements = document.querySelectorAll('.item-news, article.item-news');
      
      elements.forEach(el => {
        const linkEl = el.querySelector('h3.title-news a, h2 a, h3 a');
        const url = linkEl?.getAttribute('href') || '';
        const title = linkEl?.textContent?.trim() || '';
        const snippetEl = el.querySelector('p.description, .description');
        const snippet = snippetEl?.textContent?.trim() || '';
        
        if (url && title) {
          articles.push({
            title,
            url: url.startsWith('http') ? url : `https://vnexpress.net${url}`,
            snippet,
            source: 'vnexpress'
          });
        }
      });
      
      return articles;
    });

    results.push(...items.slice(0, maxResults));
    console.log(`[VnExpress Search] Found ${results.length} results`);
    
  } catch (error) {
    console.error(`[VnExpress Search] Error:`, error);
  } finally {
    await browser.close();
  }

  return results;
}

/**
 * Search Tuổi Trẻ for crypto-related articles
 */
export async function searchTuoiTre(keyword: string, maxResults = 20): Promise<SearchResult[]> {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const results: SearchResult[] = [];

  try {
    const searchUrl = `https://tuoitre.vn/tim-kiem.htm?keywords=${encodeURIComponent(keyword)}`;
    console.log(`[TuoiTre Search] Searching for: ${keyword}`);
    
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForSelector('.box-category-item, .list-news-content li', { timeout: 15000 }).catch(() => {});

    const items = await page.evaluate(() => {
      const articles: SearchResult[] = [];
      
      const elements = document.querySelectorAll('.box-category-item, .list-news-content li');
      
      elements.forEach(el => {
        const linkEl = el.querySelector('a.box-category-link-title, h3 a, a');
        const url = linkEl?.getAttribute('href') || '';
        const title = linkEl?.textContent?.trim() || linkEl?.getAttribute('title') || '';
        const snippetEl = el.querySelector('.box-category-description, .sapo');
        const snippet = snippetEl?.textContent?.trim() || '';
        
        if (url && title) {
          articles.push({
            title,
            url: url.startsWith('http') ? url : `https://tuoitre.vn${url}`,
            snippet,
            source: 'tuoitre'
          });
        }
      });
      
      return articles;
    });

    results.push(...items.slice(0, maxResults));
    console.log(`[TuoiTre Search] Found ${results.length} results`);
    
  } catch (error) {
    console.error(`[TuoiTre Search] Error:`, error);
  } finally {
    await browser.close();
  }

  return results;
}

/**
 * Search Tạp chí Bitcoin (CoinPhoton) for crypto-related articles
 * Since it's a crypto-focused site, directly crawl category pages
 */
export async function searchTapChiBitcoin(keyword: string, maxResults = 20): Promise<SearchResult[]> {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const results: SearchResult[] = [];

  try {
    // Crawl directly from category pages (all content is crypto-related)
    const categoryUrls = [
      'https://coinphoton.com/kien-thuc-crypto',
      'https://coinphoton.com/tin-tuc-crypto',
      'https://coinphoton.com/phan-tich-crypto'
    ];
    
    console.log(`[CoinPhoton Search] Crawling category pages for latest articles...`);
    
    for (const categoryUrl of categoryUrls) {
      try {
        await page.goto(categoryUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
        // Wait longer for dynamic content
        await new Promise(resolve => setTimeout(resolve, 3000));

        const items = await page.evaluate(() => {
          const articles: any[] = [];
          
          // Get all links that look like article URLs
          const links = document.querySelectorAll('a[href]');
          
          links.forEach(link => {
            const url = link.getAttribute('href') || '';
            const title = link.textContent?.trim() || link.getAttribute('title') || '';
            
            // Filter for article URLs (exclude navigation, categories, etc)
            if (url && title && 
                url.includes('coinphoton.com') && 
                !url.includes('category') && 
                !url.includes('tag') && 
                !url.includes('author') &&
                !url.includes('#') &&
                !url.includes('?') &&
                title.length > 15 && // Meaningful titles
                !articles.some(a => a.url === url)) {
              articles.push({ title, url, snippet: '' });
            }
          });
          
          return articles;
        });

        items.forEach(item => {
          if (!results.some(r => r.url === item.url)) {
            results.push({
              title: item.title,
              url: item.url.startsWith('http') ? item.url : `https://coinphoton.com${item.url}`,
              snippet: item.snippet,
              source: 'coinphoton'
            });
          }
        });
        
        console.log(`[CoinPhoton] Extracted ${items.length} articles from ${categoryUrl}`);
        
        if (results.length >= maxResults) break;
        
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (err) {
        console.log(`[CoinPhoton] Error crawling ${categoryUrl}:`, err);
      }
    }

    console.log(`[CoinPhoton Search] Found ${results.length} results`);
    
  } catch (error) {
    console.error(`[CoinPhoton Search] Error:`, error);
  } finally {
    await browser.close();
  }

  return results;
}

/**
 * Search all sources for crypto keywords (Vietnamese sources only)
 */
export async function searchAllSources(keywords: string[], maxPerSource = 20): Promise<SearchResult[]> {
  const allResults: SearchResult[] = [];

  for (const keyword of keywords) {
    console.log(`\n[Search] Searching for keyword: "${keyword}"`);
    
    // Search VnExpress with retry
    try {
      const vnResults = await searchVnExpress(keyword, maxPerSource);
      allResults.push(...vnResults);
    } catch (error) {
      console.error(`[Search] VnExpress failed, retrying...`);
      await new Promise(resolve => setTimeout(resolve, 3000));
      try {
        const vnResults = await searchVnExpress(keyword, maxPerSource);
        allResults.push(...vnResults);
      } catch (retryError) {
        console.error(`[Search] VnExpress retry failed, skipping`);
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Search Tuoi Tre
    try {
      const ttResults = await searchTuoiTre(keyword, maxPerSource);
      allResults.push(...ttResults);
    } catch (error) {
      console.error(`[Search] TuoiTre failed, skipping`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Search Tạp chí Bitcoin
    try {
      const tcbResults = await searchTapChiBitcoin(keyword, maxPerSource);
      allResults.push(...tcbResults);
    } catch (error) {
      console.error(`[Search] TapChiBitcoin failed, skipping`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Deduplicate by URL
  const uniqueResults = Array.from(
    new Map(allResults.map(r => [r.url, r])).values()
  );

  console.log(`\n[Search] Total unique results: ${uniqueResults.length}`);
  return uniqueResults;
}

