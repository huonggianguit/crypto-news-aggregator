// lib/crawler/crawlRepository.ts
import { prisma } from '@/lib/prisma';
import { CrawledArticle } from './articleCrawler';

/**
 * Save crawled article to database
 */
export async function saveCrawledArticle(article: CrawledArticle) {
  try {
    // Check if article already exists
    const existing = await prisma.crawlArticle.findUnique({
      where: { sourceUrl: article.sourceUrl },
    });

    if (existing) {
      // Update if content changed
      if (existing.checksum !== article.checksum) {
        console.log(`[DB] Updating article: ${article.title}`);
        return await prisma.crawlArticle.update({
          where: { sourceUrl: article.sourceUrl },
          data: {
            title: article.title,
            content: article.content,
            author: article.author,
            publishedDate: article.publishedDate,
            mainImage: article.mainImage,
            description: article.description,
            tags: article.tags as any,
            checksum: article.checksum,
            status: 'pending', // Reset status for reprocessing
            lastFetchedAt: new Date(),
          },
        });
      } else {
        console.log(`[DB] No changes detected: ${article.title}`);
        // Just update lastFetchedAt
        return await prisma.crawlArticle.update({
          where: { sourceUrl: article.sourceUrl },
          data: { lastFetchedAt: new Date() },
        });
      }
    }

    // Create new article
    console.log(`[DB] Creating new article: ${article.title}`);
    return await prisma.crawlArticle.create({
      data: {
        sourceUrl: article.sourceUrl,
        title: article.title,
        content: article.content,
        author: article.author,
        publishedDate: article.publishedDate,
        source: article.source,
        mainImage: article.mainImage,
        description: article.description,
        tags: article.tags as any,
        checksum: article.checksum,
        status: 'pending',
      },
    });
  } catch (error) {
    console.error(`[DB] Error saving article:`, error);
    throw error;
  }
}

/**
 * Get pending articles for processing
 */
export async function getPendingArticles(limit = 10) {
  return await prisma.crawlArticle.findMany({
    where: { status: 'pending' },
    take: limit,
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Mark article as processed
 */
export async function markAsProcessed(id: string) {
  return await prisma.crawlArticle.update({
    where: { id },
    data: { status: 'processed' },
  });
}

/**
 * Mark article as rejected
 */
export async function markAsRejected(id: string) {
  return await prisma.crawlArticle.update({
    where: { id },
    data: { status: 'rejected' },
  });
}

/**
 * Get crawl statistics
 */
export async function getCrawlStats() {
  const total = await prisma.crawlArticle.count();
  const pending = await prisma.crawlArticle.count({ where: { status: 'pending' } });
  const processed = await prisma.crawlArticle.count({ where: { status: 'processed' } });
  const rejected = await prisma.crawlArticle.count({ where: { status: 'rejected' } });
  
  const bySource = await prisma.crawlArticle.groupBy({
    by: ['source'],
    _count: true,
  });

  return {
    total,
    pending,
    processed,
    rejected,
    bySource,
  };
}
