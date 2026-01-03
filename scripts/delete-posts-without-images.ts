// scripts/delete-posts-without-images.ts
import { prisma } from '@/lib/prisma';

async function deletePostsWithoutImages() {
  console.log('\n[Delete] Finding posts without images...\n');

  // Get all posts
  const allPosts = await prisma.post.findMany({
    select: {
      id: true,
      title: true,
      main_img: true,
      content: true,
      createdAt: true,
    }
  });

  // Filter posts to delete based on conditions:
  // 1. No main_img → DELETE
  // 2. Has main_img but no content images → DELETE
  // 3. Has content images but no main_img → DELETE
  // => Keep ONLY if has both main_img AND content images
  const postsToDelete = allPosts.filter(post => {
    const hasMainImg = post.main_img && 
                      post.main_img !== '' && 
                      post.main_img !== '/placeholder.jpg';
    
    const hasContentImg = post.content && 
                         post.content.includes('<img');
    
    // Delete if missing either main_img OR content images (or both)
    return !hasMainImg || !hasContentImg;
  });

  console.log(`Found ${postsToDelete.length} posts without any images:\n`);

  if (postsToDelete.length === 0) {
    console.log('✓ All posts have images!');
    return;
  }

  // Display posts to delete
  postsToDelete.forEach((post, index) => {
    const imgCount = (post.content?.match(/<img/gi) || []).length;
    console.log(`${index + 1}. ${post.title}`);
    console.log(`   Main image: ${post.main_img || '(empty)'}`);
    console.log(`   Content images: ${imgCount}`);
    console.log(`   Created: ${post.createdAt.toLocaleString('vi-VN')}`);
    console.log('');
  });

  // Delete them by IDs
  const idsToDelete = postsToDelete.map(p => p.id);
  
  const result = await prisma.post.deleteMany({
    where: {
      id: {
        in: idsToDelete
      }
    }
  });

  console.log(`\n✓ Deleted ${result.count} posts without images`);
}

deletePostsWithoutImages()
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
