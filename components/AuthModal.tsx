// components/AuthModal.tsx
"use client";
import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff, Loader2, ArrowRight, Sparkles } from 'lucide-react';
import { signIn, useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = 'login' | 'register';

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const router = useRouter();
  const { update: updateSession } = useSession();
  const [mode, setMode] = useState<AuthMode>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Reset form when modal opens/closes or mode changes
  useEffect(() => {
    if (isOpen) {
      setError('');
      setSuccess('');
    }
  }, [isOpen, mode]);

  // Close on Escape key and prevent body scroll
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      if (mode === 'register') {
        // Validate
        if (password !== confirmPassword) {
          setError('Mật khẩu xác nhận không khớp');
          setIsLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('Mật khẩu phải có ít nhất 6 ký tự');
          setIsLoading(false);
          return;
        }

        // Register
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'Đăng ký thất bại');
          setIsLoading(false);
          return;
        }

        setSuccess('Đăng ký thành công! Đang đăng nhập...');

        // Auto login after register
        setTimeout(async () => {
          const result = await signIn('credentials', {
            email,
            password,
            redirect: false,
          });

          if (result?.ok) {
            onClose();
            window.location.href = window.location.pathname;
          }
        }, 1000);

      } else {
        // Login
        const result = await signIn('credentials', {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
          setError('Email hoặc mật khẩu không đúng');
          setIsLoading(false);
          return;
        }

        if (result?.ok) {
          onClose();
          window.location.href = window.location.pathname;
        }
      }
    } catch (err) {
      setError('Có lỗi xảy ra. Vui lòng thử lại.');
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    await signIn('google', { callbackUrl: '/' });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop with blur */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            className="relative w-full max-w-md"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            {/* Glowing background effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 rounded-[28px] opacity-75 blur-lg animate-pulse" />

            <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden">
              {/* Decorative gradient top */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500" />

              {/* Decorative circles */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl" />

              {/* Close button */}
              <motion.button
                onClick={onClose}
                className="absolute top-4 right-4 p-2.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all z-10"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <X size={20} />
              </motion.button>

              {/* Header */}
              <div className="pt-8 pb-6 px-8 text-center relative">
                <motion.div
                  className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-xl shadow-orange-500/30 mb-4"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                >
                  <Sparkles size={32} className="text-white" />
                </motion.div>
                <motion.h2
                  className="text-2xl font-black text-slate-900 dark:text-white tracking-tight"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  {mode === 'login' ? 'Chào mừng trở lại!' : 'Tạo tài khoản mới'}
                </motion.h2>
                <motion.p
                  className="text-slate-500 dark:text-slate-400 mt-2 text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {mode === 'login'
                    ? 'Đăng nhập để theo dõi tin tức crypto'
                    : 'Đăng ký để nhận thông báo tin tức mới nhất'}
                </motion.p>
              </div>

              {/* Mode toggle */}
              <div className="px-8 mb-6">
                <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1.5 relative">
                  <motion.div
                    className="absolute top-1.5 bottom-1.5 bg-white dark:bg-slate-700 rounded-lg shadow-sm"
                    layoutId="activeAuthTab"
                    initial={false}
                    animate={{
                      left: mode === 'login' ? '6px' : '50%',
                      width: 'calc(50% - 9px)',
                    }}
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                  <button
                    onClick={() => setMode('login')}
                    className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-colors relative z-10 ${
                      mode === 'login'
                        ? 'text-orange-600 dark:text-orange-400'
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    Đăng nhập
                  </button>
                  <button
                    onClick={() => setMode('register')}
                    className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-colors relative z-10 ${
                      mode === 'register'
                        ? 'text-orange-600 dark:text-orange-400'
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    Đăng ký
                  </button>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="px-8 pb-8">
                {/* Error/Success messages */}
                <AnimatePresence mode="wait">
                  {error && (
                    <motion.div
                      className="mb-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium"
                      initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                      animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    >
                      {error}
                    </motion.div>
                  )}
                  {success && (
                    <motion.div
                      className="mb-4 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 text-sm font-medium"
                      initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                      animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    >
                      {success}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Name field (register only) */}
                <AnimatePresence mode="wait">
                  {mode === 'register' && (
                    <motion.div
                      className="mb-4"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Họ và tên
                      </label>
                      <div className="relative group">
                        <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Nguyễn Văn A"
                          required
                          className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-orange-500 dark:focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all text-sm font-medium placeholder:text-slate-400"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Email field */}
                <motion.div
                  className="mb-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Email
                  </label>
                  <div className="relative group">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@example.com"
                      required
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-orange-500 dark:focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all text-sm font-medium placeholder:text-slate-400"
                    />
                  </div>
                </motion.div>

                {/* Password field */}
                <motion.div
                  className="mb-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Mật khẩu
                  </label>
                  <div className="relative group">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="w-full pl-12 pr-12 py-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-orange-500 dark:focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all text-sm font-medium placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </motion.div>

                {/* Confirm password field (register only) */}
                <AnimatePresence mode="wait">
                  {mode === 'register' && (
                    <motion.div
                      className="mb-4"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Xác nhận mật khẩu
                      </label>
                      <div className="relative group">
                        <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          minLength={6}
                          className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-orange-500 dark:focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all text-sm font-medium placeholder:text-slate-400"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Forgot password (login only) */}
                {mode === 'login' && (
                  <motion.div
                    className="mb-6 text-right"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <button type="button" className="text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 font-bold">
                      Quên mật khẩu?
                    </button>
                  </motion.div>
                )}

                {/* Submit button */}
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-sm"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <>
                      <span>{mode === 'login' ? 'Đăng nhập' : 'Đăng ký'}</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </motion.button>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t-2 border-slate-100 dark:border-slate-800" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white dark:bg-slate-900 text-slate-400 font-medium">hoặc tiếp tục với</span>
                  </div>
                </div>

                {/* Google login */}
                <motion.button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-full py-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span>Đăng nhập với Google</span>
                </motion.button>

                {/* Terms */}
                <p className="mt-6 text-center text-xs text-slate-400 dark:text-slate-500">
                  Bằng việc tiếp tục, bạn đồng ý với{' '}
                  <a href="/dieu-khoan-su-dung" className="text-orange-600 dark:text-orange-400 hover:underline font-medium">
                    Điều khoản sử dụng
                  </a>{' '}
                  và{' '}
                  <a href="/chinh-sach-bao-mat" className="text-orange-600 dark:text-orange-400 hover:underline font-medium">
                    Chính sách bảo mật
                  </a>
                </p>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
