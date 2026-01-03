// lib/publisher/articlePublisher.ts
import { prisma } from '@/lib/prisma';
import { rewriteArticle, RewriteOutput } from '../ai/articleRewriter';
import { getArticleImage, enrichContentWithImages } from '../unsplash/unsplashService';
import slugify from 'slugify';

/**
 * Check if an image URL is accessible
 */
async function isImageAccessible(url: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout
    
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    const contentType = response.headers.get('content-type');
    return response.ok && contentType !== null && contentType.startsWith('image/');
  } catch (error) {
    console.log(`[Publisher] Image not accessible: ${url}`);
    return false;
  }
}

/**
 * Extract image URLs from HTML content
 */
function extractImagesFromHtml(html: string): string[] {
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  const urls: string[] = [];
  let match;
  
  while ((match = imgRegex.exec(html)) !== null) {
    const url = match[1];
    // Only keep valid HTTP(S) URLs
    if (url.startsWith('http://') || url.startsWith('https://')) {
      urls.push(url);
    }
  }
  
  // Return unique URLs (max 5)
  return Array.from(new Set(urls)).slice(0, 5);
}

/**
 * Map category suggestion to categoryId
 */
async function getCategoryId(slug: string): Promise<string> {
  // Try to find existing category
  let category = await prisma.category.findUnique({
    where: { slug }
  });

  // If not found, create default category
  if (!category) {
    console.log(`[Publisher] Creating new category: ${slug}`);
    category = await prisma.category.create({
      data: {
        name: mapSlugToName(slug),
        slug,
        groupName: 'Crypto'  // Default group
      }
    });
  }

  return category.id;
}

/**
 * Map slug to display name
 */
function mapSlugToName(slug: string): string {
  const mapping: Record<string, string> = {
    'tin-tuc': 'Tin tức',
    'phan-tich': 'Phân tích',
    'kien-thuc': 'Kiến thức',
    'phap-ly': 'Pháp lý',
    'huong-dan': 'Hướng dẫn',
    'bitcoin': 'Bitcoin',
    'ethereum': 'Ethereum',
    'altcoin': 'Altcoin',
    'defi': 'DeFi',
    'nft': 'NFT',
  };

  return mapping[slug] || slug;
}

/**
 * Generate unique slug for post
 */
async function generateUniqueSlug(baseTitle: string): Promise<string> {
  let slug = slugify(baseTitle, {
    lower: true,
    strict: true,
    locale: 'vi',
    remove: /[*+~.()'"!:@]/g
  });

  // Limit slug length
  if (slug.length > 80) {
    slug = slug.substring(0, 80);
  }

  // Check if slug exists
  const existing = await prisma.post.findUnique({
    where: { slug }
  });

  if (!existing) {
    return slug;
  }

  // Add random suffix if exists
  const suffix = Math.random().toString(36).substring(2, 7);
  return `${slug}-${suffix}`;
}

/**
 * Publish a crawled article: AI rewrite → Post
 */
export async function publishCrawledArticle(crawlId: string): Promise<string> {
  console.log(`\n[Publisher] Processing crawl ID: ${crawlId}`);

  // 1. Get crawled article
  const crawlArticle = await prisma.crawlArticle.findUnique({
    where: { id: crawlId }
  });

  if (!crawlArticle) {
    throw new Error(`CrawlArticle not found: ${crawlId}`);
  }

  if (crawlArticle.status === 'processed') {
    throw new Error(`Article already processed: ${crawlArticle.title}`);
  }

  console.log(`[Publisher] Title: ${crawlArticle.title}`);
  console.log(`[Publisher] Source: ${crawlArticle.source}`);

  // Extract images from crawled content
  const imageUrls = extractImagesFromHtml(crawlArticle.content);
  if (imageUrls.length > 0) {
    console.log(`[Publisher] Found ${imageUrls.length} images in original content`);
  }

  // 2. AI Rewrite
  console.log('[Publisher] Calling AI to rewrite...');
  const rewriteOutput: RewriteOutput = await rewriteArticle({
    title: crawlArticle.title,
    content: crawlArticle.content,
    description: crawlArticle.description || undefined,
    source: crawlArticle.source,
    imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
  });

  console.log(`[Publisher] AI output - Title: ${rewriteOutput.title}`);
  console.log(`[Publisher] AI output - Category: ${rewriteOutput.categorySuggestion}`);
  if (rewriteOutput.content.includes('<img')) {
    console.log(`[Publisher] ✓ AI embedded images in content`);
  }

  // 3. Get category
  const categoryId = await getCategoryId(rewriteOutput.categorySuggestion);

  // 4. Generate slug
  const slug = await generateUniqueSlug(rewriteOutput.title);
  console.log(`[Publisher] Generated slug: ${slug}`);

  // 5. Get image - check if accessible, fallback to Unsplash if not
  let finalImageUrl = crawlArticle.mainImage || '/placeholder.jpg';
  
  // Check if main image is accessible
  if (crawlArticle.mainImage && crawlArticle.mainImage !== '/placeholder.jpg') {
    console.log('[Publisher] Checking main image accessibility...');
    const isAccessible = await isImageAccessible(crawlArticle.mainImage);
    
    if (!isAccessible) {
      console.log('[Publisher] Main image not accessible, using Unsplash fallback...');
      finalImageUrl = await getArticleImage(
        rewriteOutput.title,
        rewriteOutput.content,
        crawlArticle.id,
        undefined
      );
    } else {
      console.log('[Publisher] Main image is accessible');
    }
  } else {
    console.log('[Publisher] No main image found, using Unsplash fallback...');
    finalImageUrl = await getArticleImage(
      rewriteOutput.title,
      rewriteOutput.content,
      crawlArticle.id,
      undefined
    );
  }

  console.log(`[Publisher] Final image: ${finalImageUrl}`);

  // 6. Replace broken images in content with Unsplash
  let processedContent = rewriteOutput.content;
  const imgMatches = Array.from(processedContent.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi));
  
  if (imgMatches.length > 0) {
    console.log(`[Publisher] Checking ${imgMatches.length} images in content...`);
    
    for (const match of imgMatches) {
      const imgTag = match[0];
      const imgUrl = match[1];
      
      if (imgUrl.startsWith('http://') || imgUrl.startsWith('https://')) {
        const isAccessible = await isImageAccessible(imgUrl);
        
        if (!isAccessible) {
          console.log(`[Publisher] Replacing broken image: ${imgUrl.substring(0, 60)}...`);
          
          // Get replacement image from Unsplash
          const replacementUrl = await getArticleImage(
            rewriteOutput.title,
            rewriteOutput.content,
            crawlArticle.id,
            'content'
          );
          
          // Replace the src in the img tag
          const newImgTag = imgTag.replace(imgUrl, replacementUrl);
          processedContent = processedContent.replace(imgTag, newImgTag);
        }
      }
    }
  }

  // 7. Enrich content with images (if content has few images)
  let enrichedContent = processedContent;
  
  const existingImageCount = (enrichedContent.match(/<img/gi) || []).length;
  if (existingImageCount < 2) {
    console.log(`[Publisher] Content has only ${existingImageCount} images, enriching...`);
    enrichedContent = await enrichContentWithImages(
      enrichedContent,
      crawlArticle.id,
      3 // Max 3 images total in content
    );
  } else {
    console.log(`[Publisher] Content already has ${existingImageCount} images, skipping enrichment`);
  }

  // 8. Create Post
  const post = await prisma.post.create({
    data: {
      slug,
      title: rewriteOutput.title,
      description: rewriteOutput.description,
      content: enrichedContent, // Use enriched content with images
      main_img: finalImageUrl,
      image: null,  // Optional: extract images from content
      toc: rewriteOutput.toc as any,
      source: crawlArticle.source, // Save source (vnexpress, tuoitre, tapchibitcoin)
      categoryId,
    },
  });

  console.log(`[Publisher] ✓ Published post ID: ${post.id}`);

  // 9. Mark crawl as processed
  await prisma.crawlArticle.update({
    where: { id: crawlId },
    data: { status: 'processed' }
  });

  return post.id;
}

/**
 * Batch publish pending articles
 */
export async function publishPendingArticles(limit = 10): Promise<number> {
  const pending = await prisma.crawlArticle.findMany({
    where: { status: 'pending' },
    take: limit,
    orderBy: { createdAt: 'desc' }
  });

  console.log(`\n[Publisher] Found ${pending.length} pending articles`);

  let successCount = 0;
  let errorCount = 0;

  for (const article of pending) {
    try {
      await publishCrawledArticle(article.id);
      successCount++;
      
      // Delay 8 seconds to avoid rate limit (12,000 tokens/min ≈ 1 request/8s)
      if (pending.indexOf(article) < pending.length - 1) {
        console.log('[Publisher] Waiting 8s to avoid rate limit...\n');
        await new Promise(resolve => setTimeout(resolve, 8000));
      }
    } catch (error) {
      console.error(`[Publisher] Error publishing ${article.title}:`, error);
      errorCount++;
      
      // Mark as rejected
      await prisma.crawlArticle.update({
        where: { id: article.id },
        data: { status: 'rejected' }
      });
    }
  }

  console.log(`\n[Publisher] Batch complete - Success: ${successCount}, Errors: ${errorCount}`);
  return successCount;
}
