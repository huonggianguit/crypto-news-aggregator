"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export interface BlogPost {
  id: string;
  image: string;
  category: string;
  date: string;
  title: string;
  shortContent: string;
  slug: string;
}

interface BlogPageProps {
  tab: string;
  subtab: string;
  title?: string;
  posts: BlogPost[];
  headerImage?: string;
}

function BlogPage({ tab, subtab, title, posts, headerImage }: BlogPageProps) {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("Mới nhất");

  const featuredPost = posts[0];
  const legalDocuments = posts.slice(1, 5);
  const marketNews = posts.slice(5, 7);
  const recentUpdates = posts.slice(7, 10);
  const topViewed = posts.slice(10, 13);

  const trendingTags = [
    "#Bitcoin 2026",
    "#Ethereum",
    "#DeFi",
    "#NFT Market",
    "#Blockchain",
  ];

  const categories = ["Mới nhất", "Tài chính", "Pháp lý", "Doanh nghiệp", "Quốc tế"];

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* ✅ Trending / Nổi bật */}
      <section className="w-full bg-white border-b border-gray-100 pt-32 md:pt-40">
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8 py-6">
          <div className="bg-white rounded-xl shadow-sm p-3 border border-gray-100 flex flex-col md:flex-row items-start md:items-center gap-4">
            {/* Left label */}
            <div className="flex items-center gap-2 text-red-600 font-bold shrink-0 px-2">
              <span className="material-symbols-outlined animate-pulse text-[22px]">
                trending_up
              </span>
              <span className="uppercase text-sm tracking-wider whitespace-nowrap">
                Nổi bật
              </span>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 flex-grow min-w-0 overflow-x-auto pb-1 md:pb-0">
              {trendingTags.map((tag, idx) => (
                <a
                  key={idx}
                  href="#"
                  className="px-3 py-1.5 bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-600 text-xs lg:text-sm font-medium rounded-md transition-colors border border-gray-100 whitespace-nowrap"
                >
                  {tag}
                </a>
              ))}
            </div>

            {/* Right info */}
            <div className="hidden lg:flex items-center gap-1 text-xs text-gray-400 font-medium shrink-0 ml-auto border-l pl-4 border-gray-100">
              <span className="material-symbols-outlined text-[16px]">ads_click</span>
              <span>Cập nhật 5 phút trước</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-grow w-full py-8">
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8 flex flex-col lg:flex-row gap-8">
          {/* Left Content Area */}
          <div className="w-full lg:w-2/3 flex flex-col gap-10">
            {/* Featured Hero Section */}
            {featuredPost && (
              <section 
                className="group relative rounded-2xl overflow-hidden shadow-sm h-[480px] cursor-pointer"
                onClick={() => router.push(`/article/${featuredPost.slug}`)}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url('${featuredPost.image}')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

                <div className="absolute bottom-0 left-0 p-8 md:p-10 w-full md:w-4/5 flex flex-col gap-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-600 text-white text-xs font-bold uppercase tracking-wider rounded-md w-fit">
                    <span className="size-1.5 rounded-full bg-white animate-pulse"></span>
                    Tiêu điểm
                  </span>
                  <h1 className="text-3xl md:text-4xl lg:text-4xl font-bold text-white leading-tight tracking-tight drop-shadow-sm">
                    {featuredPost.title}
                  </h1>
                  <p className="text-gray-200 text-base md:text-lg line-clamp-2 leading-relaxed">
                    {featuredPost.shortContent}
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-white/80 text-sm font-medium flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">schedule</span>{" "}
                      {featuredPost.date}
                    </span>
                    <span className="text-white/80 text-sm font-medium flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">person</span>{" "}
                      Ban biên tập
                    </span>
                  </div>
                </div>
              </section>
            )}

            {/* Thông báo văn bản mới */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-7 bg-red-600 rounded-full"></div>
                  <h2 className="text-2xl font-bold text-gray-900">Thông báo văn bản mới</h2>
                </div>
                <a
                  className="text-red-600 font-semibold text-sm flex items-center gap-1 hover:underline"
                  href="#"
                >
                  Xem tất cả{" "}
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {legalDocuments.map((post) => (
                  <div
                    key={post.id}
                    className="bg-white p-5 rounded-xl border border-gray-100 hover:shadow-lg transition-shadow duration-300 flex gap-4 items-start group cursor-pointer"
                    onClick={() => router.push(`/article/${post.slug}`)}
                  >
                    <div className="shrink-0 size-12 bg-red-50 text-red-600 rounded-lg flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-colors">
                      <span className="material-symbols-outlined">description</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg leading-snug group-hover:text-red-600 transition-colors">
                        {post.title.substring(0, 40)}
                      </h3>
                      <p className="text-gray-500 text-sm mt-1 mb-2">
                        Ban hành ngày: {post.date}
                      </p>
                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                        {post.shortContent}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Tin tức thị trường */}
            <section>
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-7 bg-red-600 rounded-full"></div>
                    <h2 className="text-2xl font-bold text-gray-900">Tin tức thị trường</h2>
                  </div>
                  <a
                    className="text-red-600 font-semibold text-sm flex items-center gap-1 hover:underline"
                    href="#"
                  >
                    Xem tất cả{" "}
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </a>
                </div>

                {/* Filter Tabs */}
                <div className="bg-white p-2 rounded-xl border border-gray-200 flex flex-wrap gap-3 items-center justify-between shadow-sm">
                  <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 min-w-0">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                          activeCategory === cat
                            ? "bg-red-600/10 text-red-600"
                            : "hover:bg-gray-50 text-gray-600"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center border-l border-gray-200 pl-2 ml-auto sm:ml-0 gap-1">
                    <button className="flex items-center gap-1 px-3 py-2 text-gray-500 hover:text-red-600 text-sm font-medium transition-colors rounded-lg hover:bg-gray-50">
                      <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                      <span className="hidden sm:inline">Thời gian</span>
                    </button>
                    <button className="flex items-center gap-1 px-3 py-2 text-gray-500 hover:text-red-600 text-sm font-medium transition-colors rounded-lg hover:bg-gray-50">
                      <span className="material-symbols-outlined text-[18px]">tune</span>
                      <span className="hidden sm:inline">Lọc</span>
                    </button>
                  </div>
                </div>

                {/* News Grid */}
                <div className="grid grid-cols-1 gap-6">
                  {marketNews.map((post) => (
                    <article
                      key={post.id}
                      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col sm:flex-row h-auto sm:h-48 group cursor-pointer"
                      onClick={() => router.push(`/article/${post.slug}`)}
                    >
                      <div className="sm:w-1/3 h-48 sm:h-auto overflow-hidden">
                        <div
                          className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                          style={{ backgroundImage: `url('${post.image}')` }}
                        />
                      </div>
                      <div className="p-6 flex flex-col justify-center sm:w-2/3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-red-600 text-xs font-bold uppercase">
                            {post.category}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                          <span className="text-gray-400 text-xs">{post.date}</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight group-hover:text-red-600 transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                          {post.shortContent}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          </div>

          {/* Right Sidebar */}
          <aside className="w-full lg:w-1/3 flex flex-col gap-8">
            {/* Tiện ích nhanh */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-3">
                Tiện ích nhanh
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <a
                  className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-gray-50 hover:bg-orange-50 hover:text-orange-600 transition-colors group text-center"
                  href="#"
                >
                  <span className="material-symbols-outlined text-3xl text-gray-400 group-hover:text-orange-600">
                    trending_up
                  </span>
                  <span className="text-sm font-semibold">Theo dõi giá Coin</span>
                </a>
                <a
                  className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-gray-50 hover:bg-orange-50 hover:text-orange-600 transition-colors group text-center"
                  href="#"
                >
                  <span className="material-symbols-outlined text-3xl text-gray-400 group-hover:text-orange-600">
                    currency_exchange
                  </span>
                  <span className="text-sm font-semibold">Chuyển đổi tiền tệ</span>
                </a>
                <a
                  className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-gray-50 hover:bg-orange-50 hover:text-orange-600 transition-colors group text-center"
                  href="#"
                >
                  <span className="material-symbols-outlined text-3xl text-gray-400 group-hover:text-orange-600">
                    calculate
                  </span>
                  <span className="text-sm font-semibold">Tính lãi/lỗ</span>
                </a>
                <a
                  className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-gray-50 hover:bg-red-50 hover:text-red-600 transition-colors group text-center"
                  href="#"
                >
                  <span className="material-symbols-outlined text-3xl text-gray-400 group-hover:text-red-600">
                    download
                  </span>
                  <span className="text-sm font-semibold">Tải biểu mẫu</span>
                </a>
              </div>
            </div>

            {/* Mới cập nhật */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                <span className="material-symbols-outlined text-red-600">feed</span>
                Mới cập nhật
              </h3>
              <div className="flex flex-col gap-5">
                {recentUpdates.map((post) => (
                  <div
                    key={post.id}
                    className="flex gap-3 group cursor-pointer"
                    onClick={() => router.push(`/article/${post.slug}`)}
                  >
                    <div className="shrink-0 w-20 h-20 rounded-lg overflow-hidden">
                      <div
                        className="w-full h-full bg-cover bg-center group-hover:scale-110 transition-transform duration-300"
                        style={{ backgroundImage: `url('${post.image}')` }}
                      />
                    </div>
                    <div className="flex flex-col justify-between">
                      <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug group-hover:text-red-600 transition-colors">
                        {post.title}
                      </h4>
                      <span className="text-xs text-gray-400">{post.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quảng cáo */}
            <div className="rounded-2xl overflow-hidden relative h-64 shadow-sm group cursor-pointer">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url('${featuredPost?.image}')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 opacity-90"></div>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 text-white">
                <span className="text-yellow-300 font-bold uppercase tracking-widest text-xs mb-2">
                  Quảng cáo
                </span>
                <h3 className="text-2xl font-bold mb-3">Crypto Academy 2026</h3>
                <p className="text-sm text-white/90 mb-6">
                  Học trading chuyên nghiệp với các chuyên gia hàng đầu. Ưu đãi 50% khóa học.
                </p>
                <button className="bg-white text-orange-600 px-6 py-2.5 rounded-full font-bold text-sm hover:bg-gray-100 transition-colors">
                  Tìm hiểu ngay
                </button>
              </div>
            </div>

            {/* Xem nhiều nhất */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                <span className="material-symbols-outlined text-red-600">trending_up</span>
                Xem nhiều nhất
              </h3>
              <div className="flex flex-col gap-4">
                {topViewed.map((post, index) => (
                  <div
                    key={post.id}
                    className="flex gap-4 items-start group cursor-pointer border-b border-gray-50 pb-4 last:border-0 last:pb-0"
                    onClick={() => router.push(`/article/${post.slug}`)}
                  >
                    <span className="text-4xl font-black text-gray-400 group-hover:text-red-600 transition-colors leading-none">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 leading-snug group-hover:text-red-600 transition-colors">
                        {post.title.substring(0, 50)}...
                      </h4>
                      <span className="text-xs text-gray-400 mt-1 block">{post.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default BlogPage;
