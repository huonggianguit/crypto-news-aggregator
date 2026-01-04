// app/api/cron/crawl/route.ts
/**
 * Cron API Endpoint - Trigger crawl process
 * 
 * Security: Requires CRON_SECRET in headers
 * 
 * Usage:
 *   curl -X POST http://localhost:3000/api/cron/crawl \
 *     -H "Authorization: Bearer YOUR_CRON_SECRET"
 * 
 * Or with Vercel Cron / GitHub Actions
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fetchNews, isCryptoRelated } from '@/lib/crawler/smartCrawler';
import { rewriteArticle, getAvailableProvider } from '@/lib/ai/aiWriter';
import { generateChecksum } from '@/lib/crawler/articleCrawler';

/**
 * Verify authorization
 */
function verifyAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (!cronSecret) {
    console.error('[Cron API] CRON_SECRET not set in environment');
    return false;
  }
  
  if (!authHeader) {
    return false;
  }
  
  // Support both "Bearer TOKEN" and "TOKEN" format
  const token = authHeader.replace('Bearer ', '');
  return token === cronSecret;
}

/**
 * Log to SystemLog
 */
async function logSystem(
  level: 'info' | 'warn' | 'error',
  action: string,
  message: string,
  details?: any
) {
  try {
    await prisma.systemLog.create({
      data: {
        level,
        module: 'cron_api',
        action,
        message,
        details: details ? JSON.parse(JSON.stringify(details)) : undefined,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error('[Cron API] Failed to log:', error);
  }
}

/**
 * Check duplicate
 */
async function checkDuplicate(sourceUrl: string, checksum: string) {
  const existingByUrl = await prisma.crawlArticle.findUnique({
    where: { sourceUrl },
  });
  
  if (existingByUrl) {
    if (existingByUrl.checksum === checksum) {
      return { isDuplicate: true, reason: 'same_content' };
    }
    return { isDuplicate: true, reason: 'url_exists' };
  }
  
  const existingByChecksum = await prisma.crawlArticle.findFirst({
    where: { checksum },
  });
  
  if (existingByChecksum) {
    return { isDuplicate: true, reason: 'duplicate_content' };
  }
  
  return { isDuplicate: false };
}

/**
 * Main crawl process
 */
async function runCrawlProcess(maxArticles: number = 10) {
  const startTime = Date.now();
  let stats = {
    totalCrawled: 0,
    totalSkipped: 0,
    totalFailed: 0,
    sources: [] as any[],
  };
  
  try {
    await logSystem('info', 'crawl_start', 'Cron crawl started', { maxArticles });
    
    // Get active sources
    const sources = await prisma.source.findMany({
      where: { isActive: true },
      orderBy: { priority: 'desc' },
      take: 5, // Limit to top 5 sources for cron job
    });
    
    if (sources.length === 0) {
      await logSystem('warn', 'no_sources', 'No active sources found');
      return stats;
    }
    
    console.log(`[Cron API] Found ${sources.length} active sources`);
    
    // Process each source
    for (const source of sources) {
      if (stats.totalCrawled >= maxArticles) {
        console.log(`[Cron API] Reached max articles limit: ${maxArticles}`);
        break;
      }
      
      console.log(`[Cron API] Processing source: ${source.name}`);
      const sourceStats = {
        name: source.name,
        crawled: 0,
        skipped: 0,
        failed: 0,
      };
      
      try {
        const selectors = source.selectors as any;
        const crawlResult = await fetchNews(source.baseUrl, selectors, 2); // 2 retries
        
        if (!crawlResult) {
          console.log(`[Cron API] Failed to crawl ${source.name}`);
          sourceStats.failed++;
          stats.totalFailed++;
          
          await prisma.source.update({
            where: { id: source.id },
            data: { failCount: { increment: 1 } },
          });
          
          continue;
        }
        
        // Check crypto-related
        const fullText = `${crawlResult.title} ${crawlResult.content}`;
        if (!isCryptoRelated(fullText)) {
          console.log(`[Cron API] Skipped non-crypto: ${crawlResult.title.substring(0, 50)}`);
          sourceStats.skipped++;
          stats.totalSkipped++;
          continue;
        }
        
        // Generate checksum
        const checksum = generateChecksum(crawlResult.content);
        
        // Check duplicate
        const dupCheck = await checkDuplicate(crawlResult.sourceUrl, checksum);
        if (dupCheck.isDuplicate) {
          console.log(`[Cron API] Duplicate (${dupCheck.reason}): ${crawlResult.title.substring(0, 50)}`);
          sourceStats.skipped++;
          stats.totalSkipped++;
          continue;
        }
        
        // Save crawled article
        const saved = await prisma.crawlArticle.create({
          data: {
            sourceUrl: crawlResult.sourceUrl,
            title: crawlResult.title,
            content: crawlResult.content,
            author: crawlResult.author,
            publishedDate: crawlResult.publishedDate,
            source: source.name,
            checksum,
            mainImage: crawlResult.mainImage,
            description: crawlResult.description,
            tags: crawlResult.tags ? JSON.parse(JSON.stringify(crawlResult.tags)) : undefined,
            status: 'pending',
          },
        });
        
        console.log(`[Cron API] Saved: ${crawlResult.title.substring(0, 50)}`);
        sourceStats.crawled++;
        stats.totalCrawled++;
        
        // Update source stats
        await prisma.source.update({
          where: { id: source.id },
          data: {
            lastCrawlAt: new Date(),
            totalCrawled: { increment: 1 },
            failCount: 0,
          },
        });
        
        // AI Rewrite
        try {
          const provider = getAvailableProvider();
          if (!provider) {
            console.log(`[Cron API] No AI provider available`);
            continue;
          }
          
          const rewriteResult = await rewriteArticle({
            title: crawlResult.title,
            content: crawlResult.content,
            description: crawlResult.description,
            source: source.name,
          }, provider);
          
          // Update with rewritten content
          await prisma.crawlArticle.update({
            where: { id: saved.id },
            data: {
              title: rewriteResult.title,
              content: rewriteResult.content_html,
              description: rewriteResult.summary,
              status: 'processed',
            },
          });
          
          console.log(`[Cron API] Rewritten: ${rewriteResult.title}`);
        } catch (error) {
          console.error(`[Cron API] AI rewrite failed:`, error);
        }
        
        // Small delay between articles
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.error(`[Cron API] Error processing ${source.name}:`, error);
        sourceStats.failed++;
        stats.totalFailed++;
      }
      
      stats.sources.push(sourceStats);
    }
    
    const duration = Date.now() - startTime;
    await logSystem('info', 'crawl_complete', 'Cron crawl completed', {
      ...stats,
      duration,
    });
    
    return stats;
    
  } catch (error) {
    console.error('[Cron API] Fatal error:', error);
    await logSystem('error', 'crawl_failed', (error as Error).message, {
      stack: (error as Error).stack,
    });
    throw error;
  }
}

/**
 * POST /api/cron/crawl
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    if (!verifyAuth(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Parse query params
    const { searchParams } = new URL(request.url);
    const maxArticles = parseInt(searchParams.get('max') || '10', 10);
    
    console.log(`[Cron API] Starting crawl process (max: ${maxArticles})...`);
    
    // Run crawl
    const stats = await runCrawlProcess(maxArticles);
    
    // Return success
    return NextResponse.json({
      success: true,
      message: 'Crawl completed',
      stats,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('[Cron API] Error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * GET /api/cron/crawl (for testing)
 */
export async function GET(request: NextRequest) {
  // Verify authentication
  if (!verifyAuth(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  return NextResponse.json({
    message: 'Cron API is working',
    timestamp: new Date().toISOString(),
    info: 'Use POST to trigger crawl',
  });
}
