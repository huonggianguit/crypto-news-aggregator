// TopBar.tsx
"use client";
import React, { useState, useRef, useEffect } from 'react';
import { SearchBox } from '../SearchBox';
import { useAuthModal } from '../Providers';
import { TrendingUp, LogIn, Menu, User, LogOut, ChevronDown } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface TopBarProps {
  isScrolled: boolean;
}

export function TopBar({ isScrolled }: TopBarProps) {
  const { data: session, status } = useSession();
  const { openAuthModal } = useAuthModal();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setShowUserMenu(false);
    await signOut({ callbackUrl: '/' });
  };

  return (
    <div className="relative z-[100] w-full bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
        <div className="flex h-20 items-center justify-between gap-6">
          {/* Logo */}
          <a className="flex items-center gap-3 shrink-0 group" href="/">
            <div className="size-11 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-500/30 group-hover:scale-105 transition-transform">
              <span className="text-2xl font-black">₿</span>
            </div>
            <div className="hidden md:flex flex-col gap-0.5">
              <span className="text-orange-600 dark:text-orange-500 font-black text-lg leading-tight tracking-tight">CRYPTO</span>
              <span className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider">News Portal</span>
            </div>
          </a>

          {/* Search - Desktop */}
          <div className="hidden md:flex max-w-2xl w-full">
            <SearchBox className="w-full" />
          </div>

          {/* Right side buttons */}
          <div className="flex items-center gap-3 shrink-0">
            <button className="hidden lg:flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-5 py-2.5 rounded-xl font-bold text-sm transition-all hover:scale-105">
              <TrendingUp size={18} />
              <span>Bảng giá</span>
            </button>

            {/* Auth Section */}
            {status === 'loading' ? (
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ) : session?.user ? (
              // User is logged in - Show avatar dropdown
              <div ref={userMenuRef} className="relative">
                <motion.button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1.5 pr-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="relative w-9 h-9 rounded-lg overflow-hidden bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                    {session.user.image ? (
                      <Image
                        src={session.user.image}
                        alt={session.user.name || 'User'}
                        width={36}
                        height={36}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-bold text-sm">
                        {session.user.name?.charAt(0).toUpperCase() || session.user.email?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                  <span className="hidden sm:block text-sm font-bold text-slate-700 dark:text-slate-200 max-w-[100px] truncate">
                    {session.user.name || session.user.email?.split('@')[0]}
                  </span>
                  <motion.div
                    animate={{ rotate: showUserMenu ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown size={16} className="text-slate-400" />
                  </motion.div>
                </motion.button>

                {/* User Dropdown Menu */}
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
                      style={{ zIndex: 9999 }}
                    >
                      {/* User Info Header */}
                      <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                            {session.user.image ? (
                              <Image
                                src={session.user.image}
                                alt={session.user.name || 'User'}
                                width={48}
                                height={48}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-white font-bold text-lg">
                                {session.user.name?.charAt(0).toUpperCase() || session.user.email?.charAt(0).toUpperCase() || 'U'}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-900 dark:text-white truncate">
                              {session.user.name || 'Người dùng'}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                              {session.user.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="p-2">
                        <motion.a
                          href="/tai-khoan"
                          className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium text-sm"
                          whileHover={{ x: 4 }}
                          onClick={() => setShowUserMenu(false)}
                        >
                          <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <User size={18} className="text-blue-600 dark:text-blue-400" />
                          </div>
                          <span>Thông tin cá nhân</span>
                        </motion.a>

                        <motion.button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium text-sm w-full"
                          whileHover={{ x: 4 }}
                        >
                          <div className="w-9 h-9 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                            <LogOut size={18} className="text-red-600 dark:text-red-400" />
                          </div>
                          <span>Đăng xuất</span>
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              // User is not logged in - Show login button
              <motion.button
                onClick={openAuthModal}
                className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-orange-500/30 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <LogIn size={18} />
                <span className="hidden sm:inline">Đăng nhập</span>
              </motion.button>
            )}

            <button className="lg:hidden p-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
              <Menu size={22} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
