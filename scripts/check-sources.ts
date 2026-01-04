// scripts/check-sources.ts
/**
 * Check source field in Post collection
 */

import { prisma } from '../lib/prisma';

async function main() {
  console.log('Checking Post sources in MongoDB...\n');
  
  const posts = await prisma.post.findMany({
    select: {
      id: true,
      title: true,
      source: true,
      createdAt: true
    },
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  console.log(`Found ${posts.length} recent posts:\n`);
  
  posts.forEach((post, i) => {
    console.log(`${i + 1}. ${post.title}`);
    console.log(`   Source: ${post.source || 'NULL'}`);
    console.log(`   Created: ${post.createdAt.toLocaleString()}`);
    console.log('');
  });
  
  const withSource = posts.filter(p => p.source).length;
  const withoutSource = posts.filter(p => !p.source).length;
  
  console.log(`\nSummary:`);
  console.log(`  ✓ With source: ${withSource}`);
  console.log(`  ✗ Without source: ${withoutSource}`);
}

main()
  .catch(console.error)
  .finally(() => process.exit(0));
