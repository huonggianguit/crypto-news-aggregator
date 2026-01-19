"use client";

import { TrendingUp, Activity, Zap } from "lucide-react";
import Link from "next/link";

const TRENDING_TAGS = [
  { name: "#Bitcoin", change: "+5.2%" },
  { name: "#Ethereum", change: "+2.1%" },
  { name: "#DeFi", change: "+12.4%" },
  { name: "#NFT", change: "-1.2%" },
  { name: "#Web3", change: "+3.8%" },
  { name: "#Solana", change: "+8.5%" },
  { name: "#AI", change: "+15.2%" },
  { name: "#GameFi", change: "+0.5%" },
  { name: "#Layer2", change: "+4.2%" },
  { name: "#Binance", change: "-0.8%" },
];

export default function MarketTicker() {
  return (
    <div className="w-full bg-white dark:bg-slate-950 border-y border-slate-100 dark:border-slate-900 overflow-hidden py-3">
      <div className="max-w-[1400px] mx-auto flex items-center relative">
        {/* Label - Absolute/Sticky on Mobile */}
        <div className="absolute left-0 z-10 bg-white dark:bg-slate-950 pr-4 pl-4 lg:pl-8 flex items-center gap-2 text-orange-600 dark:text-orange-500 font-bold text-sm shadow-[10px_0_20px_-5px_rgba(255,255,255,1)] dark:shadow-[10px_0_20px_-5px_rgba(2,6,23,1)]">
          <Activity size={18} className="animate-pulse" />
          <span className="uppercase tracking-wider hidden md:inline">Thị trường</span>
        </div>

        {/* Marquee Content */}
        <div className="flex overflow-hidden group select-none mask-image-linear-gradient-to-r">
          <div className="flex animate-marquee whitespace-nowrap py-1">
            {[...TRENDING_TAGS, ...TRENDING_TAGS, ...TRENDING_TAGS].map((tag, i) => (
              <div key={`${tag.name}-${i}`} className="mx-6 flex items-center gap-2">
                <Link 
                  href="#" 
                  className="text-slate-600 dark:text-slate-400 font-semibold hover:text-orange-600 dark:hover:text-orange-400 transition-colors text-sm"
                >
                  {tag.name}
                </Link>
                <span className={`text-xs font-bold ${tag.change.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {tag.change}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
