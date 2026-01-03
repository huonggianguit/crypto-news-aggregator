import { prisma } from "@/lib/prisma";

// Run this file with: npx ts-node lib/diagnoseDb.ts

async function diagnoseDatabase() {
  try {
    // Check categories
    const categories = await prisma.category.findMany({
      select: { id: true, name: true, slug: true, _count: { select: { posts: true } } },
      orderBy: { name: "asc" }
    });

    console.log("=== DATABASE DIAGNOSIS ===\n");
    console.log("CATEGORIES FOUND:", categories.length);
    categories.forEach(cat => {
      console.log(`  - ${cat.slug} (${cat.name}) - ${cat._count.posts} posts`);
    });

    // Check total posts
    const totalPosts = await prisma.post.count();
    console.log(`\nTOTAL POSTS: ${totalPosts}\n`);

    // Test keyword searches
    console.log("TESTING SEARCHES:\n");
    
    const keyword1 = "bitcoin";
    const result1 = await prisma.post.findMany({
      where: {
        OR: [
          { title: { contains: keyword1 } },
          { description: { contains: keyword1 } }
        ]
      },
      take: 3
    });
    console.log(`Keyword search "${keyword1}": ${result1.length} results`);

    const keyword2 = "nhân thọ";
    const result2 = await prisma.post.findMany({
      where: {
        OR: [
          { title: { contains: keyword2 } },
          { description: { contains: keyword2 } }
        ]
      },
      take: 3
    });
    console.log(`Keyword search "${keyword2}": ${result2.length} results`);

    // Check if case-insensitive helps
    const result3 = await prisma.post.findMany({
      where: {
        title: { contains: keyword2, mode: "insensitive" }
      },
      take: 3
    });
    console.log(`Case-insensitive search "${keyword2}": ${result3.length} results`);

  } catch (error) {
    console.error("Diagnosis error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

diagnoseDatabase();
