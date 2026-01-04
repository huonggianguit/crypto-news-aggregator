// scripts/run-crawl.ts
/**
 * Master Crawl Script - Orchestration đầy đủ
 * Workflow: Search -> Crawl -> Check Duplicate -> AI Rewrite -> Save to DB
 * 
 * Usage:
 *   npm run crawl           # Chạy crawl với config mặc định
 *   npm run crawl -- --max 10 --skip-rewrite
 */

import { prisma } from '../lib/prisma';
import { fetchNews, isCryptoRelated } from '../lib/crawler/smartCrawler';
import { rewriteArticle, getAvailableProvider } from '../lib/ai/aiWriter';
import { generateChecksum } from '../lib/crawler/articleCrawler';

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const config = {
    maxArticles: 20,
    skipRewrite: false,
    skipDuplicateCheck: false,
    sources: [] as string[],
  };
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--max' && args[i + 1]) {
      config.maxArticles = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--skip-rewrite') {
      config.skipRewrite = true;
    } else if (args[i] === '--skip-duplicate') {
      config.skipDuplicateCheck = true;
    } else if (args[i] === '--source' && args[i + 1]) {
      config.sources.push(args[i + 1]);
      i++;
    }
  }
  
  return config;
}

/**
 * Lấy danh sách nguồn từ DB
 */
async function getActiveSources() {
  const sources = await prisma.source.findMany({
    where: { isActive: true },
    orderBy: { priority: 'desc' },
  });
  
  return sources;
}

/**
 * Log hệ thống
 */
async function logSystem(
  level: 'info' | 'warn' | 'error',
  module: string,
  action: string,
  message: string,
  details?: any
) {
  try {
    await prisma.systemLog.create({
      data: {
        level,
        module,
        action,
        message,
        details: details ? JSON.parse(JSON.stringify(details)) : undefined,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error('[Log] Failed to save system log:', error);
  }
}

/**
 * Kiểm tra trùng lặp
 */
async function checkDuplicate(sourceUrl: string, checksum: string) {
  // Check by URL
  const existingByUrl = await prisma.crawlArticle.findUnique({
    where: { sourceUrl },
  });
  
  if (existingByUrl) {
    if (existingByUrl.checksum === checksum) {
      return { isDuplicate: true, reason: 'same_content' };
    } else {
      return { isDuplicate: true, reason: 'url_exists_different_content' };
    }
  }
  
  // Check by checksum (content duplicate)
  const existingByChecksum = await prisma.crawlArticle.findFirst({
    where: { checksum },
  });
  
  if (existingByChecksum) {
    return { isDuplicate: true, reason: 'duplicate_content' };
  }
  
  return { isDuplicate: false };
}

/**
 * Lưu bài crawl vào CrawlArticle
 */
async function saveCrawledArticle(crawlResult: any) {
  return prisma.crawlArticle.create({
    data: {
      sourceUrl: crawlResult.sourceUrl,
      title: crawlResult.title,
      content: crawlResult.content,
      author: crawlResult.author,
      publishedDate: crawlResult.publishedDate,
      source: crawlResult.source || 'unknown',
      checksum: crawlResult.checksum,
      mainImage: crawlResult.mainImage,
      description: crawlResult.description,
      tags: crawlResult.tags ? JSON.parse(JSON.stringify(crawlResult.tags)) : undefined,
      status: 'pending',
    },
  });
}

/**
 * Main crawl workflow
 */
async function main() {
  console.log(`
╔═══════════════════════════════════════════════╗
║   AUTO CRAWL & REWRITE SYSTEM                ║
║   Powered by Playwright + Groq AI            ║
╚═══════════════════════════════════════════════╝
  `);
  
  const config = parseArgs();
  const startTime = Date.now();
  
  console.log('[Config]', config);
  
  await logSystem('info', 'crawler', 'crawl_start', 'Starting crawl process', config);
  
  // Step 1: Lấy danh sách nguồn
  console.log('\n[Step 1] Loading sources from database...');
  let sources = await getActiveSources();
  
  if (config.sources.length > 0) {
    sources = sources.filter((s: any) => config.sources.includes(s.name));
  }
  
  if (sources.length === 0) {
    console.log('[Error] No active sources found in database.');
    console.log('[Info] Please add sources to Source table first.');
    await logSystem('error', 'crawler', 'no_sources', 'No active sources found');
    process.exit(1);
  }
  
  console.log(`[Step 1] Found ${sources.length} active sources`);
  sources.forEach((s: any) => console.log(`  - ${s.name} (${s.domain})`));
  
  // Step 2: Crawl articles
  console.log('\n[Step 2] Crawling articles...\n');
  
  let totalCrawled = 0;
  let totalSkipped = 0;
  let totalFailed = 0;
  
  for (const source of sources) {
    console.log(`\n[Crawling] Source: ${source.name} (${source.baseUrl})`);
    
    try {
      // Parse selectors from JSON
      const selectors = source.selectors as any;
      
      // Fetch news (max 5 per source to avoid overload)
      const crawlResult = await fetchNews(source.baseUrl, selectors, 3);
      
      if (!crawlResult) {
        console.log(`  ✗ Failed to crawl from ${source.name}`);
        totalFailed++;
        
        await prisma.source.update({
          where: { id: source.id },
          data: { 
            failCount: { increment: 1 },
          },
        });
        
        continue;
      }
      
      // Check if crypto-related
      const fullText = `${crawlResult.title} ${crawlResult.content}`;
      if (!isCryptoRelated(fullText)) {
        console.log(`  ⊘ Skipped (not crypto): ${crawlResult.title.substring(0, 50)}...`);
        totalSkipped++;
        continue;
      }
      
      // Generate checksum
      const checksum = generateChecksum(crawlResult.content);
      crawlResult.checksum = checksum;
      
      // Check duplicate
      if (!config.skipDuplicateCheck) {
        const dupCheck = await checkDuplicate(crawlResult.sourceUrl, checksum);
        
        if (dupCheck.isDuplicate) {
          console.log(`  ⊘ Duplicate (${dupCheck.reason}): ${crawlResult.title.substring(0, 50)}...`);
          totalSkipped++;
          continue;
        }
      }
      
      // Save crawled article
      const saved = await saveCrawledArticle(crawlResult);
      console.log(`  ✓ Crawled: ${crawlResult.title.substring(0, 60)}...`);
      totalCrawled++;
      
      // Update source stats
      await prisma.source.update({
        where: { id: source.id },
        data: {
          lastCrawlAt: new Date(),
          totalCrawled: { increment: 1 },
          failCount: 0,
        },
      });
      
      // Step 3: AI Rewrite (nếu không skip)
      if (!config.skipRewrite) {
        console.log(`  [AI] Rewriting article...`);
        
        try {
          const provider = getAvailableProvider();
          
          if (!provider) {
            console.log(`  ✗ No AI provider available (missing API keys)`);
            continue;
          }
          
          const rewriteResult = await rewriteArticle({
            title: crawlResult.title,
            content: crawlResult.content,
            description: crawlResult.description,
            source: source.name,
          }, provider);
          
          // Update crawl article with rewritten content
          await prisma.crawlArticle.update({
            where: { id: saved.id },
            data: {
              title: rewriteResult.title,
              content: rewriteResult.content_html,
              description: rewriteResult.summary,
              status: 'processed',
            },
          });
          
          console.log(`  ✓ Rewritten: ${rewriteResult.title}`);
          
          await logSystem('info', 'ai_writer', 'rewrite_success', 'Article rewritten', {
            originalTitle: crawlResult.title,
            newTitle: rewriteResult.title,
          });
          
        } catch (error) {
          console.error(`  ✗ AI Rewrite failed:`, error);
          
          await logSystem('error', 'ai_writer', 'rewrite_failed', (error as Error).message, {
            articleId: saved.id,
            title: crawlResult.title,
          });
        }
      }
      
      // Small delay between articles
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (totalCrawled >= config.maxArticles) {
        console.log(`\n[Info] Reached max articles limit (${config.maxArticles}). Stopping.`);
        break;
      }
      
    } catch (error) {
      console.error(`[Error] Failed to process source ${source.name}:`, error);
      totalFailed++;
      
      await logSystem('error', 'crawler', 'source_failed', (error as Error).message, {
        sourceName: source.name,
      });
    }
  }
  
  // Step 4: Summary
  const duration = Date.now() - startTime;
  
  console.log(`
╔═══════════════════════════════════════════════╗
║   CRAWL SUMMARY                              ║
╚═══════════════════════════════════════════════╝

✓ Total Crawled: ${totalCrawled}
⊘ Total Skipped: ${totalSkipped}
✗ Total Failed:  ${totalFailed}
⏱ Duration:      ${(duration / 1000).toFixed(1)}s

  `);
  
  await logSystem('info', 'crawler', 'crawl_complete', 'Crawl process completed', {
    totalCrawled,
    totalSkipped,
    totalFailed,
    duration,
  });
  
  await prisma.$disconnect();
}

// Run
main().catch(async (error) => {
  console.error('[Fatal Error]', error);
  
  try {
    await logSystem('error', 'crawler', 'fatal_error', error.message, {
      stack: error.stack,
    });
  } catch {}
  
  await prisma.$disconnect();
  process.exit(1);
});
