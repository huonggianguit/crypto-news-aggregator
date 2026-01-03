"use client";
import React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  FileText,
  Building2,
  Calendar,
  CheckCircle,
  Download,
  Share2,
  Heart,
  Bookmark,
  Facebook,
  Twitter,
  Linkedin,
} from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { slugifyTitle } from "@/lib/contentUtils";
import type { BlogPost } from "./BlogDetail";

interface Props {
  post: BlogPost;
  related?: BlogPost[];
}

export default function LegalDetail({ post, related = [] }: Props) {
  const router = useRouter();

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
      className="min-h-screen bg-gradient-to-b from-slate-50 to-white"
    >
      {/* Back Button - Fixed */}
      <div className="fixed top-6 left-6 z-50">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 bg-white/95 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-200 group"
        >
          <ArrowLeft className="w-5 h-5 text-blue-600 group-hover:-translate-x-1 transition-transform" />
          <span className="text-gray-700">Quay lại</span>
        </button>
      </div>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-900 via-slate-800 to-slate-900 py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-slate-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-2000" />
        </div>

        {/* Content */}
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            {/* Icon & Category */}
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-500/20 rounded-full">
                <FileText className="w-6 h-6 text-blue-300" />
              </div>
              <span className="inline-block bg-blue-500/30 text-blue-100 px-4 py-2 rounded-full text-sm font-medium uppercase tracking-wider">
                Văn bản pháp luật
              </span>
            </div>

            {/* Title */}
            <h1 className="text-white mb-6 text-4xl md:text-5xl lg:text-6xl leading-tight font-bold">
              {post.title}
            </h1>

            {/* Description */}
            <p className="text-blue-100 text-xl mb-8 leading-relaxed max-w-3xl">
              {post.shortContent}
            </p>

            {/* Legal Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {/* Số hiệu văn bản */}
              {post.lawNumber && (
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 flex items-start gap-3">
                  <FileText className="w-5 h-5 text-blue-300 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-blue-200 text-sm">Số hiệu</p>
                    <p className="text-white font-semibold">{post.lawNumber}</p>
                  </div>
                </div>
              )}

              {/* Cơ quan ban hành */}
              {post.issuingAgency && (
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-blue-300 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-blue-200 text-sm">Cơ quan ban hành</p>
                    <p className="text-white font-semibold">{post.issuingAgency}</p>
                  </div>
                </div>
              )}

              {/* Ngày ban hành */}
              {post.promulgationDate && (
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-blue-300 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-blue-200 text-sm">Ngày ban hành</p>
                    <p className="text-white font-semibold">{post.promulgationDate}</p>
                  </div>
                </div>
              )}

              {/* Ngày có hiệu lực */}
              {post.effectiveDate && (
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-300 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-blue-200 text-sm">Ngày có hiệu lực</p>
                    <p className="text-white font-semibold">{post.effectiveDate}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              {post.attachmentUrl && (
                <a
                  href={post.attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-300 hover:shadow-lg"
                >
                  <Download className="w-5 h-5" />
                  <span>Tải tệp đính kèm</span>
                </a>
              )}
              <button className="flex items-center gap-2 px-6 py-3 border border-white/30 hover:bg-white/10 text-white rounded-lg font-medium transition-all duration-300">
                <Share2 className="w-5 h-5" />
                <span>Chia sẻ</span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Content */}
          <div className="lg:col-span-2">
            {/* Content Sections */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="prose prose-slate max-w-none mb-12"
            >
              <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200">
                <div className="text-lg leading-relaxed text-slate-700 whitespace-pre-wrap">
                  {post.shortContent}
                </div>
              </div>
            </motion.div>

            {/* Related Documents */}
            {related && related.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-16"
              >
                <h2 className="text-3xl font-bold text-slate-900 mb-8">Văn bản liên quan</h2>
                <div className="grid gap-6">
                  {related.map((doc) => (
                    <Link
                      key={doc.id}
                      href={`/article/${doc.slug}`}
                      className="group p-6 bg-white rounded-xl border border-slate-200 hover:border-blue-500 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                          <FileText className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors mb-2">
                            {doc.title}
                          </h3>
                          <p className="text-slate-600 text-sm mb-3">{doc.shortContent}</p>
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span>{doc.date}</span>
                            <span className="text-blue-600 font-medium group-hover:underline">
                              Đọc thêm →
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </motion.section>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="sticky top-24 space-y-6"
            >
              {/* Info Card */}
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-slate-900">Thông tin văn bản</h3>
                </div>
                <div className="space-y-3 text-sm">
                  {post.lawNumber && (
                    <div>
                      <p className="text-slate-600">Số hiệu</p>
                      <p className="font-medium text-slate-900">{post.lawNumber}</p>
                    </div>
                  )}
                  {post.promulgationDate && (
                    <div>
                      <p className="text-slate-600">Ngày ban hành</p>
                      <p className="font-medium text-slate-900">{post.promulgationDate}</p>
                    </div>
                  )}
                  {post.effectiveDate && (
                    <div>
                      <p className="text-slate-600">Ngày có hiệu lực</p>
                      <p className="font-medium text-slate-900">{post.effectiveDate}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Interaction Buttons */}
              <div className="flex gap-3">
                <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors">
                  <Heart className="w-5 h-5" />
                  <span className="hidden sm:inline">Thích</span>
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors">
                  <Bookmark className="w-5 h-5" />
                  <span className="hidden sm:inline">Lưu</span>
                </button>
              </div>

              {/* Share Section */}
              <div className="bg-white rounded-xl p-6 border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-4">Chia sẻ</h3>
                <div className="flex gap-3">
                  <a
                    href="#"
                    className="flex items-center justify-center w-10 h-10 bg-slate-100 hover:bg-blue-600 hover:text-white rounded-lg transition-colors"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                  <a
                    href="#"
                    className="flex items-center justify-center w-10 h-10 bg-slate-100 hover:bg-blue-400 hover:text-white rounded-lg transition-colors"
                  >
                    <Twitter className="w-5 h-5" />
                  </a>
                  <a
                    href="#"
                    className="flex items-center justify-center w-10 h-10 bg-slate-100 hover:bg-blue-700 hover:text-white rounded-lg transition-colors"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
