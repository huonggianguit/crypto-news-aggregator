// scripts/delete-all-posts.ts
import { prisma } from '@/lib/prisma';

async function deleteAllPosts() {
  console.log('\n[Delete] Counting posts...\n');

  const count = await prisma.post.count();
  
  console.log(`Found ${count} posts in database`);

  if (count === 0) {
    console.log('✓ No posts to delete!');
    return;
  }

  // Delete all posts
  const result = await prisma.post.deleteMany({});

  console.log(`\n✓ Deleted ${result.count} posts`);
  
  // Also delete all Unsplash image records
  const unsplashResult = await prisma.unsplashImage.deleteMany({});
  console.log(`✓ Deleted ${unsplashResult.count} Unsplash image records`);
}

deleteAllPosts()
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
