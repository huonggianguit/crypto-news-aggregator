// scripts/test-setup.ts
/**
 * Test Setup Script
 * Kiểm tra xem hệ thống đã được cấu hình đúng chưa
 */

import { prisma } from '../lib/prisma';
import { getAvailableProvider } from '../lib/ai/aiWriter';
import { chromium } from 'playwright';

async function testDatabase() {
  console.log('\n[Test 1/4] Testing Database Connection...');
  
  try {
    await prisma.$connect();
    console.log('  ✓ Database connected');
    
    // Count records
    const sourceCount = await prisma.source.count();
    const crawlCount = await prisma.crawlArticle.count();
    const postCount = await prisma.post.count();
    
    console.log(`  ✓ Sources: ${sourceCount}`);
    console.log(`  ✓ CrawlArticles: ${crawlCount}`);
    console.log(`  ✓ Posts: ${postCount}`);
    
    if (sourceCount === 0) {
      console.log('  ⚠ Warning: No sources found. Run: npm run add-source');
    }
    
    return true;
  } catch (error) {
    console.error('  ✗ Database error:', (error as Error).message);
    return false;
  }
}

async function testAIProvider() {
  console.log('\n[Test 2/4] Testing AI Provider...');
  
  const provider = getAvailableProvider();
  
  if (!provider) {
    console.error('  ✗ No AI provider available');
    console.error('  ℹ Please set GROQ_API_KEY or OPENAI_API_KEY in .env');
    return false;
  }
  
  console.log(`  ✓ AI Provider: ${provider.toUpperCase()}`);
  
  // Test API key format
  if (provider === 'groq') {
    const key = process.env.GROQ_API_KEY;
    if (key?.startsWith('gsk_')) {
      console.log('  ✓ Groq API key format valid');
    } else {
      console.log('  ⚠ Warning: Groq API key format may be invalid');
    }
  }
  
  return true;
}

async function testPlaywright() {
  console.log('\n[Test 3/4] Testing Playwright...');
  
  try {
    const browser = await chromium.launch({ headless: true });
    console.log('  ✓ Playwright browser launched');
    
    const page = await browser.newPage();
    await page.goto('https://example.com', { timeout: 10000 });
    const title = await page.title();
    
    console.log(`  ✓ Test navigation successful: ${title}`);
    
    await browser.close();
    return true;
  } catch (error) {
    console.error('  ✗ Playwright error:', (error as Error).message);
    console.error('  ℹ Try: npx playwright install chromium');
    return false;
  }
}

async function testEnvironment() {
  console.log('\n[Test 4/4] Testing Environment Variables...');
  
  const required = ['DATABASE_URL'];
  const optional = ['GROQ_API_KEY', 'OPENAI_API_KEY', 'UNSPLASH_ACCESS_KEY'];
  
  let allGood = true;
  
  for (const key of required) {
    if (process.env[key]) {
      console.log(`  ✓ ${key}: Set`);
    } else {
      console.error(`  ✗ ${key}: Missing (REQUIRED)`);
      allGood = false;
    }
  }
  
  for (const key of optional) {
    if (process.env[key]) {
      console.log(`  ✓ ${key}: Set`);
    } else {
      console.log(`  ℹ ${key}: Not set (optional)`);
    }
  }
  
  return allGood;
}

async function main() {
  console.log(`
╔═══════════════════════════════════════════════╗
║   SETUP TEST - System Verification          ║
╚═══════════════════════════════════════════════╝
  `);
  
  const results = {
    database: false,
    ai: false,
    playwright: false,
    env: false,
  };
  
  results.env = await testEnvironment();
  results.database = await testDatabase();
  results.ai = await testAIProvider();
  results.playwright = await testPlaywright();
  
  // Summary
  console.log('\n╔═══════════════════════════════════════════════╗');
  console.log('║   TEST SUMMARY                               ║');
  console.log('╚═══════════════════════════════════════════════╝\n');
  
  const allPassed = Object.values(results).every(r => r === true);
  
  Object.entries(results).forEach(([key, value]) => {
    const status = value ? '✓' : '✗';
    const label = key.charAt(0).toUpperCase() + key.slice(1);
    console.log(`  ${status} ${label.padEnd(20)} ${value ? 'PASS' : 'FAIL'}`);
  });
  
  console.log('\n' + '─'.repeat(50));
  
  if (allPassed) {
    console.log('\n🎉 ALL TESTS PASSED! System ready to use.\n');
    console.log('Next steps:');
    console.log('  1. Add sources: npm run add-source');
    console.log('  2. Test crawl: npm run run-crawl -- --max 3');
    console.log('  3. Start dev: npm run dev\n');
  } else {
    console.log('\n⚠️  SOME TESTS FAILED. Please fix the issues above.\n');
    console.log('Common fixes:');
    console.log('  - Database: Check DATABASE_URL in .env');
    console.log('  - AI: Set GROQ_API_KEY or OPENAI_API_KEY');
    console.log('  - Playwright: Run "npx playwright install chromium"');
    console.log('  - Env: Copy .env.example to .env\n');
    process.exit(1);
  }
  
  await prisma.$disconnect();
}

main().catch(console.error);
