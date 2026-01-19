// app/article/[slug]/page.tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/index";
import { ArticlePage } from "@/components/page/ArticlePage";
import type { Metadata } from "next";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

// SEO Metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const article = await prisma.article.findUnique({
    where: { slug },
    select: {
      title: true,
      excerpt: true,
      thumbnail: true,
    },
  });

  if (!article) {
    return { title: "Không tìm thấy bài viết" };
  }

  return {
    title: `${article.title} - Crypto News`,
    description: article.excerpt || "",
    openGraph: {
      title: article.title,
      description: article.excerpt || "",
      images: article.thumbnail ? [article.thumbnail] : [],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt || "",
      images: article.thumbnail ? [article.thumbnail] : [],
    },
  };
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const { slug } = await params;

  // Fetch article with all relations
  const article = await prisma.article.findUnique({
    where: { slug },
    include: {
      categories: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      stats: true,
      comments: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });

  if (!article) {
    notFound();
  }

  // Fetch related articles from same categories
  const categoryIds = article.categories.map((c) => c.id);
  const relatedArticles = await prisma.article.findMany({
    where: {
      slug: { not: slug },
      categories: {
        some: {
          id: { in: categoryIds },
        },
      },
    },
    select: {
      id: true,
      slug: true,
      title: true,
      thumbnail: true,
      excerpt: true,
      createdAt: true,
      categories: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  // Transform data for component
  const articleData = {
    id: article.id,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    content: article.content,
    thumbnail: article.thumbnail,
    sourceUrl: article.sourceUrl,
    tags: article.tags,
    createdAt: article.createdAt.toISOString(),
    updatedAt: article.updatedAt.toISOString(),
    toc: article.toc,
    categories: article.categories,
    stats: article.stats
      ? {
          views: article.stats.views,
          likes: article.stats.likes,
          unlikes: article.stats.unlikes,
          comments: article.stats.comments,
        }
      : null,
    comments: article.comments.map((c) => ({
      id: c.id,
      content: c.content,
      rating: c.rating,
      createdAt: c.createdAt.toISOString(),
      user: c.user,
    })),
  };

  const relatedData = relatedArticles.map((a) => ({
    id: a.id,
    slug: a.slug,
    title: a.title,
    thumbnail: a.thumbnail,
    excerpt: a.excerpt,
    createdAt: a.createdAt.toISOString(),
    categories: a.categories,
  }));

  return <ArticlePage article={articleData} relatedArticles={relatedData} />;
}
