"use client";

import Link from "next/link";
import Image from "next/image";
import { Eye, Heart } from "lucide-react";
import QuickTools from "@/components/QuickTools";
import { Article } from "@/types";
import { motion } from "framer-motion";

interface SidebarProps {
  topViewedArticles: Article[];
  topLikedArticles: Article[];
}

export default function Sidebar({ topViewedArticles, topLikedArticles }: SidebarProps) {
  return (
    <aside className="space-y-8">
      {/* Quick Tools Component */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 p-6"
      >
        <QuickTools />
      </motion.div>

      {/* Most Viewed */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 p-6"
      >
        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2 tracking-tight">
          <Eye size={24} className="text-blue-500" />
          Đọc nhiều nhất
        </h3>
        <div className="space-y-6">
          {topViewedArticles.map((article, index) => (
            <Link key={article.id} href={`/article/${article.slug}`} className="group flex gap-4 items-start">
              <span className={`text-3xl font-black leading-none w-8 flex-shrink-0 ${
                index === 0 ? "text-orange-500" : 
                index === 1 ? "text-slate-700 dark:text-slate-300" : 
                index === 2 ? "text-slate-500 dark:text-slate-500" : "text-slate-300 dark:text-slate-700"
              }`}>
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="flex-1 min-w-0 border-b border-slate-100 dark:border-slate-800 pb-4 group-last:border-0 group-last:pb-0">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-2">
                  {article.title}
                </h4>
                {article.stats?.views && (
                  <span className="text-xs text-slate-400 flex items-center gap-1 mt-1 font-medium">
                    <Eye size={12} />
                    {article.stats.views.toLocaleString()} lượt xem
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Most Liked */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-gradient-to-br from-orange-500 to-rose-600 rounded-3xl shadow-xl shadow-orange-500/30 p-6 text-white"
      >
        <h3 className="text-xl font-black mb-6 flex items-center gap-2 tracking-tight">
          <Heart size={24} className="text-white fill-white/20" />
          Yêu thích nhất
        </h3>
        <div className="space-y-4">
          {topLikedArticles.slice(0, 3).map((article, index) => (
            <Link key={article.id} href={`/article/${article.slug}`} className="group flex gap-4 items-start">
              <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2 border-white/20 group-hover:border-white transition-colors">
                 <Image
                    src={article.thumbnail || "/placeholder.jpg"}
                    alt={article.title}
                    fill
                    className="object-cover"
                  />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-white leading-snug group-hover:text-orange-100 transition-colors line-clamp-2">
                  {article.title}
                </h4>
                {article.stats?.likes && (
                  <span className="text-xs text-white/80 flex items-center gap-1 mt-1 font-medium">
                    <Heart size={12} fill="currentColor" />
                    {article.stats.likes.toLocaleString()} yêu thích
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </motion.div>
    </aside>
  );
}
