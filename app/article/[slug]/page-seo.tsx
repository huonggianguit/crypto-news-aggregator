// app/article/[slug]/page-new.tsx
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import PostDetail from '@/components/PostDetail';

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

/**
 * Generate dynamic metadata for SEO
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  
  const post = await prisma.post.findUnique({
    where: { slug },
    include: { category: true },
  });
  
  if (!post) {
    return {
      title: 'Không tìm thấy bài viết',
    };
  }
  
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://crypto-news.com';
  const articleUrl = `${baseUrl}/article/${post.slug}`;
  
  return {
    title: `${post.title} | Crypto News Hub`,
    description: post.description || `Đọc bài viết: ${post.title}`,
    keywords: `crypto, bitcoin, ethereum, ${post.category?.name}, ${post.title}`,
    authors: [{ name: 'Crypto News Hub' }],
    
    // Open Graph
    openGraph: {
      title: post.title,
      description: post.description || undefined,
      url: articleUrl,
      siteName: 'Crypto News Hub',
      images: [
        {
          url: post.main_img,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      locale: 'vi_VN',
      type: 'article',
      publishedTime: post.createdAt.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: ['Crypto News Hub'],
      tags: post.category ? [post.category.name] : undefined,
    },
    
    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description || undefined,
      images: [post.main_img],
    },
    
    // Structured Data (JSON-LD) - for Google Rich Results
    other: {
      'article:published_time': post.createdAt.toISOString(),
      'article:modified_time': post.updatedAt.toISOString(),
      'article:author': 'Crypto News Hub',
      'article:section': post.category?.name,
    },
  };
}

/**
 * Generate static paths for static generation (optional)
 */
export async function generateStaticParams() {
  const posts = await prisma.post.findMany({
    select: { slug: true },
    take: 100, // Generate first 100 posts statically
  });
  
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

/**
 * Article Detail Page
 */
export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  
  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      category: true,
    },
  });
  
  if (!post) {
    notFound();
  }
  
  // Get related posts (same category, excluding current)
  const relatedPosts = await prisma.post.findMany({
    where: {
      categoryId: post.categoryId,
      id: { not: post.id },
    },
    select: {
      slug: true,
      title: true,
      main_img: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 3,
  });
  
  // JSON-LD Structured Data for Google
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: post.title,
    description: post.description,
    image: post.main_img,
    datePublished: post.createdAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: {
      '@type': 'Organization',
      name: 'Crypto News Hub',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Crypto News Hub',
      logo: {
        '@type': 'ImageObject',
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${process.env.NEXT_PUBLIC_SITE_URL}/article/${post.slug}`,
    },
  };
  
  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* Article Content */}
      <PostDetail
        title={post.title}
        description={post.description || undefined}
        content={post.content || '<p>Nội dung đang được cập nhật...</p>'}
        main_img={post.main_img}
        createdAt={post.createdAt}
        category={post.category ? {
          name: post.category.name,
          slug: post.category.slug,
        } : {
          name: 'Tin tức',
          slug: 'tin-tuc',
        }}
        relatedPosts={relatedPosts}
      />
    </>
  );
}

// Revalidate every 10 minutes
export const revalidate = 600;
