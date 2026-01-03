import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Check latest published post
  const post = await prisma.post.findFirst({
    where: { slug: 'bao-hiem-y-te-cho-nguoi-tu-65-75-tuoi' },
    select: { 
      title: true,
      content: true,
      image: true
    }
  });

  if (!post) {
    console.log('Post not found');
    return;
  }

  console.log('\nPost:', post.title);
  console.log('\nField "image" (JSON):', post.image);
  
  const hasImgTags = post.content?.includes('<img');
  console.log('\nContent has <img> tags:', hasImgTags);
  
  if (post.content) {
    const matches = post.content.match(/<img[^>]*>/g);
    console.log('Total <img> tags in content:', matches?.length || 0);
    
    if (matches && matches.length > 0) {
      console.log('\nFirst 3 image tags:');
      matches.slice(0, 3).forEach((img, i) => {
        console.log(`${i + 1}. ${img}`);
      });
    }
  }

  // Check original crawled article
  console.log('\n--- Original Crawled Article ---');
  const crawl = await prisma.crawlArticle.findFirst({
    where: { title: { contains: 'TP.HCM cấp thẻ bảo hiểm' } },
    select: { 
      title: true,
      content: true,
      mainImage: true
    }
  });

  if (crawl) {
    const crawlHasImg = crawl.content?.includes('<img');
    console.log('Original content has <img> tags:', crawlHasImg);
    
    if (crawl.content) {
      const crawlMatches = crawl.content.match(/<img[^>]*>/g);
      console.log('Total <img> in original:', crawlMatches?.length || 0);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
