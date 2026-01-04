import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.crawlArticle.updateMany({
    where: { status: 'rejected' },
    data: { status: 'pending' }
  });

  console.log(`✓ Reset ${result.count} articles to pending status`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
