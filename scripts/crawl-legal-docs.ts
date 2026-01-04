// scripts/crawl-legal-docs.ts
import puppeteer from 'playwright';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Use actual domain
const BASE_URL = 'https://thuvienphaплuat.vn';

interface LegalDoc {
  title: string;
  lawNumber: string;
  documentType: string;
  issuingAgency: string;
  promulgationDate: Date | null;
  effectiveDate: Date | null;
  summary: string;
  sourceUrl: string;
  content: string;
}

async function crawlThuvienPhapluat() {
  console.log('🚀 Starting legal documents crawler from thuvienphaплuat.vn...');
  
  const browser = await puppeteer.chromium.launch({
    headless: true,
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });

  const page = await context.newPage();
  const documents: LegalDoc[] = [];

  try {
    // Search for blockchain-related documents
    const searchUrl = `${BASE_URL}/phap-luat/tim-tu-van?q=blockchain`;
    console.log(`📄 Navigating to: ${searchUrl}`);
    
    await page.goto(searchUrl, { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });

    // Wait for content to load
    await page.waitForTimeout(3000);

    // Extract document links
    const documentLinks = await page.evaluate(() => {
      const links: Array<{ url: string; title: string }> = [];
      const items = (document as any).querySelectorAll('a[href*="/van-ban/"]');
      
      items.forEach((item: any) => {
        const href = item.getAttribute('href');
        const title = item.textContent?.trim();
        if (href && title && href.includes('/van-ban/')) {
          const fullUrl = href.startsWith('http') ? href : `https://thuvienphaплuat.vn${href}`;
          links.push({ url: fullUrl, title });
        }
      });
      
      return links;
    });

    console.log(`✅ Found ${documentLinks.length} document links`);

    // Crawl each document
    for (let i = 0; i < Math.min(documentLinks.length, 20); i++) {
      const link = documentLinks[i];
      
      try {
        console.log(`📖 [${i + 1}/${documentLinks.length}] Crawling: ${link.title}`);
        
        const docPage = await context.newPage();
        await docPage.goto(link.url, { 
          waitUntil: 'domcontentloaded',
          timeout: 20000 
        });
        
        await docPage.waitForTimeout(2000);

        const docData = await docPage.evaluate(() => {
          const getTextContent = (selector: string): string => {
            const element = (document as any).querySelector(selector);
            return element?.textContent?.trim() || '';
          };

          const getMetaInfo = (label: string): string => {
            const rows = Array.from((document as any).querySelectorAll('tr'));
            for (const row of rows) {
              const th = (row as any).querySelector('th');
              const td = (row as any).querySelector('td');
              if (th?.textContent?.includes(label) && td) {
                return td.textContent?.trim() || '';
              }
            }
            return '';
          };

          // Try multiple selectors for title
          const title = getTextContent('h1') || 
                       getTextContent('.title-doc') || 
                       getTextContent('.doc-title') ||
                       (document as any).title.split('|')[0].trim();

          // Extract metadata
          const documentNumber = getMetaInfo('Số hiệu') || getMetaInfo('Số ký hiệu') || '';
          const documentType = getMetaInfo('Loại văn bản') || getMetaInfo('Loại') || 'Văn bản pháp luật';
          const issuingAgency = getMetaInfo('Cơ quan ban hành') || getMetaInfo('Ban hành') || '';
          const promulgationDateStr = getMetaInfo('Ngày ban hành') || getMetaInfo('Ngày công bố') || '';
          const effectiveDateStr = getMetaInfo('Ngày hiệu lực') || getMetaInfo('Hiệu lực') || '';

          // Extract summary/content
          let summary = getTextContent('.content-doc') || 
                       getTextContent('.doc-content') ||
                       getTextContent('.summary') ||
                       getTextContent('.mota') || '';
          
          if (!summary) {
            // Try to get first paragraph
            const paragraphs = Array.from((document as any).querySelectorAll('p'));
            summary = paragraphs.slice(0, 3).map((p: any) => p.textContent?.trim()).join(' ').substring(0, 500);
          }

          return {
            title,
            documentNumber,
            documentType,
            issuingAgency,
            promulgationDateStr,
            effectiveDateStr,
            summary
          };
        });

        // Parse dates
        const parseVietnameseDate = (dateStr: string): Date | null => {
          if (!dateStr) return null;
          
          // Try format: DD/MM/YYYY
          const match = dateStr.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
          if (match) {
            const [, day, month, year] = match;
            return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          }
          
          return null;
        };

        const document: LegalDoc = {
          title: docData.title || link.title,
          lawNumber: docData.documentNumber,
          documentType: docData.documentType,
          issuingAgency: docData.issuingAgency,
          promulgationDate: parseVietnameseDate(docData.promulgationDateStr),
          effectiveDate: parseVietnameseDate(docData.effectiveDateStr),
          summary: docData.summary || `Văn bản pháp luật liên quan đến blockchain và tiền mã hóa. ${docData.title}`,
          sourceUrl: link.url,
          content: docData.summary || ''
        };

        documents.push(document);
        console.log(`   ✓ Title: ${document.title.substring(0, 60)}...`);
        console.log(`   ✓ Type: ${document.documentType}`);
        console.log(`   ✓ Agency: ${document.issuingAgency}`);

        await docPage.close();
        
        // Rate limiting
        await page.waitForTimeout(1000 + Math.random() * 1000);
        
      } catch (error) {
        console.error(`   ✗ Error crawling ${link.url}:`, error);
      }
    }

    // Also search for "tiền mã hóa" and "cryptocurrency"
    const additionalSearches = [
      `${BASE_URL}/phap-luat/tim-tu-van?q=ti%E1%BB%81n+m%C3%A3+h%C3%B3a`,
      `${BASE_URL}/phap-luat/tim-tu-van?q=cryptocurrency`,
      `${BASE_URL}/phap-luat/tim-tu-van?q=t%C3%A0i+s%E1%BA%A3n+s%E1%BB%91`
    ];

    for (const searchUrl of additionalSearches) {
      try {
        console.log(`\n🔍 Searching additional term: ${searchUrl}`);
        await page.goto(searchUrl, { 
          waitUntil: 'domcontentloaded',
          timeout: 30000 
        });
        
        await page.waitForTimeout(3000);

        const moreLinks = await page.evaluate(() => {
          const links: Array<{ url: string; title: string }> = [];
          const items = (document as any).querySelectorAll('a[href*="/van-ban/"]');
          
          items.forEach((item: any) => {
            const href = item.getAttribute('href');
            const title = item.textContent?.trim();
            if (href && title && href.includes('/van-ban/')) {
              const fullUrl = href.startsWith('http') ? href : `https://thuvienphaплuat.vn${href}`;
              links.push({ url: fullUrl, title });
            }
          });
          
          return links;
        });

        console.log(`✅ Found ${moreLinks.length} additional documents`);

        // Crawl a few from each search
        for (let i = 0; i < Math.min(moreLinks.length, 5); i++) {
          const link = moreLinks[i];
          
          // Check if already crawled
          if (documents.some(doc => doc.sourceUrl === link.url)) {
            console.log(`⏭️  Skipping duplicate: ${link.title}`);
            continue;
          }

          try {
            console.log(`📖 Crawling additional: ${link.title}`);
            
            const docPage = await context.newPage();
            await docPage.goto(link.url, { 
              waitUntil: 'domcontentloaded',
              timeout: 20000 
            });
            
            await docPage.waitForTimeout(2000);

            const docData = await docPage.evaluate(() => {
              const getTextContent = (selector: string): string => {
                const element = (document as any).querySelector(selector);
                return element?.textContent?.trim() || '';
              };

              const getMetaInfo = (label: string): string => {
                const rows = Array.from((document as any).querySelectorAll('tr'));
                for (const row of rows) {
                  const th = (row as any).querySelector('th');
                  const td = (row as any).querySelector('td');
                  if (th?.textContent?.includes(label) && td) {
                    return td.textContent?.trim() || '';
                  }
                }
                return '';
              };

              const title = getTextContent('h1') || 
                           getTextContent('.title-doc') || 
                           (document as any).title.split('|')[0].trim();

              const documentNumber = getMetaInfo('Số hiệu') || '';
              const documentType = getMetaInfo('Loại văn bản') || 'Văn bản pháp luật';
              const issuingAgency = getMetaInfo('Cơ quan ban hành') || '';
              const promulgationDateStr = getMetaInfo('Ngày ban hành') || '';
              const effectiveDateStr = getMetaInfo('Ngày hiệu lực') || '';

              let summary = getTextContent('.content-doc') || 
                           getTextContent('.summary') || '';
              
              if (!summary) {
                const paragraphs = Array.from((document as any).querySelectorAll('p'));
                summary = paragraphs.slice(0, 3).map((p: any) => p.textContent?.trim()).join(' ').substring(0, 500);
              }

              return {
                title,
                documentNumber,
                documentType,
                issuingAgency,
                promulgationDateStr,
                effectiveDateStr,
                summary
              };
            });

            const parseVietnameseDate = (dateStr: string): Date | null => {
              if (!dateStr) return null;
              const match = dateStr.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
              if (match) {
                const [, day, month, year] = match;
                return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
              }
              return null;
            };

            const document: LegalDoc = {
              title: docData.title || link.title,
              lawNumber: docData.documentNumber,
              documentType: docData.documentType,
              issuingAgency: docData.issuingAgency,
              promulgationDate: parseVietnameseDate(docData.promulgationDateStr),
              effectiveDate: parseVietnameseDate(docData.effectiveDateStr),
              summary: docData.summary || `Văn bản pháp luật liên quan đến công nghệ blockchain và tài sản số.`,
              sourceUrl: link.url,
              content: docData.summary || ''
            };

            documents.push(document);
            console.log(`   ✓ Added: ${document.title.substring(0, 60)}...`);

            await docPage.close();
            await page.waitForTimeout(1000 + Math.random() * 1000);
            
          } catch (error) {
            console.error(`   ✗ Error:`, error);
          }
        }

      } catch (error) {
        console.error(`Error searching ${searchUrl}:`, error);
      }
    }

  } catch (error) {
    console.error('❌ Error during crawling:', error);
  } finally {
    await browser.close();
  }

  return documents;
}

async function saveDocumentsToDatabase(documents: LegalDoc[]) {
  console.log(`\n💾 Saving ${documents.length} documents to database...`);
  
  let saved = 0;
  let skipped = 0;
  let errors = 0;

  for (const doc of documents) {
    try {
      // Check if document already exists by title
      const existing = await prisma.legalDocument.findFirst({
        where: {
          title: doc.title
        }
      });

      if (existing) {
        console.log(`⏭️  Skipped (exists): ${doc.title.substring(0, 50)}...`);
        skipped++;
        continue;
      }

      // Create slug from title
      const slug = doc.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'd')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 100);

      // Ensure unique slug
      let finalSlug = slug;
      let counter = 1;
      while (await prisma.legalDocument.findUnique({ where: { slug: finalSlug } })) {
        finalSlug = `${slug}-${counter}`;
        counter++;
      }

      await prisma.legalDocument.create({
        data: {
          title: doc.title,
          slug: finalSlug,
          lawNumber: doc.lawNumber,
          issuingAgency: doc.issuingAgency,
          promulgationDate: doc.promulgationDate,
          effectiveDate: doc.effectiveDate,
          summary: doc.summary,
          content: doc.content,
          attachmentUrl: doc.sourceUrl
        }
      });

      console.log(`✅ Saved: ${doc.title.substring(0, 50)}...`);
      saved++;

    } catch (error) {
      console.error(`❌ Error saving ${doc.title}:`, error);
      errors++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Saved: ${saved}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   ❌ Errors: ${errors}`);
  console.log(`   📄 Total: ${documents.length}`);
}

async function main() {
  try {
    console.log('🔥 Legal Documents Crawler Started\n');
    
    const documents = await crawlThuvienPhapluat();
    
    if (documents.length === 0) {
      console.log('⚠️  No documents found. Exiting...');
      return;
    }

    await saveDocumentsToDatabase(documents);
    
    console.log('\n✅ Crawling completed successfully!');
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
