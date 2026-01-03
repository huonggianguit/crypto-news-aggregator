// components/page/BlogDetail.tsx
"use client";

import {
  ArrowLeft,
  Calendar,
  Clock,
  Heart,
  Share2,
  Bookmark,
  Facebook,
  Twitter,
  Linkedin,
} from "lucide-react";
import { motion } from "motion/react";
import { slugifyTitle } from "@/lib/contentUtils";
import Link from "next/link";

export interface BlogPost {
  id: string;
  image: string;
  category: string;
  date: string;
  title: string;
  shortContent: string;
  contentHtml?: string; // HTML lớn
  toc?: string[];       // TOC
  slug?: string;        // ✅ để link sang /article/{slug}
  attachmentUrl?: string; // Optional attachment URL
  lawNumber?: string;   // Số hiệu văn bản pháp luật
  issuingAgency?: string; // Cơ quan ban hành
  promulgationDate?: string; // Ngày ban hành
  effectiveDate?: string;   // Ngày có hiệu lực
  source?: string;      // Nguồn tin (vnexpress, tuoitre, tapchibitcoin)
}

interface BlogDetailProps {
  post: BlogPost;
  onBack: () => void;
  relatedPosts?: BlogPost[];
}

export function BlogDetail({
  post,
  onBack,
  relatedPosts = [],
}: BlogDetailProps) {
  const handleScrollTo = (title: string) => {
    const id = slugifyTitle(title);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-b from-gray-50 to-white"
    >
      {/* Back Button - Fixed */}
      <div className="fixed top-6 left-6 z-50">
        <button
          onClick={onBack}
          className="flex items-center gap-2 bg-white/95 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-200 group"
        >
          <ArrowLeft className="w-5 h-5 text-red-600 group-hover:-translate-x-1 transition-transform" />
          <span className="text-gray-700">Quay lại</span>
        </button>
      </div>

      {/* Hero Section */}
      <div className="relative h-[70vh] overflow-hidden">
        <motion.img
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8 }}
          src={post.image}
          alt={post.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        {/* Content Overlay */}
        <div className="absolute inset-0 flex items	end">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 w-full">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              {/* Category Badge */}
              <span className="inline-block bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-2 rounded-full text-sm uppercase tracking-wider mb-6 shadow-xl">
                {post.category}
              </span>

              {/* Title */}
              <h1 className="text-white mb-6 text-4xl md:text-5xl lg:text-6xl leading-tight">
                {post.title}
              </h1>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-6 text-white/90">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>{post.date}</span>
                </div>
                <div className="w-1 h-1 bg-white/50 rounded-full" />
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>5 phút đọc</span>
                </div>
                <div className="w-1 h-1 bg-white/50 rounded-full" />
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  <span>248 lượt thích</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex gap-12">
          {/* Social Sidebar */}
          <div className="hidden lg:block sticky top-24 h-fit">
            <div className="flex flex-col gap-4">
              <button className="p-3 bg-white rounded-full shadow-md hover:shadow-lg hover:bg-red-50 transition-all duration-300 group">
                <Heart className="w-5 h-5 text-gray-600 group-hover:text-red-500 transition-colors" />
              </button>
              <button className="p-3 bg-white rounded-full shadow-md hover:shadow-lg hover:bg-blue-50 transition-all duration-300 group">
                <Facebook className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
              </button>
              <button className="p-3 bg-white rounded-full shadow-md hover:shadow-lg hover:bg-sky-50 transition-all duration-300 group">
                <Twitter className="w-5 h-5 text-gray-600 group-hover:text-sky-500 transition-colors" />
              </button>
              <button className="p-3 bg-white rounded-full shadow-md hover:shadow-lg hover:bg-blue-50 transition-all duration-300 group">
                <Linkedin className="w-5 h-5 text-gray-600 group-hover:text-blue-700 transition-colors" />
              </button>
              <button className="p-3 bg-white rounded-full shadow-md hover:shadow-lg hover:bg-yellow-50 transition-all duration-300 group">
                <Bookmark className="w-5 h-5 text-gray-600 group-hover:text-yellow-600 transition-colors" />
              </button>
            </div>
          </div>

          {/* Article Content */}
          <article className="flex-1">
            {/* Lead Paragraph */}
            <div className="mb-8">
              <p className="text-xl text-gray-800 leading-relaxed">
                {post.shortContent}
              </p>
            </div>

            {/* TOC */}
            {post.toc && post.toc.length > 0 && (
              <div className="mb-12 p-6 rounded-2xl bg-gradient-to-r from-red-50 to-pink-50 border border-red-100/70">
                <h2 className="text-gray-900 mb-4 text-xl font-semibold">
                  Mục lục
                </h2>
                <ul className="space-y-2 text-sm">
                  {post.toc.map((item, index) => (
                    <li key={index}>
                      <button
                        type="button"
                        onClick={() => handleScrollTo(item)}
                        className="text-left text-gray-700 hover:text-red-600 hover:translate-x-1 transition-all duration-200 inline-flex items-start gap-2"
                      >
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-red-400" />
                        <span>{item}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Main Content */}
            <div
              className="
                prose prose-lg max-w-none
                text-gray-800
                prose-headings:text-gray-900
                prose-p:text-gray-800
                prose-li:text-gray-800
                prose-strong:text-gray-900
                prose-a:text-red-600 prose-a:no-underline hover:prose-a:underline
              "
            >
              {post.contentHtml ? (
                <div dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
              ) : (
                <>
                  {/* fallback nếu chưa có content */}
                  <h2 className="text-gray-900 mb-4 text-3xl">Giới thiệu</h2>
                  <p className="text-gray-800 leading-relaxed mb-6">
                    Nội dung bài viết sẽ được cập nhật sau.
                  </p>
                </>
              )}
            </div>

            {/* Tags */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="flex flex-wrap gap-3">
                <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-orange-50 hover:text-orange-600 transition-colors cursor-pointer">
                  #Bitcoin
                </span>
                <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-orange-50 hover:text-orange-600 transition-colors cursor-pointer">
                  #Ethereum
                </span>
                <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-orange-50 hover:text-orange-600 transition-colors cursor-pointer">
                  #Blockchain
                </span>
                <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-orange-50 hover:text-orange-600 transition-colors cursor-pointer">
                  #DeFi
                </span>
              </div>
            </div>

            {/* Source Attribution */}
            {post.source && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-gray-500 text-sm">
                  Theo{' '}
                  <span className="font-medium text-gray-700">
                    {post.source === 'vnexpress' && 'VnExpress'}
                    {post.source === 'tuoitre' && 'Tuổi Trẻ'}
                    {post.source === 'coinphoton' && 'CoinPhoton'}
                  </span>
                </p>
              </div>
            )}

            {/* Share Section */}
            <div className="mt-12 p-8 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-gray-900 mb-2 text-xl">
                    Chia sẻ bài viết này
                  </h3>
                  <p className="text-gray-600">
                    Giúp lan tỏa những kiến thức hữu ích
                  </p>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-full hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <Share2 className="w-5 h-5" />
                  <span>Chia sẻ</span>
                </button>
              </div>
            </div>
          </article>
        </div>
      </div>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <div className="bg-gradient-to-b from-gray-50 to-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-gray-900 mb-4 text-3xl">Bài viết liên quan</h2>
              <p className="text-gray-600 text-lg">
                Khám phá thêm những nội dung hữu ích khác
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedPosts.slice(0, 3).map((relatedPost) => (
                <Link
                  key={relatedPost.id}
                  href={
                    relatedPost.slug
                      ? `/article/${relatedPost.slug}`
                      : "#"
                  }
                  className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-2"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                      src={relatedPost.image}
                      alt={relatedPost.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <span className="text-red-600 text-sm uppercase tracking-wider">
                      {relatedPost.category}
                    </span>
                    <h3 className="mt-3 text-gray-900 group-hover:text-red-600 transition-colors line-clamp-2">
                      {relatedPost.title}
                    </h3>
                    <p className="mt-2 text-gray-600 text-sm line-clamp-2">
                      {relatedPost.shortContent}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
