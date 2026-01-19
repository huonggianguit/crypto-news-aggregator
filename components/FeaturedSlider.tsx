"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar, Clock } from 'lucide-react';
import { Article } from '@/types';

interface FeaturedSliderProps {
  articles: Article[];
}

export default function FeaturedSlider({ articles = [] }: FeaturedSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused || articles.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % articles.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, articles.length]);

  if (articles.length === 0) {
    return <div className="text-center py-10">Không có bài viết tiêu điểm.</div>;
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % articles.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + articles.length) % articles.length);
  };

  const currentArticle = articles[currentIndex];

  return (
    <div 
      className="relative w-full h-[500px] rounded-2xl overflow-hidden shadow-2xl group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence initial={false}>
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full h-full"
        >
          <Image
            src={currentArticle.thumbnail || '/placeholder.jpg'}
            alt={currentArticle.title}
            fill
            priority
            className="object-cover"
          />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
        <Link href={`/article/${currentArticle.slug}`}>
          <motion.h2 
            key={currentIndex}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-4xl font-bold mb-4 hover:text-orange-300 transition-colors"
          >
            {currentArticle.title}
          </motion.h2>
        </Link>
        <motion.p 
            key={`p-${currentIndex}`}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-slate-300 line-clamp-2 max-w-2xl mb-4"
        >
          {currentArticle.excerpt}
        </motion.p>
        <div className="text-sm flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1.5"><Calendar size={14}/> {new Date(currentArticle.createdAt).toLocaleDateString("vi-VN")}</span>
            <span className="flex items-center gap-1.5"><Clock size={14}/> 5 phút đọc</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="absolute top-1/2 -translate-y-1/2 flex justify-between w-full px-4">
        <button onClick={handlePrev} className="bg-white/20 p-2 rounded-full hover:bg-white/40 transition-colors backdrop-blur-sm">
          <ChevronLeft size={24} />
        </button>
        <button onClick={handleNext} className="bg-white/20 p-2 rounded-full hover:bg-white/40 transition-colors backdrop-blur-sm">
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
}
