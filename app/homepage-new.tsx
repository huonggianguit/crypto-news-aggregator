// app/page.tsx
import { prisma } from '@/lib/prisma';
import NewsCard from '@/components/NewsCard';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tin Tức Crypto Mới Nhất | Crypto News Hub',
  description: 'Cập nhật tin tức Bitcoin, Ethereum, altcoin và thị trường tiền mã hóa mới nhất. Phân tích chuyên sâu về blockchain, DeFi, NFT.',
  keywords: 'crypto, bitcoin, ethereum, blockchain, defi, nft, tiền mã hóa, tiền điện tử',
  openGraph: {
    title: 'Tin Tức Crypto Mới Nhất',
    description: 'Cập nhật tin tức Bitcoin, Ethereum và thị trường crypto mới nhất',
    type: 'website',
  },
};

export const revalidate = 300; // Revalidate every 5 minutes

async function getLatestPosts() {
  return prisma.post.findMany({
    include: {
      category: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 13, // 1 featured + 12 latest
  });
}

async function getTrendingCategories() {
  const categories = await prisma.category.findMany({
    where: {
      posts: {
        some: {},
      },
    },
    include: {
      _count: {
        select: { posts: true },
      },
    },
    orderBy: {
      posts: {
        _count: 'desc',
      },
    },
    take: 6,
  });
  
  return categories;
}

export default async function Home() {
  const [posts, categories] = await Promise.all([
    getLatestPosts(),
    getTrendingCategories(),
  ]);
  
  const featuredPost = posts[0];
  const latestPosts = posts.slice(1);
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section - Featured News */}
      <section className="bg-gradient-to-br from-blue-600 to-purple-700 text-white py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                Tin Tức Crypto Mới Nhất
              </h1>
              <p className="text-xl md:text-2xl text-blue-100">
                Cập nhật từ thị trường Bitcoin, Ethereum và Blockchain
              </p>
            </div>
            
            {featuredPost && (
              <div className="mt-8">
                <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">
                  🔥 Tin Nổi Bật
                </h2>
                <NewsCard
                  slug={featuredPost.slug}
                  title={featuredPost.title}
                  description={featuredPost.description || undefined}
                  main_img={featuredPost.main_img}
                  createdAt={featuredPost.createdAt}
                  category={featuredPost.category ? {
                    name: featuredPost.category.name,
                    slug: featuredPost.category.slug,
                  } : undefined}
                  variant="featured"
                />
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* Categories Bar */}
      {categories.length > 0 && (
        <section className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-4">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((cat) => (
                <Link key={cat.id} href={`/${cat.slug}`}>
                  <span className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-semibold hover:bg-blue-600 hover:text-white transition-colors">
                    {cat.name} ({cat._count.posts})
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
      
      {/* Latest News Grid */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                📰 Tin Mới Nhất
              </h2>
              
              <Link href="/archive">
                <span className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                  Xem tất cả →
                </span>
              </Link>
            </div>
            
            {latestPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {latestPosts.map((post: any) => (
                  <NewsCard
                    key={post.id}
                    slug={post.slug}
                    title={post.title}
                    description={post.description || undefined}
                    main_img={post.main_img}
                    createdAt={post.createdAt}
                    category={post.category ? {
                      name: post.category.name,
                      slug: post.category.slug,
                    } : undefined}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-xl text-gray-600 dark:text-gray-400">
                  Chưa có bài viết nào. Hệ thống đang tự động crawl...
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Đừng Bỏ Lỡ Tin Tức Crypto
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Hệ thống tự động cập nhật tin mới mỗi 30 phút
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/tin-tuc">
              <button className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Xem Tin Tức
              </button>
            </Link>
            <Link href="/phan-tich">
              <button className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                Phân Tích Thị Trường
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
