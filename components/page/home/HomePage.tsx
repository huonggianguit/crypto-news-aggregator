"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import HeroSection from "@/components/page/home/HeroSection";
import ArticleSideCard from "@/components/page/home/ArticleSideCard";
import MarketTicker from "@/components/page/home/MarketTicker";
import CategoryFeed from "@/components/page/home/CategoryFeed";
import Sidebar from "@/components/Sidebar";
import { HomePageProps } from "@/types";

import FeaturedSlider from "@/components/FeaturedSlider";

export default function HomePage({
  bitcoinArticles,
  ethereumArticles,
  altcoinArticles,
  marketArticles,
  topViewedArticles,
  topLikedArticles,
  featuredArticles,
}: HomePageProps) {
  // Các bài featured bên cạnh slider lấy từ top views (trừ các bài đã có trong slider)
  const featuredIds = new Set(featuredArticles.map(a => a.id));
  const featuredSideArticles = topViewedArticles.filter(a => !featuredIds.has(a.id)).slice(0, 3);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans selection:bg-orange-500 selection:text-white">
      
      {/* 1. Hero Section - Top Fold */}
      <section className="relative pt-32 pb-12 bg-slate-50 dark:bg-slate-950 overflow-hidden">
        {/* Background Decor */}
        <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-orange-50/50 to-transparent dark:from-orange-900/10 pointer-events-none" />
        
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Hero Slider (Left - 8 cols) */}
            <div className="lg:col-span-8">
              <FeaturedSlider articles={featuredArticles} />
            </div>

            {/* Side Articles (Right - 4 cols) */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              {featuredSideArticles.map((article) => (
                <ArticleSideCard key={article.id} article={article} />
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

      {/* 2. Market Ticker - Live Trends */}
      <MarketTicker />

      {/* 3. Main Content Layout */}
      <main className="py-12 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-12">
            
            {/* Left Column: News Feeds (Flex-1) */}
            <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-2 gap-x-10">
              
              <CategoryFeed
                title="Tin Bitcoin"
                icon="₿"
                iconBg="bg-orange-500"
                articles={bitcoinArticles}
                categorySlug="tin-bitcoin"
              />

              <CategoryFeed
                title="Tin Ethereum"
                icon="Ξ"
                iconBg="bg-indigo-600"
                articles={ethereumArticles}
                categorySlug="tin-ethereum"
              />

              <CategoryFeed
                title="Tin Altcoin"
                icon="✦"
                iconBg="bg-purple-600"
                articles={altcoinArticles}
                categorySlug="tin-altcoin"
              />

              <CategoryFeed
                title="Tin Thị trường"
                icon="◈"
                iconBg="bg-emerald-600"
                articles={marketArticles}
                categorySlug="tin-thi-truong"
              />
            </div>

            {/* Right Column: Sidebar (Fixed Width) */}
            <div className="w-full lg:w-[380px] flex-shrink-0">
              <div className="lg:sticky lg:top-32 transition-all">
                <Sidebar
                  topViewedArticles={topViewedArticles}
                  topLikedArticles={topLikedArticles}
                />
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
