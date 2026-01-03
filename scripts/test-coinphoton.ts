// scripts/test-coinphoton.ts
/**
 * Test CoinPhoton crawler only
 */

import { searchTapChiBitcoin } from '../lib/crawler/searchCrawler';
import { batchCrawlArticles } from '../lib/crawler/articleCrawler';
import { saveCrawledArticle } from '../lib/crawler/crawlRepository';

async function main() {
  console.log('Testing CoinPhoton crawler...\n');
  
  // Step 1: Get URLs from CoinPhoton
  const results = await searchTapChiBitcoin('bitcoin', 10);
  
  console.log(`\nFound ${results.length} articles from CoinPhoton`);
  
  if (results.length === 0) {
    console.log('No results found. Exiting.');
    process.exit(0);
  }
  
  // Print found URLs
  results.forEach((r, i) => {
    console.log(`${i + 1}. ${r.title}`);
    console.log(`   ${r.url}\n`);
  });
  
  // Step 2: Crawl articles
  console.log('\nCrawling articles with 6 concurrent tabs...\n');
  const urls = results.map(r => r.url);
  const articles = await batchCrawlArticles(urls, 6);
  
  // Step 3: Save to database
  let savedCount = 0;
  for (const article of articles) {
    if (article) {
      try {
        await saveCrawledArticle(article);
        console.log(`[Saved] ✓ ${article.title}`);
        savedCount++;
      } catch (error) {
        console.error(`[Error] ${article.title}:`, error);
      }
    }
  }
  
  console.log(`\n✓ Complete: ${savedCount}/${articles.length} articles saved`);
}

main().catch(console.error);
