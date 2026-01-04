import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Get the latest post
  const post = await prisma.post.findFirst({
    where: { slug: 'bao-hiem-huu-tri' },
    select: { 
      title: true,
      content: true
    }
  });

  if (!post) {
    console.log('Post not found');
    return;
  }

  console.log('\n📄 Post:', post.title);
  
  const hasImgTags = post.content?.includes('<img');
  console.log('✓ Has <img> tags:', hasImgTags ? 'YES ✓' : 'NO ✗');
  
  if (post.content) {
    const matches = post.content.match(/<img[^>]*>/g);
    const count = matches?.length || 0;
    console.log(`📸 Total images in content: ${count}`);
    
    if (matches && matches.length > 0) {
      console.log('\n🖼️  Image sources:');
      matches.forEach((img, i) => {
        const srcMatch = img.match(/src="([^"]*)"/);
        if (srcMatch) {
          console.log(`   ${i + 1}. ${srcMatch[1]}`);
        }
      });
    }
  }

  // Compare with original
  console.log('\n--- Original Crawled Article ---');
  const crawl = await prisma.crawlArticle.findFirst({
    where: { 
      title: { contains: 'Bộ Tài chính đề xuất quy định bảo hiểm hưu trí' }
    },
    select: { 
      title: true,
      content: true
    }
  });

  if (crawl && crawl.content) {
    const crawlMatches = crawl.content.match(/<img[^>]*>/g);
    console.log(`📸 Original had: ${crawlMatches?.length || 0} images`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
