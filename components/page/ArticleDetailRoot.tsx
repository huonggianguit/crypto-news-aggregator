"use client";

import React from "react";
import { useRouter } from "next/navigation";
import type { BlogPost } from "./BlogDetail";

type Props = {
  post: BlogPost;
  relatedPosts?: BlogPost[];
};

export function ArticleDetailRoot({ post, relatedPosts = [] }: Props) {
  const router = useRouter();

  // Add IDs to H2 headings for TOC navigation
  const addIdsToHeadings = (html: string): string => {
    if (!html) return '';
    
    let counter = 0;
    return html.replace(/<h2([^>]*)>/gi, (match, attributes) => {
      counter++;
      // Check if ID already exists
      if (attributes.includes('id=')) return match;
      // Add ID to h2 tag
      return `<h2${attributes} id="toc-${counter}">`;
    });
  };

  // Convert BlogPost to ArticleDetailData format
  const articleData: ArticleDetailData = {
    breadcrumb: [
      { label: "Trang chủ", href: "/" },
      { label: post.category || "Danh mục", href: "#" },
      { label: post.title },
    ],

    badgeLabel: post.category,
    title: post.title,
    summary: post.shortContent,

    author: {
      name: "Ban biên tập",
    },
    dateLabel: post.date,
    readTimeLabel: calculateReadTime(post.contentHtml || ""),

    heroImageUrl: post.image,
    heroImageAlt: post.title,

    // ✅ ADD: toc data
    toc: Array.isArray((post as any).toc) ? ((post as any).toc as string[]) : [],

    contentHtml: addIdsToHeadings(post.contentHtml || ''),

    source: post.source,
    tags: [],

    related: relatedPosts.map((p) => ({
      id: p.id,
      title: p.title,
      dateLabel: p.date,
      imageUrl: p.image,
      slug: p.slug || "",
    })),

    sameCategory: relatedPosts.slice(0, 3).map((p) => ({
      id: p.id,
      title: p.title,
      dateLabel: p.date,
      imageUrl: p.image,
      slug: p.slug || "",
    })),

    mostRead: relatedPosts.slice(0, 3).map((p) => ({
      id: p.id,
      title: p.title,
      meta: `${(Math.random() * 5000).toFixed(0)} lượt xem`,
      slug: p.slug || "",
    })),
  };

  return <ArticleDetail data={articleData} />;
}

function calculateReadTime(html: string): string {
  const wordCount = html.replace(/<[^>]*>/g, "").split(/\s+/).filter(Boolean).length;
  const minutes = Math.ceil(wordCount / 200);
  return `${minutes} phút đọc`;
}

export type ArticleAuthor = {
  name: string;
  avatarUrl?: string;
};

export type ArticleRelatedItem = {
  id: string;
  title: string;
  dateLabel: string;
  imageUrl: string;
  slug: string;
};

export type ArticleSidebarItem = {
  id: string;
  title: string;
  dateLabel: string;
  imageUrl: string;
  slug: string;
};

export type ArticleMostReadItem = {
  id: string;
  title: string;
  meta: string;
  slug: string;
};

export type ArticleDetailData = {
  breadcrumb: {
    label: string;
    href?: string;
  }[];

  badgeLabel?: string;
  title: string;
  summary?: string;

  author?: ArticleAuthor;
  dateLabel?: string;
  readTimeLabel?: string;

  heroImageUrl?: string;
  heroImageAlt?: string;
  heroCaption?: string;

  // ✅ ADD: toc field
  toc?: string[];

  contentHtml?: string;

  source?: string;
  tags?: string[];
  related?: ArticleRelatedItem[];

  sameCategory?: ArticleSidebarItem[];
  mostRead?: ArticleMostReadItem[];
};

type ArticleDetailProps = {
  data: ArticleDetailData;
};

function ArticleDetail({ data }: ArticleDetailProps) {
  const router = useRouter();

  const {
    breadcrumb,
    badgeLabel,
    title,
    summary,
    author,
    dateLabel,
    readTimeLabel,
    heroImageUrl,
    heroImageAlt,
    heroCaption,
    contentHtml,
    toc, // ✅
    source,
    tags,
    related,
    sameCategory,
    mostRead,
  } = data;

  return (
    <div className="min-h-screen bg-white">
      <main className="w-full py-8 pt-40">
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* LEFT */}
            <div className="w-full lg:w-2/3 flex flex-col gap-6 min-w-0">
              {/* Breadcrumb */}
              <nav className="flex items-center gap-2 text-sm text-gray-500">
                {breadcrumb?.map((item, idx) => {
                  const isLast = idx === breadcrumb.length - 1;
                  return (
                    <React.Fragment key={`${item.label}-${idx}`}>
                      {idx === 0 ? (
                        <a
                          href={item.href || "#"}
                          className="hover:text-red-600 transition-colors flex items-center"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            home
                          </span>
                        </a>
                      ) : isLast ? (
                        <span className="text-gray-800 font-medium truncate max-w-[220px] md:max-w-none">
                          {item.label}
                        </span>
                      ) : (
                        <a
                          href={item.href || "#"}
                          className="hover:text-red-600 transition-colors"
                        >
                          {item.label}
                        </a>
                      )}
                      {!isLast && (
                        <span className="material-symbols-outlined text-[14px] text-gray-400">
                          chevron_right
                        </span>
                      )}
                    </React.Fragment>
                  );
                })}
              </nav>

              {/* Header */}
              <header className="mb-2">
                {badgeLabel && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 text-xs font-bold uppercase tracking-wider rounded-md mb-4 border border-red-100">
                    {badgeLabel}
                  </div>
                )}

                <h1 className="text-3xl md:text-4xl lg:text-[40px] font-extrabold text-gray-900 leading-[1.2] tracking-tight mb-6">
                  {title}
                </h1>

                {/* Meta row */}
                <div className="flex flex-wrap items-center gap-y-3 gap-x-6 text-sm text-gray-500 border-b border-gray-100 pb-6">
                  {author?.name && (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                        {author.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            alt={author.name}
                            src={author.avatarUrl}
                            className="w-full h-full object-cover"
                          />
                        ) : null}
                      </div>
                      <span className="font-semibold text-gray-900">
                        {author.name}
                      </span>
                    </div>
                  )}

                  {dateLabel && (
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px]">
                        calendar_today
                      </span>
                      <span>{dateLabel}</span>
                    </div>
                  )}

                  {readTimeLabel && (
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px]">
                        schedule
                      </span>
                      <span>{readTimeLabel}</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="ml-auto flex items-center gap-2">
                    <button
                      type="button"
                      className="w-8 h-8 rounded-full bg-gray-50 hover:bg-blue-50 text-gray-400 hover:text-blue-600 flex items-center justify-center transition-colors"
                      aria-label="Chia sẻ"
                      onClick={() => {
                        navigator?.clipboard?.writeText?.(window.location.href);
                      }}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        share
                      </span>
                    </button>

                    <button
                      type="button"
                      className="w-8 h-8 rounded-full bg-gray-50 hover:bg-yellow-50 text-gray-400 hover:text-yellow-600 flex items-center justify-center transition-colors"
                      aria-label="Lưu"
                      onClick={() => {
                        // TODO: bookmark
                      }}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        bookmark
                      </span>
                    </button>

                    <button
                      type="button"
                      className="w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-200 text-gray-400 hover:text-gray-900 flex items-center justify-center transition-colors"
                      aria-label="In"
                      onClick={() => window.print()}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        print
                      </span>
                    </button>
                  </div>
                </div>
              </header>

              {/* Summary */}
              {summary && (
                <div className="text-lg md:text-xl font-medium text-gray-800 leading-relaxed">
                  {summary}
                </div>
              )}

              {/* Hero image */}
              {heroImageUrl && (
                <figure className="rounded-xl overflow-hidden shadow-sm bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt={heroImageAlt || title}
                    src={heroImageUrl}
                    className="w-full h-auto object-cover"
                  />
                  {heroCaption && (
                    <figcaption className="p-3 text-center text-sm text-gray-500 bg-gray-50 italic border-t border-gray-100">
                      {heroCaption}
                    </figcaption>
                  )}
                </figure>
              )}

              {/* ✅ TABLE OF CONTENTS - before content */}
              {Array.isArray(toc) && toc.length > 0 && (
                <section className="rounded-2xl border border-gray-100 bg-gray-50 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-orange-600">
                      list
                    </span>
                    <h3 className="text-lg font-bold text-gray-900">Mục lục</h3>
                  </div>

                  <ol className="space-y-2 text-sm">
                    {toc.map((t, idx) => (
                      <li key={`${t}-${idx}`} className="flex gap-2">
                        <span className="text-gray-600 font-semibold">{idx + 1}.</span>

                        <a
                          href={`#toc-${idx + 1}`}
                          onClick={(e) => {
                            e.preventDefault();
                            const element = document.getElementById(`toc-${idx + 1}`);
                            if (element) {
                              element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }
                          }}
                          className="text-gray-800 hover:text-orange-600 transition-colors cursor-pointer"
                        >
                          {t}
                        </a>
                      </li>
                    ))}
                  </ol>
                </section>
              )}

              {/* Content */}
              <article
                className="prose prose-lg max-w-none text-gray-700 text-justify leading-[1.8]
                  prose-headings:font-extrabold prose-headings:bg-gradient-to-r prose-headings:from-red-600 prose-headings:to-red-500 prose-headings:text-transparent prose-headings:bg-clip-text
                  prose-h2:text-3xl prose-h3:text-2xl prose-h4:text-xl prose-h5:text-lg
                  prose-a:text-red-600 prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-gray-900 prose-strong:font-bold prose-img:rounded-xl"
              >
                {contentHtml ? (
                  <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
                ) : (
                  <p>Nội dung đang được cập nhật…</p>
                )}
              </article>

              {/* Source Attribution */}
              {source && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-gray-500 text-sm">
                    Theo{' '}
                    <span className="font-medium text-gray-700">
                      {source === 'vnexpress' && 'VnExpress'}
                      {source === 'tuoitre' && 'Tuổi Trẻ'}
                      {source === 'coinphoton' && 'CoinPhoton'}
                    </span>
                  </p>
                </div>
              )}

              {/* Tags */}
              {tags && tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-6 border-t border-gray-100">
                  <span className="text-sm font-semibold text-gray-500 mr-2 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[18px]">
                      label
                    </span>
                    Chủ đề:
                  </span>
                  {tags.map((t) => (
                    <a
                      key={t}
                      href="#"
                      className="px-3 py-1 bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 rounded-full text-sm transition-colors"
                    >
                      {t}
                    </a>
                  ))}
                </div>
              )}

              {/* Related */}
              {related && related.length > 0 && (
                <section className="mt-10 bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-1 h-6 bg-red-600 rounded-full" />
                    <h3 className="text-xl font-bold text-gray-900">
                      Tin liên quan
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {related.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className="group flex gap-4 items-start text-left"
                        onClick={() => router.push(`/article/${item.slug}`)}
                      >
                        <div className="w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-gray-200">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            alt={item.title}
                            src={item.imageUrl}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-gray-900 leading-snug group-hover:text-red-600 transition-colors line-clamp-2 mb-2">
                            {item.title}
                          </h4>
                          <span className="text-xs text-gray-500">
                            {item.dateLabel}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* RIGHT SIDEBAR */}
            <aside className="w-full lg:w-1/3 flex flex-col gap-8">
              {/* Quick utilities */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-3">
                  Tiện ích nhanh
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: "trending_up", label: "Theo dõi giá" },
                    { icon: "currency_exchange", label: "Chuyển đổi tiền tệ" },
                    { icon: "calculate", label: "Tính lãi/lỗ" },
                    { icon: "wallet", label: "Quản lý ví" },
                  ].map((x) => (
                    <a
                      key={x.icon}
                      href="#"
                      className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-gray-50 hover:bg-red-50 hover:text-red-600 transition-colors group text-center"
                    >
                      <span className="material-symbols-outlined text-3xl text-gray-400 group-hover:text-red-600">
                        {x.icon}
                      </span>
                      <span className="text-sm font-semibold">{x.label}</span>
                    </a>
                  ))}
                </div>
              </div>

              {/* Same category */}
              {sameCategory && sameCategory.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                    <span className="material-symbols-outlined text-red-600">
                      feed
                    </span>
                    Cùng chuyên mục
                  </h3>

                  <div className="flex flex-col gap-5">
                    {sameCategory.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className="flex gap-3 group text-left"
                        onClick={() => router.push(`/article/${item.slug}`)}
                      >
                        <div className="shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gray-200">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            alt={item.title}
                            src={item.imageUrl}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                        <div className="flex flex-col justify-between min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug group-hover:text-red-600 transition-colors">
                            {item.title}
                          </h4>
                          <span className="text-xs text-gray-400">
                            {item.dateLabel}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Ad */}
              <div className="rounded-2xl overflow-hidden relative h-64 shadow-sm group cursor-pointer">
                <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(249,115,22,0.92),rgba(234,88,12,0.75))]" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 text-white">
                  <span className="text-yellow-300 font-bold uppercase tracking-widest text-xs mb-2">
                    Quảng cáo
                  </span>
                  <h3 className="text-2xl font-bold mb-3">
                    Crypto Trading Pro 2026
                  </h3>
                  <p className="text-sm text-white/90 mb-6">
                    Đầu tư thông minh với công cụ phân tích chuyên nghiệp. Đăng ký ngay để
                    nhận ưu đãi 30%.
                  </p>
                  <button className="bg-white text-orange-600 px-6 py-2.5 rounded-full font-bold text-sm hover:bg-gray-100 transition-colors">
                    Tìm hiểu ngay
                  </button>
                </div>
              </div>

              {/* Most read */}
              {mostRead && mostRead.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                    <span className="material-symbols-outlined text-red-600">
                      trending_up
                    </span>
                    Đọc nhiều nhất
                  </h3>

                  <div className="flex flex-col gap-4">
                    {mostRead.slice(0, 3).map((item, index) => (
                      <button
                        key={item.id}
                        type="button"
                        className="flex gap-4 items-start group text-left border-b border-gray-50 pb-4 last:border-0 last:pb-0"
                        onClick={() => router.push(`/article/${item.slug}`)}
                      >
                        <span className="text-4xl font-black text-gray-400 group-hover:text-red-600 transition-colors leading-none">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <div className="min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900 leading-snug group-hover:text-red-600 transition-colors line-clamp-2">
                            {item.title}
                          </h4>
                          <span className="text-xs text-gray-500 mt-1 block">
                            {item.meta}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
