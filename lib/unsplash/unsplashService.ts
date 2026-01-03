// lib/unsplash/unsplashService.ts
import { prisma } from '@/lib/prisma';

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || '';
const UNSPLASH_API = 'https://api.unsplash.com';

interface UnsplashPhoto {
  id: string;
  urls: {
    regular: string;
    small: string;
  };
  user: {
    name: string;
    links: {
      html: string;
    };
  };
  blur_hash: string;
  links: {
    download_location: string;
  };
}

/**
 * Translate Vietnamese crypto terms to English for Unsplash search
 */
function translateToEnglish(text: string): string {
  const translations: Record<string, string> = {
    // General crypto terms
    'tiền điện tử': 'cryptocurrency',
    'tiền mã hóa': 'cryptocurrency',
    'tiền số': 'digital currency',
    'crypto': 'cryptocurrency',
    
    // Specific coins
    'bitcoin': 'bitcoin',
    'ethereum': 'ethereum',
    'btc': 'bitcoin',
    'eth': 'ethereum',
    
    // Market terms
    'thị trường': 'crypto market',
    'tăng trưởng': 'crypto growth',
    'giảm giá': 'market crash',
    'tăng giá': 'bull market',
    'phân tích': 'crypto analysis',
    'dự đoán': 'crypto forecast',
    'xu hướng': 'crypto trend',
    
    // Technology
    'blockchain': 'blockchain technology',
    'công nghệ': 'blockchain technology',
    'kỹ thuật': 'technical analysis',
    
    // Trading
    'giao dịch': 'crypto trading',
    'đầu tư': 'crypto investment',
    'mua bán': 'crypto exchange',
    'sàn giao dịch': 'crypto exchange',
    
    // DeFi & NFT
    'defi': 'decentralized finance',
    'nft': 'nft art',
    'token': 'crypto token',
    
    // News/Events
    'tin tức': 'cryptocurrency news',
    'sự kiện': 'crypto event',
    'pháp lý': 'crypto regulation',
    'luật': 'crypto law',
  };
  
  const lowerText = text.toLowerCase();
  
  // Try exact match first
  for (const [vn, en] of Object.entries(translations)) {
    if (lowerText.includes(vn)) {
      return translations[vn];
    }
  }
  
  // If contains crypto-related words, return generic crypto term
  if (lowerText.match(/bitcoin|ethereum|crypto|blockchain|defi|nft/i)) {
    return 'cryptocurrency';
  }
  
  // Default fallback
  return 'bitcoin blockchain';
}

/**
 * Extract and translate keywords from article content
 */
export function extractKeywords(title: string, content: string): string[] {
  const keywords: string[] = [];
  
  // 1. Translate title
  const translatedTitle = translateToEnglish(title);
  keywords.push(translatedTitle);
  
  // 2. Extract and translate H2 headings (max 3)
  const h2Regex = /<h2[^>]*>(.*?)<\/h2>/gi;
  let match;
  let h2Count = 0;
  while ((match = h2Regex.exec(content)) !== null && h2Count < 3) {
    const heading = match[1].replace(/<[^>]*>/g, '').trim();
    if (heading.length > 3 && heading.length < 100) {
      const translated = translateToEnglish(heading);
      keywords.push(translated);
      h2Count++;
    }
  }
  
  // 3. Always include general crypto keywords as fallback
  keywords.push('cryptocurrency market');
  keywords.push('bitcoin blockchain');
  keywords.push('crypto trading');
  
  // Return unique keywords
  return Array.from(new Set(keywords)).slice(0, 6);
}

/**
 * Search Unsplash for photos by keyword
 */
async function searchUnsplashPhotos(keyword: string, page = 1): Promise<UnsplashPhoto[]> {
  try {
    const response = await fetch(
      `${UNSPLASH_API}/search/photos?query=${encodeURIComponent(keyword)}&per_page=10&page=${page}&order_by=relevant`,
      {
        headers: {
          'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('[Unsplash] Search error:', error);
    return [];
  }
}

/**
 * Get random photo by query
 */
async function getRandomUnsplashPhoto(keyword: string): Promise<UnsplashPhoto | null> {
  try {
    const response = await fetch(
      `${UNSPLASH_API}/photos/random?query=${encodeURIComponent(keyword)}&orientation=landscape`,
      {
        headers: {
          'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('[Unsplash] Random photo error:', error);
    return null;
  }
}

/**
 * Track download (required by Unsplash guidelines)
 */
async function trackDownload(downloadLocation: string): Promise<void> {
  try {
    await fetch(downloadLocation, {
      headers: {
        'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
      }
    });
  } catch (error) {
    console.error('[Unsplash] Track download error:', error);
  }
}

/**
 * Check if photo ID already exists in database
 */
async function isPhotoUsed(unsplashId: string): Promise<boolean> {
  const existing = await prisma.unsplashImage.findUnique({
    where: { unsplashId }
  });
  return !!existing;
}

/**
 * Save photo to database
 */
async function saveUnsplashImage(
  photo: UnsplashPhoto,
  keyword: string,
  articleId: string,
  position: 'title' | 'heading' | 'content'
) {
  return await prisma.unsplashImage.create({
    data: {
      unsplashId: photo.id,
      imageUrl: photo.urls.regular,
      thumbnailUrl: photo.urls.small,
      photographer: photo.user.name,
      photographerUrl: photo.user.links.html,
      keywordUsed: keyword,
      articleId,
      position,
      blurHash: photo.blur_hash,
    }
  });
}

/**
 * Find unique photo from Unsplash (not already in DB)
 */
async function findUniquePhoto(keyword: string, maxPages = 3): Promise<UnsplashPhoto | null> {
  // Try regular search with pagination
  for (let page = 1; page <= maxPages; page++) {
    const photos = await searchUnsplashPhotos(keyword, page);
    
    for (const photo of photos) {
      const isUsed = await isPhotoUsed(photo.id);
      if (!isUsed) {
        return photo;
      }
    }
    
    // Small delay between pages
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // If all photos are used, try random
  console.log(`[Unsplash] All search results used, trying random for: ${keyword}`);
  const randomPhoto = await getRandomUnsplashPhoto(keyword);
  
  if (randomPhoto && !(await isPhotoUsed(randomPhoto.id))) {
    return randomPhoto;
  }
  
  return null;
}

/**
 * Get image for article with fallback to Unsplash
 */
export async function getArticleImage(
  title: string,
  content: string,
  articleId: string,
  existingImageUrl?: string
): Promise<string> {
  // If already has image, return it
  if (existingImageUrl && existingImageUrl !== '/placeholder.jpg') {
    return existingImageUrl;
  }
  
  console.log('[Unsplash] No image found, searching Unsplash...');
  
  // Extract keywords
  const keywords = extractKeywords(title, content);
  console.log(`[Unsplash] Extracted keywords:`, keywords);
  
  // Try each keyword until we find a unique photo
  for (const keyword of keywords) {
    console.log(`[Unsplash] Searching for: ${keyword}`);
    
    const photo = await findUniquePhoto(keyword);
    
    if (photo) {
      console.log(`[Unsplash] Found unique photo: ${photo.id} by ${photo.user.name}`);
      
      // Track download
      await trackDownload(photo.links.download_location);
      
      // Save to database
      await saveUnsplashImage(photo, keyword, articleId, 'title');
      
      console.log(`[Unsplash] ✓ Using: ${photo.urls.regular}`);
      return photo.urls.regular;
    }
    
    // Small delay between keyword attempts
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('[Unsplash] ⚠️ Could not find unique photo, using placeholder');
  return '/placeholder.jpg';
}

/**
 * Enhance content with Unsplash images for H2 sections
 */
export async function enrichContentWithImages(
  content: string,
  articleId: string,
  maxImages = 3
): Promise<string> {
  // Check if content already has images
  const existingImages = (content.match(/<img/gi) || []).length;
  
  if (existingImages >= maxImages) {
    console.log(`[Unsplash] Content already has ${existingImages} images, skipping enrichment`);
    return content;
  }
  
  console.log(`[Unsplash] Enriching content with images (current: ${existingImages})...`);
  
  // Extract H2 headings as insertion points
  const h2Regex = /<h2[^>]*>(.*?)<\/h2>/gi;
  const headings: Array<{text: string, fullMatch: string}> = [];
  let match;
  
  while ((match = h2Regex.exec(content)) !== null) {
    const text = match[1].replace(/<[^>]*>/g, '').trim();
    headings.push({ text, fullMatch: match[0] });
  }
  
  if (headings.length === 0) {
    console.log('[Unsplash] No H2 headings found, skipping enrichment');
    return content;
  }
  
  console.log(`[Unsplash] Found ${headings.length} H2 headings`);
  
  let enrichedContent = content;
  let imagesAdded = 0;
  const targetImages = Math.min(maxImages - existingImages, headings.length);
  
  // Add images after selected H2 headings
  for (let i = 0; i < headings.length && imagesAdded < targetImages; i++) {
    const heading = headings[i];
    const keyword = heading.text.toLowerCase().trim();
    
    if (keyword.length < 5) continue; // Skip very short headings
    
    console.log(`[Unsplash] Searching image for heading: "${keyword}"`);
    
    const photo = await findUniquePhoto(keyword);
    
    if (photo) {
      // Track download
      await trackDownload(photo.links.download_location);
      
      // Save to database
      await saveUnsplashImage(photo, keyword, articleId, 'heading');
      
      // Create image HTML with Vietnamese caption (capitalize first letter)
      const description = heading.text.charAt(0).toUpperCase() + heading.text.slice(1);
      const caption = `${description} | Nguồn: Unsplash`;
      const imageHtml = `
    <figure class="my-6">
    <img src="${photo.urls.regular}" alt="${keyword}" class="w-full rounded-lg shadow-lg" loading="lazy" />
    <figcaption class="text-sm text-gray-500 mt-2 text-center italic">
        ${caption}
    </figcaption>
    </figure>`;
      
      // Insert image after the H2 heading
      enrichedContent = enrichedContent.replace(
        heading.fullMatch,
        heading.fullMatch + imageHtml
      );
      
      imagesAdded++;
      console.log(`[Unsplash] ✓ Added image ${imagesAdded}/${targetImages} for: "${keyword}"`);
      
      // Delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log(`[Unsplash] ✓ Enrichment complete: ${imagesAdded} images added`);
  return enrichedContent;
}

/**
 * Get attribution text for Unsplash image
 */
export async function getImageAttribution(imageUrl: string): Promise<string | null> {
  const image = await prisma.unsplashImage.findFirst({
    where: { imageUrl }
  });
  
  if (!image) return null;
  
  return `Photo by <a href="${image.photographerUrl}?utm_source=crypto_news&utm_medium=referral" target="_blank" rel="noopener noreferrer">${image.photographer}</a> on <a href="https://unsplash.com?utm_source=crypto_news&utm_medium=referral" target="_blank" rel="noopener noreferrer">Unsplash</a>`;
}
