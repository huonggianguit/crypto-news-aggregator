"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Clock } from "lucide-react";
import { Article } from "@/types";
import { motion } from "framer-motion";

interface CategoryFeedProps {
  title: string;
  icon: React.ReactNode;
  iconBg: string; // e.g., "bg-orange-500"
  articles: Article[];
  categorySlug: string;
}

export default function CategoryFeed({ title, icon, iconBg, articles, categorySlug }: CategoryFeedProps) {
  if (articles.length === 0) return null;

  const featured = articles[0];
  const others = articles.slice(1, 5);

  return (
    <section className="mb-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 ${iconBg} rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-orange-500/20`}>
            {icon}
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{title}</h2>
        </div>
        <Link
          href={`/${categorySlug}`}
          className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:text-white hover:bg-slate-900 dark:hover:bg-slate-700 rounded-xl transition-all"
        >
          Xem thêm
          <ChevronRight size={18} />
        </Link>
      </div>

      {/* List Content - Vertical stack for narrow columns */}
      <div className="flex flex-col gap-6">
        
        {/* Featured Article - Big Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="group relative h-[280px] rounded-3xl overflow-hidden shadow-xl"
        >
          <Link href={`/article/${featured.slug}`} className="block h-full">
            <Image
              src={featured.thumbnail || "/placeholder.jpg"}
              alt={featured.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h3 className="text-xl font-bold text-white leading-tight mb-2 group-hover:text-orange-300 transition-colors line-clamp-2">
                {featured.title}
              </h3>
              <div className="flex items-center gap-2 text-gray-400 text-xs font-medium">
                <Clock size={14} />
                {new Date(featured.createdAt).toLocaleDateString("vi-VN")}
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Other Articles - Vertical List */}
        <div className="flex flex-col gap-3">
          {others.map((article, idx) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
            >
              <Link href={`/article/${article.slug}`} className="group flex gap-4 p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl hover:shadow-md transition-all">
                <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0">
                  <Image
                    src={article.thumbnail || "/placeholder.jpg"}
                    alt={article.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="flex flex-col justify-center">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm leading-snug line-clamp-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors mb-1">
                    {article.title}
                  </h4>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock size={10} />
                    {new Date(article.createdAt).toLocaleDateString("vi-VN")}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
