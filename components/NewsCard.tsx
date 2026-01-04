// components/NewsCard.tsx
/**
 * News Card Component - Hiển thị tin tức dạng card
 */

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export interface NewsCardProps {
  slug: string;
  title: string;
  description?: string;
  main_img: string;
  createdAt: Date;
  category?: {
    name: string;
    slug: string;
  };
  variant?: 'default' | 'featured' | 'compact';
}

export default function NewsCard({
  slug,
  title,
  description,
  main_img,
  createdAt,
  category,
  variant = 'default',
}: NewsCardProps) {
  const formattedDate = new Date(createdAt).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  // Featured variant (large)
  if (variant === 'featured') {
    return (
      <Link href={`/article/${slug}`}>
        <article className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="grid md:grid-cols-2 gap-6 p-6 md:p-8">
            {/* Image */}
            <div className="relative aspect-video md:aspect-square overflow-hidden rounded-xl">
              <Image
                src={main_img}
                alt={title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              {category && (
                <div className="absolute top-4 left-4">
                  <span className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-full shadow-lg">
                    {category.name}
                  </span>
                </div>
              )}
            </div>
            
            {/* Content */}
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <time dateTime={createdAt.toISOString()}>{formattedDate}</time>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-3">
                {title}
              </h2>
              
              {description && (
                <p className="text-lg text-gray-600 dark:text-gray-300 line-clamp-3 mb-6">
                  {description}
                </p>
              )}
              
              <div className="flex items-center text-blue-600 dark:text-blue-400 font-semibold group-hover:gap-3 transition-all">
                Đọc thêm
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          </div>
        </article>
      </Link>
    );
  }
  
  // Compact variant (small)
  if (variant === 'compact') {
    return (
      <Link href={`/article/${slug}`}>
        <article className="group flex gap-4 hover:bg-gray-50 dark:hover:bg-gray-800 p-3 rounded-lg transition-colors">
          <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden rounded-lg">
            <Image
              src={main_img}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="96px"
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {title}
            </h3>
            <time className="text-xs text-gray-500 dark:text-gray-400" dateTime={createdAt.toISOString()}>
              {formattedDate}
            </time>
          </div>
        </article>
      </Link>
    );
  }
  
  // Default variant (grid card)
  return (
    <Link href={`/article/${slug}`}>
      <article className="group h-full flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
        {/* Image */}
        <div className="relative aspect-video overflow-hidden">
          <Image
            src={main_img}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {category && (
            <div className="absolute top-3 left-3">
              <span className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full shadow">
                {category.name}
              </span>
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="flex flex-col flex-1 p-5">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            <time dateTime={createdAt.toISOString()}>{formattedDate}</time>
          </div>
          
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {title}
          </h3>
          
          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 mb-4 flex-1">
              {description}
            </p>
          )}
          
          <div className="flex items-center text-blue-600 dark:text-blue-400 text-sm font-semibold group-hover:gap-2 transition-all">
            Đọc thêm
            <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </article>
    </Link>
  );
}
