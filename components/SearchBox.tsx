// components/SearchBox.tsx
"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Clock, Sparkles, Loader2, Zap, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useGlobalAlert } from './GlobalAlert';
import Link from 'next/link';
import Image from 'next/image';

interface SearchResult {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  thumbnail: string | null;
  category?: {
    name: string;
    slug: string;
  };
  createdAt: string;
  similarity?: number;
}

interface SearchBoxProps {
  className?: string;
}

export function SearchBox({ className = '' }: SearchBoxProps) {
  const { data: session } = useSession();
  const { showLoginRequired } = useGlobalAlert();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [aiEnabled, setAiEnabled] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) setRecentSearches(JSON.parse(saved));
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Normal search with debounce
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    // If AI is enabled, don't auto-search
    if (aiEnabled) {
      setResults([]);
      return;
    }

    const loadingTimeout = setTimeout(() => setIsLoading(true), 100);

    const searchTimeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setResults(data.results || []);
      } catch (e) {
        console.error('[SearchBox] Error:', e);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => {
      clearTimeout(loadingTimeout);
      clearTimeout(searchTimeout);
    };
  }, [query, aiEnabled]);

  // Handle AI toggle
  const handleAiToggle = () => {
    if (!session) {
      // Not logged in - show global alert
      showLoginRequired('Bạn cần đăng nhập để sử dụng tính năng AI Search. Đăng nhập ngay để trải nghiệm tìm kiếm thông minh!');
      return;
    }
    setAiEnabled(!aiEnabled);
    setResults([]);
  };

  // AI search
  const handleAISearch = async () => {
    if (!query.trim() || !session) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/search/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      setResults(data.results || []);
      saveRecent(query);
    } catch (e) {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const saveRecent = (q: string) => {
    if (!q.trim()) return;
    const updated = [q, ...recentSearches.filter(s => s !== q)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query.trim()) {
      if (aiEnabled && session) handleAISearch();
      else saveRecent(query);
    }
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input Container */}
      <motion.div
        className={`relative flex items-center bg-white dark:bg-slate-900 rounded-2xl border-2 transition-all duration-300 ${
          isOpen
            ? 'border-orange-500 shadow-xl shadow-orange-500/10'
            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
        }`}
        initial={false}
        animate={{ scale: isOpen ? 1.01 : 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        {/* Search Icon */}
        <div className="pl-4 pr-2">
          <motion.div
            animate={{ rotate: isLoading ? 360 : 0 }}
            transition={{ duration: 1, repeat: isLoading ? Infinity : 0, ease: "linear" }}
          >
            {isLoading ? (
              <Loader2 size={20} className="text-orange-500" />
            ) : (
              <Search size={20} className="text-slate-400" />
            )}
          </motion.div>
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={aiEnabled ? 'Tìm kiếm thông minh với AI...' : 'Tìm kiếm tin tức...'}
          className="flex-1 py-3.5 bg-transparent text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none min-w-0"
        />

        {/* Clear Button */}
        <AnimatePresence>
          {query && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => { setQuery(''); setResults([]); inputRef.current?.focus(); }}
              className="p-1.5 mr-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X size={16} />
            </motion.button>
          )}
        </AnimatePresence>

        {/* AI Toggle Switch */}
        <div className="flex items-center gap-2 pr-3">
          <motion.button
            onClick={handleAiToggle}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              aiEnabled
                ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/25'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Sparkles size={14} />
            <span>AI</span>
            {!session && (
              <Lock size={10} className="ml-0.5" />
            )}
          </motion.button>

          {/* AI Search Button - Only when AI is enabled */}
          <AnimatePresence>
            {aiEnabled && query && session && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8, width: 0 }}
                animate={{ opacity: 1, scale: 1, width: 'auto' }}
                exit={{ opacity: 0, scale: 0.8, width: 0 }}
                onClick={handleAISearch}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-violet-500/25 transition-all disabled:opacity-50 overflow-hidden whitespace-nowrap"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
                Tìm
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Dropdown Results */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="absolute top-full left-0 right-0 mt-3 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[70vh] overflow-hidden"
            style={{ zIndex: 9999 }}
          >
            {/* Loading State */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-8 flex flex-col items-center justify-center"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-10 h-10 rounded-full border-4 border-orange-500 border-t-transparent"
                />
                <p className="mt-4 text-sm font-medium text-slate-500">
                  {aiEnabled ? '🤖 AI đang phân tích...' : 'Đang tìm kiếm...'}
                </p>
              </motion.div>
            )}

            {/* AI Mode Info */}
            {!isLoading && aiEnabled && !query && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 text-center"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-violet-100 to-fuchsia-100 dark:from-violet-900/30 dark:to-fuchsia-900/30 flex items-center justify-center">
                  <Sparkles size={28} className="text-violet-500" />
                </div>
                <p className="font-bold text-slate-700 dark:text-slate-300">AI Search đang bật</p>
                <p className="text-sm text-slate-500 mt-1">Nhập từ khóa và nhấn "Tìm" để tìm kiếm thông minh</p>
              </motion.div>
            )}

            {/* No Results */}
            {!isLoading && query && results.length === 0 && !aiEnabled && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 text-center"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <Search size={24} className="text-slate-400" />
                </div>
                <p className="font-bold text-slate-700 dark:text-slate-300">Không tìm thấy kết quả</p>
                <p className="text-sm text-slate-500 mt-1">Thử từ khóa khác hoặc bật AI Search</p>
              </motion.div>
            )}

            {/* Results */}
            {!isLoading && results.length > 0 && (
              <div className="overflow-y-auto max-h-[60vh]">
                <div className="sticky top-0 px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 backdrop-blur-sm flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">
                    {results.length} kết quả
                  </span>
                  {aiEnabled && (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-violet-600 dark:text-violet-400">
                      <Sparkles size={12} />
                      AI Search
                    </span>
                  )}
                </div>

                {results.map((result, index) => (
                  <motion.div
                    key={result.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={`/article/${result.slug}`}
                      onClick={() => { saveRecent(query); setIsOpen(false); setQuery(''); }}
                      className="flex gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all border-b border-slate-100 dark:border-slate-800 last:border-0 group"
                    >
                      <motion.div
                        className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800"
                        whileHover={{ scale: 1.05 }}
                      >
                        <Image
                          src={result.thumbnail || '/placeholder.jpg'}
                          alt={result.title}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2 mb-1.5 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                          {result.title}
                        </h4>
                        {result.excerpt && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-2">
                            {result.excerpt}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-xs">
                          {result.category && (
                            <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-md font-bold">
                              {result.category.name}
                            </span>
                          )}
                          {result.similarity && (
                            <span className="px-2 py-0.5 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-md font-bold">
                              {Math.round(result.similarity * 100)}% khớp
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Recent Searches */}
            {!query && !aiEnabled && recentSearches.length > 0 && (
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                    Tìm kiếm gần đây
                  </span>
                  <button
                    onClick={() => { setRecentSearches([]); localStorage.removeItem('recentSearches'); }}
                    className="text-xs font-bold text-orange-500 hover:text-orange-600"
                  >
                    Xóa
                  </button>
                </div>
                <div className="space-y-1">
                  {recentSearches.map((s, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => { setQuery(s); }}
                      className="flex items-center gap-2 w-full px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                    >
                      <Clock size={14} className="text-slate-400" />
                      {s}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State - No recent, no query, normal mode */}
            {!query && !aiEnabled && recentSearches.length === 0 && (
              <div className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 flex items-center justify-center">
                  <Search size={24} className="text-orange-500" />
                </div>
                <p className="font-bold text-slate-700 dark:text-slate-300">Tìm kiếm tin tức</p>
                <p className="text-sm text-slate-500 mt-1">Nhập từ khóa để tìm kiếm</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
