// scripts/publish-articles.ts
/**
 * Publish crawled articles: AI rewrite + insert into Post table
 * 
 * Usage:
 *   npm run publish              # Publish all pending articles
 *   npm run publish -- --limit 5 # Publish max 5 articles
 */

import { publishPendingArticles } from '../lib/publisher/articlePublisher';
import { getCrawlStats } from '../lib/crawler/crawlRepository';

async function main() {
  const args = process.argv.slice(2);
  
  let limit = 10;
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--limit' && args[i + 1]) {
      limit = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--help') {
      console.log(`
Usage: npm run publish [options]

Options:
  --limit <number>   Max articles to publish (default: 10)
  --help             Show this help

Process:
  1. Get pending articles from CrawlArticle
  2. Call AI to rewrite each article
  3. Map to Category (auto-create if needed)
  4. Generate unique slug
  5. Insert into Post table
  6. Mark CrawlArticle as processed
      `);
      process.exit(0);
    }
  }

  console.log(`
╔════════════════════════════════════════════╗
║   PUBLISH ARTICLES                        ║
╚════════════════════════════════════════════╝

Max articles: ${limit}
  `);

  // Show stats before
  console.log('\n[Before] Crawl statistics:');
  const statsBefore = await getCrawlStats();
  console.log(JSON.stringify(statsBefore, null, 2));

  // Publish
  const publishedCount = await publishPendingArticles(limit);

  // Show stats after
  console.log('\n[After] Crawl statistics:');
  const statsAfter = await getCrawlStats();
  console.log(JSON.stringify(statsAfter, null, 2));

  console.log(`
╔════════════════════════════════════════════╗
║   PUBLISH COMPLETE                        ║
╚════════════════════════════════════════════╝

✓ Published: ${publishedCount} articles
  `);
}

main().catch(console.error);
