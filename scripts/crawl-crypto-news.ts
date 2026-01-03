// scripts/crawl-crypto-news.ts
/**
 * Crawl crypto-related articles from VnExpress and Tuổi Trẻ
 * 
 * Usage:
 *   node scripts/crawl-crypto-news.js <url1> <url2> ...
 *   node scripts/crawl-crypto-news.js --help
 */

import { getCrawler } from '../lib/crawler/articleCrawler';
import { saveCrawledArticle, getCrawlStats } from '../lib/crawler/crawlRepository';

async function crawlArticle(url: string) {
  console.log(`\n[Crawl] Processing: ${url}`);
  
  const crawler = getCrawler(url);
  if (!crawler) {
    console.error(`[Crawl] No crawler found for URL: ${url}`);
    return;
  }

  const article = await crawler.fetchArticle(url);
  if (!article) {
    console.log(`[Crawl] Skipped: ${url}`);
    return;
  }

  await saveCrawledArticle(article);
  console.log(`[Crawl] ✓ Saved: ${article.title}`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help')) {
    console.log(`
Usage: node scripts/crawl-crypto-news.js <url1> <url2> ...

Example URLs:
  VnExpress: https://vnexpress.net/bitcoin-vuot-100000-usd-4536789.html
  Tuổi Trẻ: https://tuoitre.vn/ethereum-len-dinh-20231201.htm
  CoinDesk: https://www.coindesk.com/markets/bitcoin-analysis/
  CoinTelegraph: https://cointelegraph.com/news/crypto-market-update

Options:
  --help    Show this help message
  --stats   Show crawl statistics
    `);
    process.exit(0);
  }

  if (args.includes('--stats')) {
    console.log('\n[Stats] Crawl statistics:');
    const stats = await getCrawlStats();
    console.log(JSON.stringify(stats, null, 2));
    process.exit(0);
  }

  console.log(`[Crawl] Starting crawl for ${args.length} URL(s)...`);

  for (const url of args) {
    try {
      await crawlArticle(url);
    } catch (error) {
      console.error(`[Crawl] Failed for ${url}:`, error);
    }
  }

  console.log('\n[Crawl] Done!');
  console.log('\n[Stats] Final statistics:');
  const stats = await getCrawlStats();
  console.log(JSON.stringify(stats, null, 2));
}

main().catch(console.error);
