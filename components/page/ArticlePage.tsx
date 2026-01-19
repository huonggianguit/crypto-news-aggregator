// components/page/ArticlePage.tsx
"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useGlobalAlert } from '@/components/GlobalAlert';
import {
  Calendar,
  Eye,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Share2,
  Printer,
  Clock,
  Tag,
  ChevronRight,
  Send,
  User,
  Star,
  ExternalLink,
  Copy,
  Check,
  Facebook,
  Twitter,
  List,
} from 'lucide-react';

// Types
interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ArticleStats {
  views: number;
  likes: number;
  unlikes: number;
  comments: number;
}

interface CommentUser {
  id: string;
  name: string | null;
  image: string | null;
}

interface Comment {
  id: string;
  content: string;
  rating: number | null;
  createdAt: string;
  user: CommentUser;
}

interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  thumbnail: string | null;
  sourceUrl: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  toc: any;
  categories: Category[];
  stats: ArticleStats | null;
  comments: Comment[];
}

interface RelatedArticle {
  id: string;
  slug: string;
  title: string;
  thumbnail: string | null;
  excerpt: string | null;
  createdAt: string;
  categories: Category[];
}

interface ArticlePageProps {
  article: Article;
  relatedArticles: RelatedArticle[];
}

export function ArticlePage({ article, relatedArticles }: ArticlePageProps) {
  const { data: session } = useSession();
  const { showLoginRequired } = useGlobalAlert();

  const [stats, setStats] = useState<ArticleStats>(article.stats || { views: 0, likes: 0, unlikes: 0, comments: 0 });
  const [comments, setComments] = useState<Comment[]>(article.comments || []);
  const [userReaction, setUserReaction] = useState<'like' | 'unlike' | null>(null);
  const [isLiking, setIsLiking] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentRating, setCommentRating] = useState(5);
  const [isCommenting, setIsCommenting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showToc, setShowToc] = useState(true);

  // Increment view count and fetch user reaction on mount
  useEffect(() => {
    fetch(`/api/article/${article.id}/view`, { method: 'POST' });

    // Fetch user's current reaction if logged in
    if (session) {
      fetch(`/api/article/${article.id}/reaction`)
        .then(res => res.json())
        .then(data => {
          if (data.userReaction) {
            setUserReaction(data.userReaction);
          }
        })
        .catch(console.error);
    }
  }, [article.id, session]);

  // Parse TOC
  const tocItems: string[] = Array.isArray(article.toc)
    ? article.toc.filter((t: any) => typeof t === 'string')
    : [];

  // Process content to add IDs to headings for TOC navigation
  const processedContent = React.useMemo(() => {
    let content = article.content;
    let headingIndex = 0;

    // Add IDs to h2 and h3 tags for TOC linking
    content = content.replace(/<h([23])([^>]*)>/gi, (match, level, attrs) => {
      const id = `heading-${headingIndex++}`;
      // Check if already has an id
      if (attrs.includes('id=')) {
        return match;
      }
      return `<h${level}${attrs} id="${id}">`;
    });

    return content;
  }, [article.content]);

  // Smooth scroll to heading with highlight effect
  const scrollToHeading = (index: number) => {
    const element = document.getElementById(`heading-${index}`);
    if (element) {
      const offset = 100; // Account for fixed header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });

      // Add highlight effect
      element.classList.add('toc-highlight');
      setTimeout(() => {
        element.classList.remove('toc-highlight');
      }, 2000);

      // Auto close TOC on mobile
      if (window.innerWidth < 768) {
        setShowToc(false);
      }
    }
  };

  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Reading time estimate
  const readingTime = Math.ceil(article.content.split(/\s+/).length / 200);

  // Handle like/unlike
  const handleReaction = async (type: 'like' | 'unlike') => {
    if (!session) {
      showLoginRequired('Bạn cần đăng nhập để thích bài viết');
      return;
    }

    setIsLiking(true);
    try {
      const res = await fetch(`/api/article/${article.id}/reaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });

      if (res.ok) {
        const data = await res.json();
        setStats(prev => ({
          ...prev,
          likes: data.likes,
          unlikes: data.unlikes,
        }));
        setUserReaction(data.userReaction);
      }
    } catch (error) {
      console.error('Reaction error:', error);
    } finally {
      setIsLiking(false);
    }
  };

  // Handle comment submit
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      showLoginRequired('Bạn cần đăng nhập để bình luận');
      return;
    }

    if (!commentText.trim()) return;

    setIsCommenting(true);
    try {
      const res = await fetch(`/api/article/${article.id}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: commentText, rating: commentRating }),
      });

      if (res.ok) {
        const newComment = await res.json();
        setComments(prev => [newComment, ...prev]);
        setStats(prev => ({ ...prev, comments: prev.comments + 1 }));
        setCommentText('');
        setCommentRating(5);
      }
    } catch (error) {
      console.error('Comment error:', error);
    } finally {
      setIsCommenting(false);
    }
  };

  // Copy link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Print page
  const handlePrint = () => {
    window.print();
  };

  // Share
  const handleShare = (platform: string) => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(article.title);

    const urls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
    };

    if (urls[platform]) {
      window.open(urls[platform], '_blank', 'width=600,height=400');
    }
    setShowShareMenu(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-8">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Article Content */}
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 bg-white dark:bg-slate-900 rounded-3xl shadow-xl overflow-hidden"
          >
            {/* Thumbnail */}
            {article.thumbnail && (
              <div className="relative w-full aspect-video">
                <Image
                  src={article.thumbnail}
                  alt={article.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}

            {/* Header */}
            <div className="px-6 md:px-10 pt-8 pb-6">
              {/* Breadcrumb */}
              <nav className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                <Link href="/" className="hover:text-orange-500 transition-colors">Trang chủ</Link>
                <ChevronRight size={14} />
                {article.categories[0] && (
                  <>
                    <Link href={`/category/${article.categories[0].slug}`} className="hover:text-orange-500 transition-colors">
                      {article.categories[0].name}
                    </Link>
                    <ChevronRight size={14} />
                  </>
                )}
                <span className="text-slate-400 truncate max-w-[200px]">{article.title}</span>
              </nav>

              {/* Categories */}
              <div className="flex flex-wrap gap-2 mb-4">
                {article.categories.map(cat => (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.slug}`}
                    className="px-3 py-1.5 bg-orange-500 text-white text-xs font-bold rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>

              {/* Title */}
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white leading-tight mb-4">
                {article.title}
              </h1>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4 text-slate-500 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>{formatDate(article.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} />
                  <span>{readingTime} phút đọc</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye size={16} />
                  <span suppressHydrationWarning>{stats.views.toLocaleString('en-US')} lượt xem</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle size={16} />
                  <span>{stats.comments} bình luận</span>
                </div>
              </div>
            </div>

            {/* Excerpt */}
            {article.excerpt && (
              <div className="px-6 md:px-10 pb-6">
                <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-medium italic border-l-4 border-orange-500 pl-4 py-2 bg-orange-50 dark:bg-orange-900/10 rounded-r-xl">
                  {article.excerpt}
                </p>
              </div>
            )}

            {/* TOC */}
            {tocItems.length > 0 && (
              <div className="px-6 md:px-10 pb-6">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                  <button
                    onClick={() => setShowToc(!showToc)}
                    className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <List size={20} className="text-orange-500" />
                      Mục lục bài viết
                    </h3>
                    <motion.div
                      animate={{ rotate: showToc ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronRight size={20} className="text-slate-400 rotate-90" />
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {showToc && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <ul className="px-5 pb-4 space-y-2">
                          {tocItems.map((item, index) => (
                            <li key={index}>
                              <button
                                onClick={() => scrollToHeading(index)}
                                className="text-sm text-slate-600 dark:text-slate-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors flex items-center gap-3 py-1 text-left w-full"
                              >
                                <span className="w-6 h-6 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-500 text-xs font-bold flex items-center justify-center shrink-0">
                                  {index + 1}
                                </span>
                                {item}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Content */}
            <div className="px-6 md:px-10 py-8 border-t border-slate-100 dark:border-slate-800">
              <div
                className="prose prose-lg dark:prose-invert max-w-none
                  prose-headings:font-bold prose-headings:text-slate-900 dark:prose-headings:text-white prose-headings:scroll-mt-24
                  prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:border-l-4 prose-h2:border-orange-500 prose-h2:pl-4
                  prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
                  prose-p:text-slate-600 dark:prose-p:text-slate-300 prose-p:leading-relaxed prose-p:my-4
                  prose-a:text-orange-500 prose-a:no-underline hover:prose-a:underline
                  prose-img:rounded-2xl prose-img:shadow-xl prose-img:my-8
                  prose-figure:my-8
                  prose-figcaption:text-center prose-figcaption:text-slate-500 prose-figcaption:mt-2
                  prose-blockquote:border-l-4 prose-blockquote:border-orange-500 prose-blockquote:bg-orange-50 dark:prose-blockquote:bg-orange-900/10 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-xl prose-blockquote:not-italic
                  prose-ul:my-4 prose-ol:my-4
                  prose-li:text-slate-600 dark:prose-li:text-slate-300
                  prose-code:bg-slate-100 dark:prose-code:bg-slate-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-orange-500 prose-code:before:content-none prose-code:after:content-none
                  prose-pre:bg-slate-900 prose-pre:shadow-xl prose-pre:rounded-xl
                  prose-table:border prose-table:border-slate-200 dark:prose-table:border-slate-700
                  prose-th:bg-slate-100 dark:prose-th:bg-slate-800 prose-th:p-3
                  prose-td:p-3 prose-td:border prose-td:border-slate-200 dark:prose-td:border-slate-700"
                dangerouslySetInnerHTML={{ __html: processedContent }}
              />
            </div>

            {/* Tags */}
            {article.tags.length > 0 && (
              <div className="px-6 md:px-10 py-6 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag size={16} className="text-slate-400" />
                  {article.tags.map((tag, index) => (
                    <Link
                      key={index}
                      href={`/tag/${tag}`}
                      className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-medium rounded-lg hover:bg-orange-100 hover:text-orange-600 dark:hover:bg-orange-900/30 dark:hover:text-orange-400 transition-colors"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Source */}
            {article.sourceUrl && (
              <div className="px-6 md:px-10 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
                <a
                  href={article.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-slate-500 hover:text-orange-500 transition-colors"
                >
                  <ExternalLink size={14} />
                  <span>Nguồn: {new URL(article.sourceUrl).hostname}</span>
                </a>
              </div>
            )}

            {/* Actions */}
            <div className="px-6 md:px-10 py-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
              {/* Like/Unlike */}
              <div className="flex items-center gap-3">
                <motion.button
                  onClick={() => handleReaction('like')}
                  disabled={isLiking}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                    userReaction === 'like'
                      ? 'bg-green-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-green-100 dark:hover:bg-green-900/30 hover:text-green-600 dark:hover:text-green-400'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ThumbsUp size={18} />
                  <span>{stats.likes}</span>
                </motion.button>

                <motion.button
                  onClick={() => handleReaction('unlike')}
                  disabled={isLiking}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                    userReaction === 'unlike'
                      ? 'bg-red-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ThumbsDown size={18} />
                  <span>{stats.unlikes}</span>
                </motion.button>
              </div>

              {/* Share & Print */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <motion.button
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Share2 size={18} />
                    <span>Chia sẻ</span>
                  </motion.button>

                  <AnimatePresence>
                    {showShareMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute bottom-full mb-2 right-0 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50"
                      >
                        <button
                          onClick={() => handleShare('facebook')}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors w-full"
                        >
                          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                            <Facebook size={16} className="text-white" />
                          </div>
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Facebook</span>
                        </button>
                        <button
                          onClick={() => handleShare('twitter')}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors w-full"
                        >
                          <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center">
                            <Twitter size={16} className="text-white" />
                          </div>
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Twitter</span>
                        </button>
                        <button
                          onClick={handleCopyLink}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors w-full"
                        >
                          <div className="w-8 h-8 bg-slate-500 rounded-lg flex items-center justify-center">
                            {copied ? <Check size={16} className="text-white" /> : <Copy size={16} className="text-white" />}
                          </div>
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                            {copied ? 'Đã sao chép!' : 'Sao chép link'}
                          </span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <motion.button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Printer size={18} />
                  <span>In bài</span>
                </motion.button>
              </div>
            </div>

            {/* Comments Section */}
            <div className="px-6 md:px-10 py-8 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <MessageCircle size={24} className="text-orange-500" />
                Bình luận ({comments.length})
              </h3>

              {/* Comment Form */}
              <form onSubmit={handleCommentSubmit} className="mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shrink-0">
                    {session?.user?.image ? (
                      <Image
                        src={session.user.image}
                        alt={session.user.name || 'User'}
                        width={48}
                        height={48}
                        className="w-full h-full rounded-xl object-cover"
                      />
                    ) : (
                      <User size={24} className="text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm font-medium text-slate-500">Đánh giá:</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setCommentRating(star)}
                            className="transition-transform hover:scale-110"
                          >
                            <Star
                              size={20}
                              className={star <= commentRating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300 dark:text-slate-600'}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="relative">
                      <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder={session ? 'Viết bình luận của bạn...' : 'Đăng nhập để bình luận'}
                        disabled={!session}
                        className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 border-2 border-transparent focus:border-orange-500 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none transition-all resize-none disabled:opacity-50"
                        rows={3}
                      />
                      <motion.button
                        type="submit"
                        disabled={isCommenting || !commentText.trim() || !session}
                        className="absolute bottom-3 right-3 p-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Send size={18} />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </form>

              {/* Comments List */}
              <div className="space-y-6">
                {comments.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageCircle size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                    <p className="text-slate-500 dark:text-slate-400">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
                  </div>
                ) : (
                  comments.map((comment, index) => (
                    <motion.div
                      key={comment.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex gap-4"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center shrink-0 overflow-hidden">
                        {comment.user.image ? (
                          <Image
                            src={comment.user.image}
                            alt={comment.user.name || 'User'}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-white font-bold">
                            {comment.user.name?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {comment.user.name || 'Người dùng'}
                          </span>
                          {comment.rating && (
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  size={12}
                                  className={star <= comment.rating! ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}
                                />
                              ))}
                            </div>
                          )}
                          <span className="text-xs text-slate-400">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300">{comment.content}</p>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </motion.article>

          {/* Sidebar */}
          <aside className="lg:w-80 shrink-0 space-y-6">
            {/* Category Info */}
            {article.categories[0] && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-6"
              >
                <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 bg-orange-500 rounded-full" />
                  Danh mục
                </h3>
                <div className="flex flex-wrap gap-2">
                  {article.categories.map(cat => (
                    <Link
                      key={cat.id}
                      href={`/category/${cat.slug}`}
                      className="px-4 py-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 font-bold text-sm rounded-xl hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Related Articles */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-6 sticky top-24"
            >
              <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <span className="w-1 h-5 bg-orange-500 rounded-full" />
                Bài viết liên quan
              </h3>

              <div className="space-y-4">
                {relatedArticles.length === 0 ? (
                  <p className="text-slate-500 text-sm">Không có bài viết liên quan</p>
                ) : (
                  relatedArticles.map((related, index) => (
                    <motion.div
                      key={related.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                    >
                      <Link
                        href={`/article/${related.slug}`}
                        className="flex gap-3 group"
                      >
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                          <Image
                            src={related.thumbnail || '/placeholder.jpg'}
                            alt={related.title}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          {related.categories[0] && (
                            <span className="text-xs font-bold text-orange-500 mb-1 block">
                              {related.categories[0].name}
                            </span>
                          )}
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2 group-hover:text-orange-500 transition-colors">
                            {related.title}
                          </h4>
                          <span className="text-xs text-slate-400 mt-1 block">
                            {formatDate(related.createdAt)}
                          </span>
                        </div>
                      </Link>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </aside>
        </div>
      </div>

      {/* Bottom Spacing */}
      <div className="h-16" />
    </div>
  );
}
