// scripts/auto-crawl-crypto.ts
/**
 * Automatically search and crawl crypto-related articles
 * 
 * Usage:
 *   npm run auto-crawl              # Use default keywords
 *   npm run auto-crawl -- --keyword "Bitcoin" --keyword "Ethereum"
 *   npm run auto-crawl -- --max 50  # Max 50 articles per keyword
 */

import { searchAllSources } from '../lib/crawler/searchCrawler';
import { batchCrawlArticles } from '../lib/crawler/articleCrawler';
import { saveCrawledArticle, getCrawlStats } from '../lib/crawler/crawlRepository';

// Default crypto keywords
const DEFAULT_KEYWORDS = [
  'bitcoin',
  'ethereum',
  'tiền mã hóa',
  'tiền điện tử',
  'blockchain',
  'crypto',
  'defi',
  'nft',
];

async function main() {
  const args = process.argv.slice(2);
  
  // Parse arguments
  let keywords = DEFAULT_KEYWORDS;
  let maxPerKeyword = 20;
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--keyword' && args[i + 1]) {
      if (keywords === DEFAULT_KEYWORDS) {
        keywords = [];
      }
      keywords.push(args[i + 1]);
      i++;
    } else if (args[i] === '--max' && args[i + 1]) {
      maxPerKeyword = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--help') {
      console.log(`
Usage: npm run auto-crawl [options]

Options:
  --keyword <word>   Add search keyword (can be used multiple times)
  --max <number>     Max articles per keyword (default: 20)
  --help             Show this help

Default keywords:
  ${DEFAULT_KEYWORDS.map(k => `  - "${k}"`).join('\n')}

Examples:
  npm run auto-crawl
  npm run auto-crawl -- --keyword "Bitcoin trading"
  npm run auto-crawl -- --max 50
  npm run auto-crawl -- --keyword "DeFi" --keyword "NFT" --max 30
      `);
      process.exit(0);
    }
  }

  console.log(`
╔════════════════════════════════════════════╗
║   AUTO CRAWL CRYPTO NEWS                  ║
╚════════════════════════════════════════════╝

Keywords: ${keywords.join(', ')}
Max per keyword: ${maxPerKeyword}
  `);

  // Step 1: Search for articles
  console.log('\n[Step 1] Searching for articles...\n');
  const searchResults = await searchAllSources(keywords, maxPerKeyword);
  
  if (searchResults.length === 0) {
    console.log('[Search] No results found. Exiting.');
    process.exit(0);
  }

  console.log(`\n[Step 2] Crawling ${searchResults.length} articles with 6 concurrent tabs...\n`);
  
  // Extract URLs
  const urls = searchResults.map(r => r.url);
  
  // Batch crawl with 6 tabs
  const articles = await batchCrawlArticles(urls, 6);
  
  // Save articles to database
  let successCount = 0;
  let skipCount = 0;

  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];
    if (article) {
      try {
        await saveCrawledArticle(article);
        console.log(`[Saved] ✓ ${article.title}`);
        successCount++;
      } catch (error) {
        console.error(`[Save Error] ${article.title}:`, error);
        skipCount++;
      }
    } else {
      skipCount++;
    }
  }

  console.log(`
╔════════════════════════════════════════════╗
║   CRAWL COMPLETE                          ║
╚════════════════════════════════════════════╝

✓ Saved:   ${successCount}
⊘ Skipped: ${skipCount}
  `);

  console.log('\n[Final Stats] Database statistics:');
  const stats = await getCrawlStats();
  console.log(JSON.stringify(stats, null, 2));
}

main().catch(console.error);
