// scripts/reset-all-to-pending.ts
import { prisma } from '@/lib/prisma';

async function resetAllToPending() {
  console.log('\n[Reset] Resetting all CrawlArticle to pending status...\n');

  const result = await prisma.crawlArticle.updateMany({
    where: {
      status: {
        in: ['processed', 'rejected']
      }
    },
    data: { status: 'pending' }
  });

  console.log(`✓ Reset ${result.count} articles to pending status`);
  
  // Count pending articles
  const pendingCount = await prisma.crawlArticle.count({
    where: { status: 'pending' }
  });
  
  console.log(`✓ Total pending articles: ${pendingCount}`);
}

resetAllToPending()
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
