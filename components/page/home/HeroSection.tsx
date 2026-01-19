"use client";

import Image from "next/image";
import Link from "next/link";
import { Clock, ArrowRight, Flame } from "lucide-react";
import { Article } from "@/types";
import { motion } from "framer-motion";

interface HeroSectionProps {
  heroArticle?: Article;
  featuredArticles: Article[];
}

export default function HeroSection({ heroArticle, featuredArticles }: HeroSectionProps) {
  if (!heroArticle) return null;

  // Filter out the hero article from secondary list just in case
  const sideArticles = featuredArticles.filter(a => a.id !== heroArticle.id).slice(0, 3);

  return (
    <section className="relative pt-32 pb-12 bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-orange-50/50 to-transparent dark:from-orange-900/10 pointer-events-none" />
      
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Hero Card (Left - 8 cols) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-8 group"
          >
            <Link href={`/article/${heroArticle.slug}`} className="block h-full relative rounded-3xl overflow-hidden shadow-2xl shadow-orange-500/10">
              <div className="relative h-[480px] lg:h-[600px] w-full">
                <Image
                  src={heroArticle.thumbnail || "/placeholder.jpg"}
                  alt={heroArticle.title}
                  fill
                  priority
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-3 mb-4"
                >
                  <span className="px-3 py-1 bg-orange-600 text-white text-xs font-bold uppercase tracking-wider rounded-full flex items-center gap-1.5 shadow-lg shadow-orange-600/20">
                    <Flame size={12} fill="currentColor" />
                    Tiêu điểm
                  </span>
                  <span className="text-slate-300 text-sm flex items-center gap-1.5 backdrop-blur-sm bg-black/20 px-2 py-1 rounded-full">
                    <Clock size={14} />
                    {new Date(heroArticle.createdAt).toLocaleDateString("vi-VN")}
                  </span>
                </motion.div>

                <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-[1.1] mb-6 tracking-tight group-hover:text-orange-400 transition-colors">
                  {heroArticle.title}
                </h1>
                
                {heroArticle.excerpt && (
                  <p className="text-slate-300 text-lg line-clamp-2 max-w-2xl mb-6 font-medium leading-relaxed">
                    {heroArticle.excerpt}
                  </p>
                )}

                <div className="flex items-center text-orange-400 font-bold group/btn">
                  Đọc ngay
                  <ArrowRight size={20} className="ml-2 transition-transform group-hover/btn:translate-x-1" />
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Side Articles (Right - 4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {sideArticles.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex-1"
              >
                <Link href={`/article/${article.slug}`} className="group flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-lg border border-slate-100 dark:border-slate-800 hover:shadow-xl transition-all hover:-translate-y-1">
                  <div className="flex items-start gap-4 p-4 h-full">
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0">
                      <Image
                        src={article.thumbnail || "/placeholder.jpg"}
                        alt={article.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 leading-snug line-clamp-3 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                        {article.title}
                      </h3>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(article.createdAt).toLocaleDateString("vi-VN")}
                        </span>
                        {article.stats?.views && (
                          <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                            {article.stats.views.toLocaleString()} views
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
            
            {/* View More Link */}
            <Link 
              href="/tin-tuc" 
              className="mt-auto group flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold hover:border-orange-500 hover:text-orange-600 dark:hover:text-orange-400 transition-all"
            >
              Xem tất cả tin tức
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}
