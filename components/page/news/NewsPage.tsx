"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock, Eye, Heart, ArrowDownCircle } from "lucide-react";
import FeaturedSlider from "@/components/FeaturedSlider";
import Sidebar from "@/components/Sidebar";
import { Article } from "@/types";
import { motion } from "framer-motion";

interface NewsPageProps {
  category: { name: string; slug: string };
  articles: Article[];
  sliderArticles: Article[];
  topViewedArticles: Article[];
  topLikedArticles: Article[];
}

export default function NewsPage({
  category,
  articles,
  sliderArticles,
  topViewedArticles,
  topLikedArticles,
}: NewsPageProps) {
  const [displayCount, setDisplayCount] = useState(8);
  const displayedArticles = articles.slice(0, displayCount);
  const hasMore = displayCount < articles.length;

  const loadMore = () => {
    setDisplayCount(prev => Math.min(prev + 8, articles.length));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <main className="max-w-[1400px] mx-auto px-4 lg:px-8 pt-40 pb-16">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white text-center mb-10 tracking-tight">
          {category.name}
        </h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column: Featured Slider + Article Grid */}
          <div className="flex-1 min-w-0">
            {/* Featured Slider */}
            <FeaturedSlider articles={sliderArticles} />

            {/* Article List (Grid) */}
            <section className="mt-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-8 w-1.5 bg-orange-500 rounded-full"/>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Bài viết</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {displayedArticles.map((article, idx) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
              >
                <Link href={`/article/${article.slug}`} className="group flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-100 dark:border-slate-800 transition-all duration-300 hover:-translate-y-1">
                  <div className="relative w-full aspect-[16/10] overflow-hidden">
                    <Image
                      src={article.thumbnail || "/placeholder.jpg"}
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded-md">
                        {category.name}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(article.createdAt).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white leading-snug group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors mb-3 line-clamp-3">
                      {article.title}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 flex-1">
                      {article.excerpt}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-4 mt-auto">
                        {article.stats?.views !== undefined && (
                          <span className="flex items-center gap-1">
                            <Eye size={12} /> {article.stats.views.toLocaleString()}
                          </span>
                        )}
                        {article.stats?.likes !== undefined && (
                          <span className="flex items-center gap-1">
                             <Heart size={12} /> {article.stats.likes.toLocaleString()}
                          </span>
                        )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
              </div>

              {/* Load More Button */}
              {hasMore && (
                <div className="flex justify-center">
                  <button
                    onClick={loadMore}
                    className="flex items-center gap-2 px-8 py-3 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-full border border-slate-200 dark:border-slate-700 hover:border-orange-500 hover:text-orange-600 dark:hover:text-orange-400 hover:shadow-lg transition-all"
                  >
                    <ArrowDownCircle size={20} />
                    Xem thêm ({articles.length - displayCount} bài còn lại)
                  </button>
                </div>
              )}
            </section>
          </div>

          {/* Right Column: Sidebar */}
          <div className="w-full lg:w-[380px] flex-shrink-0">
            <Sidebar
              topViewedArticles={topViewedArticles}
              topLikedArticles={topLikedArticles}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
