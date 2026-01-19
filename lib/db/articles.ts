import { prisma } from "@/lib/db/index";
import { Article as UIArticle } from "@/types";
import { Prisma } from "@prisma/client";

// Define the shape of the data returned by Prisma with our include
const articleWithRelations = Prisma.validator<Prisma.ArticleDefaultArgs>()({
  include: {
    categories: {
      select: {
        name: true,
        slug: true,
      },
    },
    stats: {
      select: {
        views: true,
        likes: true,
      },
    },
  },
});

type ArticleWithRelations = Prisma.ArticleGetPayload<typeof articleWithRelations>;

const commonInclude = {
  categories: {
    select: {
      name: true,
      slug: true,
    },
  },
  stats: {
    select: {
      views: true,
      likes: true,
    },
  },
};

export async function getArticlesByCategory(slug: string, limit: number) {
  return prisma.article.findMany({
    where: { categories: { some: { slug } } },
    take: limit,
    orderBy: { createdAt: "desc" },
    include: commonInclude,
  });
}

export async function getTopViewedArticles(limit: number) {
  return prisma.article.findMany({
    take: limit,
    orderBy: { stats: { views: "desc" } },
    include: commonInclude,
  });
}

export async function getTopLikedArticles(limit: number) {
  return prisma.article.findMany({
    take: limit,
    orderBy: { stats: { likes: "desc" } },
    include: commonInclude,
  });
}

export async function getRecentArticles(limit: number) {
  return prisma.article.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: commonInclude,
  });
}

export function mapToUIArticle(article: ArticleWithRelations): UIArticle {
  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    thumbnail: article.thumbnail || "/placeholder.jpg",
    createdAt: article.createdAt,
    categories: article.categories.map((c) => ({
      name: c.name,
      slug: c.slug,
    })),
    stats: article.stats
      ? {
          views: article.stats.views,
          likes: article.stats.likes,
        }
      : null,
  };
}
