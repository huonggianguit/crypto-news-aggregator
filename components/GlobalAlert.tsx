// components/GlobalAlert.tsx
"use client";
import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, AlertTriangle, Info, CheckCircle, X, LogIn } from 'lucide-react';

type AlertType = 'login-required' | 'warning' | 'info' | 'success' | 'error';

interface AlertConfig {
  type: AlertType;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

interface GlobalAlertContextType {
  showAlert: (config: AlertConfig) => void;
  showLoginRequired: (message?: string, onLogin?: () => void) => void;
  hideAlert: () => void;
}

const GlobalAlertContext = createContext<GlobalAlertContextType | null>(null);

export function useGlobalAlert() {
  const context = useContext(GlobalAlertContext);
  if (!context) {
    throw new Error('useGlobalAlert must be used within GlobalAlertProvider');
  }
  return context;
}

interface GlobalAlertProviderProps {
  children: React.ReactNode;
  onRequestLogin?: () => void;
}

export function GlobalAlertProvider({ children, onRequestLogin }: GlobalAlertProviderProps) {
  const [alert, setAlert] = useState<AlertConfig | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const showAlert = useCallback((config: AlertConfig) => {
    setAlert(config);
    setIsVisible(true);
  }, []);

  const showLoginRequired = useCallback((message?: string, onLogin?: () => void) => {
    setAlert({
      type: 'login-required',
      title: 'Yêu cầu đăng nhập',
      message: message || 'Bạn cần đăng nhập để sử dụng tính năng này.',
      actionLabel: 'Đăng nhập ngay',
      onAction: onLogin || onRequestLogin,
    });
    setIsVisible(true);
  }, [onRequestLogin]);

  const hideAlert = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => setAlert(null), 200);
  }, []);

  const getIcon = () => {
    switch (alert?.type) {
      case 'login-required':
        return <Lock size={32} />;
      case 'warning':
        return <AlertTriangle size={32} />;
      case 'success':
        return <CheckCircle size={32} />;
      case 'error':
        return <AlertTriangle size={32} />;
      default:
        return <Info size={32} />;
    }
  };

  const getColors = () => {
    switch (alert?.type) {
      case 'login-required':
        return {
          bg: 'from-amber-500 to-orange-500',
          iconBg: 'bg-amber-100 dark:bg-amber-900/50',
          iconColor: 'text-amber-600 dark:text-amber-400',
          buttonBg: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600',
        };
      case 'warning':
        return {
          bg: 'from-yellow-500 to-amber-500',
          iconBg: 'bg-yellow-100 dark:bg-yellow-900/50',
          iconColor: 'text-yellow-600 dark:text-yellow-400',
          buttonBg: 'bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600',
        };
      case 'success':
        return {
          bg: 'from-green-500 to-emerald-500',
          iconBg: 'bg-green-100 dark:bg-green-900/50',
          iconColor: 'text-green-600 dark:text-green-400',
          buttonBg: 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600',
        };
      case 'error':
        return {
          bg: 'from-red-500 to-rose-500',
          iconBg: 'bg-red-100 dark:bg-red-900/50',
          iconColor: 'text-red-600 dark:text-red-400',
          buttonBg: 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600',
        };
      default:
        return {
          bg: 'from-blue-500 to-cyan-500',
          iconBg: 'bg-blue-100 dark:bg-blue-900/50',
          iconColor: 'text-blue-600 dark:text-blue-400',
          buttonBg: 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600',
        };
    }
  };

  const colors = getColors();

  return (
    <GlobalAlertContext.Provider value={{ showAlert, showLoginRequired, hideAlert }}>
      {children}

      {/* Global Alert Modal */}
      <AnimatePresence>
        {isVisible && alert && (
          <motion.div
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={hideAlert}
            />

            {/* Modal */}
            <motion.div
              className="relative w-full max-w-sm"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
              {/* Glow effect */}
              <div className={`absolute -inset-1 bg-gradient-to-r ${colors.bg} rounded-[28px] opacity-50 blur-xl`} />

              <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden">
                {/* Top gradient line */}
                <div className={`h-1.5 bg-gradient-to-r ${colors.bg}`} />

                {/* Close button */}
                <button
                  onClick={hideAlert}
                  className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  <X size={18} />
                </button>

                {/* Content */}
                <div className="p-8 text-center">
                  {/* Icon */}
                  <motion.div
                    className={`w-20 h-20 mx-auto mb-5 rounded-2xl ${colors.iconBg} flex items-center justify-center`}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                  >
                    <div className={colors.iconColor}>
                      {getIcon()}
                    </div>
                  </motion.div>

                  {/* Title */}
                  <motion.h3
                    className="text-xl font-black text-slate-900 dark:text-white mb-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                  >
                    {alert.title}
                  </motion.h3>

                  {/* Message */}
                  <motion.p
                    className="text-slate-500 dark:text-slate-400 text-sm mb-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {alert.message}
                  </motion.p>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <motion.button
                      onClick={hideAlert}
                      className="flex-1 py-3 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-sm transition-all"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Đóng
                    </motion.button>

                    {alert.actionLabel && alert.onAction && (
                      <motion.button
                        onClick={() => {
                          hideAlert();
                          alert.onAction?.();
                        }}
                        className={`flex-1 py-3 px-4 ${colors.buttonBg} text-white rounded-xl font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {alert.type === 'login-required' && <LogIn size={16} />}
                        {alert.actionLabel}
                      </motion.button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlobalAlertContext.Provider>
  );
}
