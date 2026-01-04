// scripts/add-source.ts
/**
 * Helper script để thêm nguồn tin vào database
 * 
 * Usage:
 *   ts-node scripts/add-source.ts
 */

import { prisma } from '../lib/prisma';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query: string): Promise<string> {
  return new Promise(resolve => rl.question(query, resolve));
}

// Predefined sources
const PREDEFINED_SOURCES = [
  {
    name: 'CoinDesk',
    domain: 'coindesk.com',
    baseUrl: 'https://www.coindesk.com/latest',
    selectors: {
      title: 'h1.headline, h1',
      content: 'div.article-content, div.content-body',
      author: 'span.author-name',
      date: 'time',
      mainImage: 'figure img, div.lead-image img',
      description: 'p.lead, p.subtitle',
    },
    language: 'en',
    country: 'US',
    category: 'crypto',
    priority: 5,
  },
  {
    name: 'Cointelegraph',
    domain: 'cointelegraph.com',
    baseUrl: 'https://cointelegraph.com/news',
    selectors: {
      title: 'h1.post__title',
      content: 'div.post-content',
      author: 'a.post-meta__author-name',
      date: 'time.post-meta__publish-date',
      mainImage: 'div.post__lead-image img',
      description: 'p.post__lead',
    },
    language: 'en',
    country: 'US',
    category: 'crypto',
    priority: 5,
  },
  {
    name: 'VnExpress',
    domain: 'vnexpress.net',
    baseUrl: 'https://vnexpress.net/kinh-doanh',
    selectors: {
      title: 'h1.title-detail, h1',
      content: 'article.fck_detail',
      author: 'p.author_mail',
      date: 'span.date',
      mainImage: 'div.fig-picture img, img.content_detail',
      description: 'p.description',
    },
    language: 'vi',
    country: 'VN',
    category: 'finance',
    priority: 4,
  },
  {
    name: 'TapChiBitcoin',
    domain: 'tapchibitcoin.io',
    baseUrl: 'https://tapchibitcoin.io/tin-tuc',
    selectors: {
      title: 'h1',
      content: 'div.entry-content, article.content',
      author: 'span.author',
      date: 'time, span.date',
      mainImage: 'div.featured-image img',
      description: 'div.excerpt, p.summary',
    },
    language: 'vi',
    country: 'VN',
    category: 'crypto',
    priority: 5,
  },
  {
    name: 'TheBlock',
    domain: 'theblock.co',
    baseUrl: 'https://www.theblock.co/latest',
    selectors: {
      title: 'h1.article-header__title',
      content: 'div.article-content',
      author: 'a.article-header__author',
      date: 'time.article-header__timestamp',
      mainImage: 'figure.article-header__image img',
      description: 'p.article-header__excerpt',
    },
    language: 'en',
    country: 'US',
    category: 'crypto',
    priority: 5,
  },
];

async function addPredefinedSource(index: number) {
  const source = PREDEFINED_SOURCES[index];
  
  console.log('\n[Adding Predefined Source]');
  console.log(JSON.stringify(source, null, 2));
  
  const confirm = await question('\nConfirm add this source? (y/n): ');
  
  if (confirm.toLowerCase() !== 'y') {
    console.log('Cancelled.');
    return;
  }
  
  try {
    const result = await prisma.source.create({
      data: {
        name: source.name,
        domain: source.domain,
        baseUrl: source.baseUrl,
        selectors: source.selectors as any,
        isActive: true,
        language: source.language,
        country: source.country,
        category: source.category,
        priority: source.priority,
      },
    });
    
    console.log('\n✓ Source added successfully!');
    console.log('ID:', result.id);
  } catch (error: any) {
    if (error.code === 'P2002') {
      console.error('\n✗ Error: Source with this domain already exists!');
    } else {
      console.error('\n✗ Error:', error.message);
    }
  }
}

async function addCustomSource() {
  console.log('\n[Add Custom Source]');
  
  const name = await question('Name: ');
  const domain = await question('Domain (e.g. example.com): ');
  const baseUrl = await question('Base URL: ');
  const language = await question('Language (vi/en): ');
  const category = await question('Category (crypto/finance/tech): ');
  const priority = await question('Priority (1-5): ');
  
  console.log('\n[Selectors] (CSS selectors)');
  const titleSelector = await question('Title selector: ');
  const contentSelector = await question('Content selector: ');
  const authorSelector = await question('Author selector (optional): ');
  const dateSelector = await question('Date selector (optional): ');
  const imageSelector = await question('Main image selector (optional): ');
  const descSelector = await question('Description selector (optional): ');
  
  const selectors: any = {
    title: titleSelector,
    content: contentSelector,
  };
  
  if (authorSelector) selectors.author = authorSelector;
  if (dateSelector) selectors.date = dateSelector;
  if (imageSelector) selectors.mainImage = imageSelector;
  if (descSelector) selectors.description = descSelector;
  
  console.log('\n[Preview]');
  console.log(JSON.stringify({
    name,
    domain,
    baseUrl,
    selectors,
    language,
    category,
    priority: parseInt(priority),
  }, null, 2));
  
  const confirm = await question('\nConfirm add this source? (y/n): ');
  
  if (confirm.toLowerCase() !== 'y') {
    console.log('Cancelled.');
    return;
  }
  
  try {
    const result = await prisma.source.create({
      data: {
        name,
        domain,
        baseUrl,
        selectors: selectors as any,
        isActive: true,
        language,
        category,
        priority: parseInt(priority) || 3,
      },
    });
    
    console.log('\n✓ Source added successfully!');
    console.log('ID:', result.id);
  } catch (error: any) {
    if (error.code === 'P2002') {
      console.error('\n✗ Error: Source with this domain already exists!');
    } else {
      console.error('\n✗ Error:', error.message);
    }
  }
}

async function listSources() {
  const sources = await prisma.source.findMany({
    orderBy: { priority: 'desc' },
  });
  
  console.log(`\n[Existing Sources] (${sources.length})`);
  
  if (sources.length === 0) {
    console.log('No sources found.');
    return;
  }
  
  sources.forEach((source: any, index: number) => {
    console.log(`\n${index + 1}. ${source.name}`);
    console.log(`   Domain: ${source.domain}`);
    console.log(`   URL: ${source.baseUrl}`);
    console.log(`   Active: ${source.isActive ? '✓' : '✗'}`);
    console.log(`   Priority: ${source.priority}/5`);
    console.log(`   Last Crawl: ${source.lastCrawlAt ? source.lastCrawlAt.toISOString() : 'Never'}`);
    console.log(`   Total Crawled: ${source.totalCrawled}`);
  });
}

async function main() {
  console.log(`
╔═══════════════════════════════════════════════╗
║   ADD SOURCE TO DATABASE                     ║
╚═══════════════════════════════════════════════╝
  `);
  
  console.log('[Options]');
  console.log('1. Add predefined source (CoinDesk, Cointelegraph, etc.)');
  console.log('2. Add custom source');
  console.log('3. List existing sources');
  console.log('4. Exit');
  
  const choice = await question('\nYour choice (1-4): ');
  
  switch (choice) {
    case '1':
      console.log('\n[Predefined Sources]');
      PREDEFINED_SOURCES.forEach((source, index) => {
        console.log(`${index + 1}. ${source.name} (${source.domain})`);
      });
      
      const sourceIndex = await question('\nSelect source (1-' + PREDEFINED_SOURCES.length + '): ');
      const index = parseInt(sourceIndex) - 1;
      
      if (index >= 0 && index < PREDEFINED_SOURCES.length) {
        await addPredefinedSource(index);
      } else {
        console.log('Invalid selection.');
      }
      break;
      
    case '2':
      await addCustomSource();
      break;
      
    case '3':
      await listSources();
      break;
      
    case '4':
      console.log('Goodbye!');
      break;
      
    default:
      console.log('Invalid choice.');
  }
  
  rl.close();
  await prisma.$disconnect();
}

main().catch(console.error);
