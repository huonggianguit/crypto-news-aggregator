// app/[slug]/page.tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/index";
import { Article } from "@/types";

// Components
import WalletPage from "@/components/page/WalletPage";
import LearningResourcePage from "@/components/page/knowledge/LearningResourcePage";
import ToolsPage from "@/components/page//knowledge/ToolsPage";
import NewsCategoryPage from "@/components/page//news/NewsPage";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  
  const staticPageTitles: { [key: string]: string } = {
    'van-ban-phap-ly': "Văn bản Pháp lý - Crypto News",
    'quan-ly-vi': "Quản lý ví - Crypto News",
    'tai-nguyen-hoc-tap': "Tài nguyên học tập - Crypto News",
    'khoa-hoc-cong-cu': "Khóa học & Công cụ - Crypto News"
  };

  if (staticPageTitles[slug]) {
    return { title: staticPageTitles[slug] };
  }

  const category = await prisma.category.findUnique({ where: { slug } });
  if (category) {
    return { 
      title: `${category.name} - Crypto News`,
      description: `Tin tức, bài viết và phân tích mới nhất về ${category.name}.`
    };
  }

  return { title: "Không tìm thấy trang" };
}

export default async function SlugPage({ params }: PageProps) {
  const { slug } = await params;

  // --- 1. Static Pages ---
  if (slug === 'quan-ly-vi') return <WalletPage />;
  if (slug === 'tai-nguyen-hoc-tap') return <LearningResourcePage />;
  if (slug === 'khoa-hoc-cong-cu') return <ToolsPage />;

  // --- 2. News Category Pages ---
  // Check if slug matches a news category in DB
  const category = await prisma.category.findUnique({ where: { slug } });
  
  if (category) {
    // Common fields to select
    const commonInclude = {
      categories: {
        select: { name: true, slug: true },
      },
      stats: {
        select: { views: true, likes: true },
      },
    };

    // Fetch data in parallel
    const [sliderRaw, listRaw, topViewedRaw, topLikedRaw] = await Promise.all([
      // Slider: 5 recent articles in this category
      prisma.article.findMany({
        where: { categories: { some: { slug } } },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: commonInclude,
      }),
      // Main List: 20 recent articles in this category
      prisma.article.findMany({
        where: { categories: { some: { slug } } },
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: commonInclude,
      }),
      // Top Viewed (Sidebar)
      prisma.article.findMany({
        where: { categories: { some: { slug } } },
        orderBy: { stats: { views: 'desc' } },
        take: 5,
        include: commonInclude,
      }),
      // Top Liked (Sidebar)
      prisma.article.findMany({
        where: { categories: { some: { slug } } },
        orderBy: { stats: { likes: 'desc' } },
        take: 5,
        include: commonInclude,
      }),
    ]);

    // Mapper function
    const mapArticle = (a: any): Article => ({
      id: a.id,
      slug: a.slug,
      title: a.title,
      excerpt: a.excerpt,
      thumbnail: a.thumbnail || "/placeholder.jpg",
      createdAt: a.createdAt,
      categories: a.categories.map((c: any) => ({
        name: c.name,
        slug: c.slug,
      })),
      stats: a.stats
        ? { views: a.stats.views, likes: a.stats.likes }
        : null,
    });

    return (
      <NewsCategoryPage
        category={{ name: category.name, slug: category.slug }}
        articles={listRaw.map(mapArticle)}
        sliderArticles={sliderRaw.map(mapArticle)}
        topViewedArticles={topViewedRaw.map(mapArticle)}
        topLikedArticles={topLikedRaw.map(mapArticle)}
      />
    );
  }

  // --- 3. If no match, return 404 ---
  notFound();
}
