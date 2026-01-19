// components/Providers.tsx
"use client";
import React, { useState, createContext, useContext, useCallback } from 'react';
import { SessionProvider } from 'next-auth/react';
import { GlobalAlertProvider } from './GlobalAlert';
import { AuthModal } from './AuthModal';

// Auth Modal Context
interface AuthModalContextType {
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

const AuthModalContext = createContext<AuthModalContextType | null>(null);

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error('useAuthModal must be used within Providers');
  }
  return context;
}

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [showAuthModal, setShowAuthModal] = useState(false);

  const openAuthModal = useCallback(() => setShowAuthModal(true), []);
  const closeAuthModal = useCallback(() => setShowAuthModal(false), []);

  return (
    <SessionProvider>
      <AuthModalContext.Provider value={{ openAuthModal, closeAuthModal }}>
        <GlobalAlertProvider onRequestLogin={openAuthModal}>
          {children}
          <AuthModal isOpen={showAuthModal} onClose={closeAuthModal} />
        </GlobalAlertProvider>
      </AuthModalContext.Provider>
    </SessionProvider>
  );
}
