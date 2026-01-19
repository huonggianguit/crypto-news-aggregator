"use client";

import React, { useState, useEffect } from "react";
import { Category } from "@prisma/client";
import Link from "next/link";
import { ChevronDown, ArrowRight, BookOpen, BarChart2, Shield, HelpCircle, Activity } from "lucide-react";

interface NavigationProps {
  isScrolled: boolean;
  categories: Category[];
}

export function Navigation({ isScrolled, categories = [] }: NavigationProps) {
  const [activeNewsCategory, setActiveNewsCategory] = useState<Category | null>(null);

  const newsCategoryNames = ["Tin Bitcoin", "Tin Ethereum", "Tin Altcoin", "Tin thị trường"];
  
  // Get categories from props or fallback to dummy data if not found (for UI demo)
  const dbCategories = newsCategoryNames
    .map(name => categories.find(c => c.name === name))
    .filter((c): c is Category => !!c);

  const fallbackCategories: any[] = [
    { 
      id: 'btc', name: 'Tin Bitcoin', slug: 'tin-bitcoin', 
      metaTitle: 'Tin tức Bitcoin mới nhất', 
      metaDesc: 'Cập nhật tin tức Bitcoin (BTC) mới nhất 24h.', 
      introText: 'Chuyên mục cập nhật liên tục các tin tức nóng hổi nhất về Bitcoin.',
      createdAt: new Date() 
    },
    { 
      id: 'eth', name: 'Tin Ethereum', slug: 'tin-ethereum',
      metaTitle: 'Tin tức Ethereum (ETH)',
      metaDesc: 'Thông tin mới nhất về Ethereum (ETH) và hệ sinh thái DeFi.',
      introText: 'Theo dõi sát sao mọi chuyển động của Ethereum (ETH).',
      createdAt: new Date()
    },
    { 
      id: 'alt', name: 'Tin Altcoin', slug: 'tin-altcoin',
      metaTitle: 'Tin tức Altcoin',
      metaDesc: 'Cập nhật tin tức Altcoin hôm nay.',
      introText: 'Thế giới Altcoin luôn sôi động với hàng nghìn dự án mới.',
      createdAt: new Date()
    },
    { 
      id: 'market', name: 'Tin thị trường', slug: 'tin-thi-truong',
      metaTitle: 'Tin thị trường Crypto',
      metaDesc: 'Tổng hợp tin tức thị trường tiền điện tử.',
      introText: 'Cái nhìn toàn cảnh về thị trường tài chính và tiền điện tử.',
      createdAt: new Date()
    }
  ];

  const newsCategories = dbCategories.length > 0 ? dbCategories : fallbackCategories;

  useEffect(() => {
    if (newsCategories.length > 0 && !activeNewsCategory) {
      setActiveNewsCategory(newsCategories[0]);
    }
  }, [newsCategories, activeNewsCategory]);

  const getSubmenu = (group: string) => {
    const mapping: { [key: string]: string[] } = {
      "Phân tích": ["Phân tích kỹ thuật", "Phân tích on-chain", "Dự báo thị trường"],
    };
    const submenuItems = mapping[group] || [];
    return submenuItems.map(label => {
      const category = categories.find(c => c.name === label);
      return { label, href: category ? `/${category.slug}` : "#" };
    });
  };

  const menuItems = [
    { label: "Trang chủ", href: "/", active: true },
    { label: "Tin tức", isMegaMenu: true, href: "/tin-tuc", icon: <Activity size={16} /> },
    { label: "Phân tích", submenu: getSubmenu("Phân tích"), icon: <BarChart2 size={16} /> },
    { label: "Kiến thức", submenu: [
      { label: "Tài nguyên học tập", href: "/tai-nguyen-hoc-tap" },
      { label: "Khóa học & Công cụ", href: "/khoa-hoc-cong-cu" },
    ], icon: <BookOpen size={16} /> },
    { label: "Pháp lý", href: "/van-ban-phap-ly", icon: <Shield size={16} /> },
    { label: "Hướng dẫn", submenu: [
      { label: "Mua bán crypto", href: "/mua-ban-crypto" },
      { label: "Sử dụng ví", href: "/quan-ly-vi" },
      { label: "Trading cơ bản", href: "/trading-co-ban" },
      { label: "Bảo mật tài khoản", href: "/bao-mat-tai-khoan" },
    ], icon: <HelpCircle size={16} /> },
  ];

  const getCategoryIcon = (name: string) => {
    const icons: { [key: string]: string } = {
      "Tin Bitcoin": "₿",
      "Tin Ethereum": "Ξ",
      "Tin Altcoin": "✦",
      "Tin thị trường": "◈",
    };
    return icons[name] || "•";
  };

  return (
    <nav className="w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 hidden lg:block sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
        {/* Centered menu */}
        <ul className="flex items-center justify-center gap-1">
          {menuItems.map((item, index) => (
            <li key={index} className={`group ${item.isMegaMenu ? '' : 'relative'}`}>
              <Link
                href={item.href || "#"}
                className="relative flex items-center gap-1.5 px-5 py-5 text-[15px] font-bold text-slate-700 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-500 transition-colors duration-200"
              >
                <span className="tracking-tight">{item.label}</span>

                {(item.submenu || item.isMegaMenu) && (
                  <ChevronDown className="w-4 h-4 opacity-50 transition-transform duration-300 group-hover:rotate-180" />
                )}

                {/* Hover line effect */}
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-orange-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-left" />
              </Link>

              {/* Dropdown Menu */}
              {item.submenu && !item.isMegaMenu && (
                <div className="absolute left-0 top-full pt-2 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200 ease-out z-50">
                  <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-100 dark:border-slate-800 overflow-hidden min-w-[240px] p-2">
                    {item.submenu.map((sub, i) => (
                      <Link
                        key={i}
                        href={sub.href}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 group-hover:bg-orange-500 transition-colors" />
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Mega Menu */}
              {item.isMegaMenu && newsCategories.length > 0 && (
                <div className="absolute left-0 right-0 top-full pt-2 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 ease-out z-50 flex justify-center">
                  
                  <div className="w-full max-w-4xl mx-4 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-100 dark:border-slate-800 overflow-hidden flex">
                    
                    {/* Left - Categories */}
                    <div className="w-1/3 p-4 bg-slate-50 dark:bg-slate-950/50 border-r border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-2">Danh mục</p>
                      <div className="space-y-1">
                        {newsCategories.map((cat) => (
                          <Link
                            key={cat.id}
                            href={`/${cat.slug}`}
                            onMouseEnter={() => setActiveNewsCategory(cat)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                              activeNewsCategory?.id === cat.id
                                ? "bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 shadow-sm"
                                : "text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50"
                            }`}
                          >
                            <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg font-bold transition-colors ${
                              activeNewsCategory?.id === cat.id
                                ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600"
                                : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                            }`}>
                              {getCategoryIcon(cat.name)}
                            </span>
                            <span className="font-bold text-sm tracking-tight">{cat.name}</span>
                            {activeNewsCategory?.id === cat.id && (
                              <ArrowRight size={16} className="ml-auto" />
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Right - Preview */}
                    <div className="flex-1 p-6 relative">
                      {activeNewsCategory && (
                        <div className="h-full flex flex-col animate-fadeIn">
                          <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                            <span className="text-9xl font-black">{getCategoryIcon(activeNewsCategory.name)}</span>
                          </div>

                          <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4">
                              <span className="px-2.5 py-1 rounded-md bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-bold uppercase tracking-wider">
                                Featured
                              </span>
                              <span className="text-slate-400 text-xs font-medium flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Live Updates
                              </span>
                            </div>

                            <h4 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
                              {activeNewsCategory.metaTitle || activeNewsCategory.name}
                            </h4>
                            
                            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6 max-w-md line-clamp-3">
                              {activeNewsCategory.introText || activeNewsCategory.metaDesc || "Cập nhật tin tức, phân tích và xu hướng mới nhất về thị trường Crypto."}
                            </p>

                            <Link
                              href={`/${activeNewsCategory.slug}`}
                              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-sm hover:scale-105 transition-transform"
                            >
                              Xem tất cả tin tức
                              <ArrowRight size={16} />
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </nav>
  );
}

export default Navigation;
