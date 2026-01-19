// GlobalHeader.tsx
"use client";
import React, { useEffect, useState } from 'react';
import { TopBar } from './TopBar';
import { Navigation } from './Navigation';
import { Category } from '@prisma/client';

interface GlobalHeaderProps {
  categories?: Category[];
}

export function GlobalHeader({ categories = [] }: GlobalHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-xl shadow-lg shadow-gray-900/5'
          : 'bg-white'
      }`}
    >
      <TopBar isScrolled={isScrolled} />
      <Navigation isScrolled={isScrolled} categories={categories} />
    </header>
  );
}
