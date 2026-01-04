// components/SearchBox.tsx
"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Clock } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface SearchResult {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  main_img: string;
  category: {
    name: string;
    slug: string;
  };
  createdAt: string;
}

interface SearchBoxProps {
  className?: string;
}

export function SearchBox({ className = '' }: SearchBoxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search API call with debounce
  useEffect(() => {
    if (query.trim() === '') {
      setResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        setResults(data.results || []);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300); // Debounce 300ms

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Save to recent searches
  const saveToRecentSearches = (searchQuery: string) => {
    if (searchQuery.trim()) {
      const updated = [
        searchQuery,
        ...recentSearches.filter(s => s !== searchQuery)
      ].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
    }
  };

  const handleRecentSearchClick = (searchQuery: string) => {
    setQuery(searchQuery);
    setIsOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.trim()) {
      saveToRecentSearches(query);
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const handleResultClick = () => {
    // Save current search to recent when clicking on result
    if (query.trim()) {
      saveToRecentSearches(query);
    }
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder="Tìm kiếm tin tức crypto, Bitcoin, Ethereum..."
          className="w-full pl-12 pr-10 py-2 rounded-full bg-gray-50 border-transparent focus:bg-white focus:border-orange-600/20 focus:ring-4 focus:ring-orange-600/5 text-sm leading-normal transition-all duration-300 placeholder:text-gray-400"
        />
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          search
        </span>
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-2xl border border-gray-100 max-h-[500px] overflow-y-auto z-50">
          {isLoading && (
            <div className="p-4 text-center text-gray-500">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
            </div>
          )}

          {!isLoading && query && results.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <Search size={48} className="mx-auto mb-3 text-gray-300" />
              <p>Không tìm thấy kết quả nào cho &quot;{query}&quot;</p>
            </div>
          )}

          {!isLoading && query && results.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs text-gray-500 font-semibold border-b">
                Tìm thấy {results.length} kết quả
              </div>
              {results.map((result) => (
                <Link
                  key={result.id}
                  href={`/article/${result.slug}`}
                  onClick={handleResultClick}
                  className="flex gap-3 p-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0"
                >
                  <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={result.main_img}
                      alt={result.title}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-gray-900 line-clamp-2 mb-1">
                      {result.title}
                    </h4>
                    {result.description && (
                      <p className="text-xs text-gray-600 line-clamp-2 mb-1">
                        {result.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="px-2 py-0.5 bg-orange-50 text-orange-600 rounded">
                        {result.category.name}
                      </span>
                      <span>•</span>
                      <span>{new Date(result.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!query && recentSearches.length > 0 && (
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-semibold text-gray-500">Tìm kiếm gần đây</h4>
                <button
                  onClick={clearRecentSearches}
                  className="text-xs text-orange-600 hover:text-orange-700"
                >
                  Xóa tất cả
                </button>
              </div>
              <div className="space-y-1">
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleRecentSearchClick(search)}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-left"
                  >
                    <Clock size={14} className="text-gray-400" />
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
