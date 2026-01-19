// app/tai-khoan/page.tsx
"use client";
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, Shield, Camera, Save, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import Image from 'next/image';

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // Initialize form with session data
  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || '');
      setEmail(session.user.email || '');
    }
  }, [session]);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/user/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || 'Cập nhật thất bại' });
        return;
      }

      // Update session
      await update({ name });
      setMessage({ type: 'success', text: 'Cập nhật thành công!' });
      setIsEditing(false);
    } catch (error) {
      setMessage({ type: 'error', text: 'Có lỗi xảy ra. Vui lòng thử lại.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const user = session.user;
  const createdAt = new Date().toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
            Thông tin cá nhân
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Quản lý thông tin tài khoản của bạn
          </p>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl overflow-hidden"
        >
          {/* Cover & Avatar */}
          <div className="relative h-32 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500">
            <div className="absolute -bottom-16 left-8">
              <div className="relative">
                <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-white dark:border-slate-900 shadow-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt={user.name || 'User'}
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-bold text-4xl">
                      {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  )}
                </div>
                <button className="absolute bottom-2 right-2 p-2 bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:scale-110 transition-transform">
                  <Camera size={16} className="text-slate-600 dark:text-slate-400" />
                </button>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="pt-20 px-8 pb-8">
            {/* Message */}
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
                  message.type === 'success'
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'
                }`}
              >
                {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                <span className="font-medium">{message.text}</span>
              </motion.div>
            )}

            {/* Name & Role */}
            <div className="flex items-start justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {user.name || 'Người dùng'}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-bold rounded-full">
                    {(user as any).role === 'ADMIN' ? 'Quản trị viên' : 'Thành viên'}
                  </span>
                </div>
              </div>
              {!isEditing ? (
                <motion.button
                  onClick={() => setIsEditing(true)}
                  className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-sm transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Chỉnh sửa
                </motion.button>
              ) : (
                <div className="flex gap-2">
                  <motion.button
                    onClick={() => {
                      setIsEditing(false);
                      setName(user.name || '');
                    }}
                    className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-sm transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Hủy
                  </motion.button>
                  <motion.button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-orange-500/30 transition-all flex items-center gap-2 disabled:opacity-50"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Lưu
                  </motion.button>
                </div>
              )}
            </div>

            {/* Info Fields */}
            <div className="space-y-6">
              {/* Name */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                  <User size={22} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">
                    Họ và tên
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-orange-500 dark:focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all font-medium"
                      placeholder="Nhập họ và tên"
                    />
                  ) : (
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">
                      {user.name || 'Chưa cập nhật'}
                    </p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                  <Mail size={22} className="text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">
                    Email
                  </label>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">
                    {user.email}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    Email không thể thay đổi
                  </p>
                </div>
              </div>

              {/* Created At */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                  <Calendar size={22} className="text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">
                    Ngày tham gia
                  </label>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">
                    {createdAt}
                  </p>
                </div>
              </div>

              {/* Account Type */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                  <Shield size={22} className="text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">
                    Loại tài khoản
                  </label>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">
                      {user.image ? 'Google' : 'Email & Mật khẩu'}
                    </p>
                    {user.image && (
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-8"
        >
          <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-4">
            Vùng nguy hiểm
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
            Xóa tài khoản của bạn sẽ xóa vĩnh viễn tất cả dữ liệu liên quan. Hành động này không thể hoàn tác.
          </p>
          <button className="px-5 py-2.5 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-xl font-bold text-sm transition-all">
            Xóa tài khoản
          </button>
        </motion.div>
      </div>
    </div>
  );
}
