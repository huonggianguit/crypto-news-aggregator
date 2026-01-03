import cron from 'node-cron';
import * as searchCrawler from '@/lib/crawler/searchCrawler';
import { getCrawler } from '@/lib/crawler/articleCrawler';
import * as crawlRepository from '@/lib/crawler/crawlRepository';
import { publishPendingArticles } from '@/lib/publisher/articlePublisher';
import { prisma } from '@/lib/prisma';

// Default crypto-related keywords
const DEFAULT_KEYWORDS = [
  'bitcoin',
  'ethereum',
  'tiền mã hóa',
  'tiền điện tử',
  'blockchain',
  'crypto',
  'defi',
  'nft'
];

let isRunning = false;

/**
 * Crawl articles from all sources and save to CrawlArticle
 */
async function runCrawlTask() {
  if (isRunning) {
    console.log('[Scheduler] Crawl task already running, skipping...');
    return;
  }

  isRunning = true;
  const timestamp = new Date().toISOString();

  try {
    console.log(`\n╔════════════════════════════════════════════╗`);
    console.log(`║ [${timestamp}] AUTO CRAWL TASK  ║`);
    console.log(`╚════════════════════════════════════════════╝\n`);

    // Get stats before crawl
    const statsBefore = await crawlRepository.getCrawlStats();
    console.log('[Scheduler] [Before] Crawl statistics:', JSON.stringify(statsBefore, null, 2));

    // Crawl with keywords (max 5 per source to avoid rate limits)
    let totalCrawled = 0;
    
    for (const keyword of DEFAULT_KEYWORDS) {
      console.log(`\n[Scheduler] Searching keyword: "${keyword}"`);
      
      try {
        const results = await searchCrawler.searchAllSources([keyword], 5);
        
        if (results.length === 0) {
          console.log(`[Scheduler] No results for "${keyword}"`);
          continue;
        }

        console.log(`[Scheduler] Found ${results.length} articles for "${keyword}"`);

        // Crawl each result (dedup by URL + checksum)
        for (const result of results) {
          try {
            // Get appropriate crawler for this URL
            const crawler = getCrawler(result.url);
            if (!crawler) {
              console.error(`  ✗ No crawler found for ${result.url}`);
              continue;
            }
            
            // Fetch full article content
            const crawlData = await crawler.fetchArticle(result.url);
            
            if (crawlData) {
              // Save/upsert to CrawlArticle (dedup by checksum)
              try {
                // Check if this is new or duplicate
                const existing = await prisma.crawlArticle.findUnique({
                  where: { sourceUrl: crawlData.sourceUrl }
                });
                
                const savedArticle = await crawlRepository.saveCrawledArticle(crawlData);
                
                if (!existing) {
                  console.log(`  ✓ New: ${crawlData.title.substring(0, 60)}...`);
                  totalCrawled++;
                } else if (existing.checksum !== crawlData.checksum) {
                  console.log(`  🔄 Updated: ${crawlData.title.substring(0, 60)}...`);
                  totalCrawled++;
                } else {
                  console.log(`  ⊘ Duplicate: ${crawlData.title.substring(0, 60)}...`);
                }
              } catch (dbErr) {
                console.error(`  ✗ DB Error: ${(dbErr as Error).message}`);
              }
            }
          } catch (err) {
            console.error(`  ✗ Error crawling ${result.url}:`, (err as Error).message);
          }
        }

        // Small delay between keywords
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (err) {
        console.error(`[Scheduler] Error searching "${keyword}":`, (err as Error).message);
      }
    }

    // Get stats after crawl
    const statsAfter = await crawlRepository.getCrawlStats();
    console.log(`\n[Scheduler] [After] Crawl statistics:`, JSON.stringify(statsAfter, null, 2));
    console.log(`[Scheduler] ✓ Crawl task complete - ${totalCrawled} new articles added`);

    // Auto-publish pending articles (crawl + AI rewrite + post)
    console.log(`\n[Scheduler] Starting auto-publish of pending articles...\n`);
    await publishPendingArticles(10); // Publish up to 10 articles
    
    console.log(`\n[Scheduler] ✓ Full pipeline complete (crawl + rewrite + publish)`);

  } catch (error) {
    console.error('[Scheduler] Fatal error in crawl task:', error);
  } finally {
    isRunning = false;
  }
}

/**
 * Initialize scheduler (call once on app startup)
 */
export function initializeCrawlScheduler() {
  console.log('[Scheduler] Initializing crawl scheduler...');

  // Every 20 minutes: */20 * * * *
  const task = cron.schedule('*/20 * * * *', runCrawlTask);
  
  console.log('[Scheduler] ✓ Crawl scheduler initialized (runs every 20 minutes)');
  console.log('[Scheduler] Will NOT run immediately on startup - waiting for first cron trigger\n');

  return task;
}

/**
 * Get scheduler status (for debugging)
 */
export async function getSchedulerStatus() {
  const stats = await crawlRepository.getCrawlStats();
  return {
    isRunning,
    status: 'active',
    lastStats: stats,
    nextRun: 'Every 20 minutes',
  };
}

/**
 * Manually trigger crawl (for admin/API)
 */
export async function triggerManualCrawl() {
  return runCrawlTask();
}
