// TopBar.tsx
"use client";
import React, { useState } from 'react';
import { SearchBox } from '../SearchBox';

interface TopBarProps {
  isScrolled: boolean;
}

export function TopBar({ isScrolled }: TopBarProps) {
  const [showSearch, setShowSearch] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-[1280px] mx-auto px-4 lg:px-8">
        <div className="flex h-20 items-center justify-between gap-6">
          {/* Logo */}
          <a className="flex items-center gap-3 shrink-0" href="/">
            <div className="size-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center text-white">
              <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>currency_bitcoin</span>
            </div>
            <div className="hidden md:flex flex-col gap-0">
              <span className="text-orange-600 font-bold text-lg leading-tight">CRYPTO</span>
              <span className="text-gray-500 text-xs font-medium uppercase mt-0">News Portal</span>
            </div>
          </a>

          {/* Search - Desktop */}
          <div className="hidden md:flex max-w-md w-full">
            <SearchBox className="w-full" />
          </div>

          {/* Right side buttons */}
          <div className="flex items-center gap-3 shrink-0">
            <button className="hidden lg:flex items-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-800 px-5 py-2 rounded-full font-medium text-sm leading-normal transition-colors border border-gray-100">
              <span className="material-symbols-outlined text-[20px]">currency_bitcoin</span>
              <span>Bảng giá</span>
            </button>
            <button className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-6 py-2 rounded-full font-medium text-sm leading-normal shadow-md shadow-orange-500/20 transition-all transform hover:translate-y-[-1px]">
              <span className="material-symbols-outlined text-[20px]">login</span>
              <span>Đăng nhập</span>
            </button>
            <button className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-full">
              <span className="material-symbols-outlined">menu</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
