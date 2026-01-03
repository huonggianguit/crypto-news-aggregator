import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const articles = await prisma.crawlArticle.findMany({
    select: { 
      title: true, 
      mainImage: true,
      status: true
    }
  });

  console.log(`\nTotal articles: ${articles.length}\n`);
  
  articles.forEach(a => {
    const shortTitle = a.title.substring(0, 60).padEnd(60);
    const imgStatus = a.mainImage ? '✓ HAS IMAGE' : '✗ NO IMAGE';
    console.log(`[${a.status}] ${shortTitle} -> ${imgStatus}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
